import express from 'express'
import cors from 'cors'
import http from 'node:http'
import { Server } from 'socket.io'
import { Redis } from 'ioredis'
import dotenv from 'dotenv'
dotenv.config()

const app = express()
app.use(cors())

const REDIS_CONNECTION_URL = process.env.REDIS_CONNECTION_URL as string
const redis = new Redis(REDIS_CONNECTION_URL)
const subRedis = new Redis(REDIS_CONNECTION_URL)


const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:3000'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
subRedis.on("message", (channel, message) => {
  io.to(channel).emit("room-update", message)
})
subRedis.on("error", (err) => {
  console.error(err)
})

io.on("connection", async (socket) => {
  const { id } = socket
  socket.on("join-room", async (room: string) => {
    const subscribedRooms = await redis.smembers(`subscribed-rooms`)
    await socket.join(room)
    await redis.sadd(`rooms:${id}`, room)
    await redis.hincrby(`room-connection`, room, 1)

    if (!subscribedRooms.includes(room)) {
      subRedis.subscribe(room, async (err) => {
        if (err) {
          console.error(err)
        } else {
          await redis.sadd(`subscribed-rooms`, room)
        }
      })
      await redis.sadd(`subscribed-rooms`, room)
    }
  })
})

io.on("disconnect", async (socket) => {
  const { id } = socket
  const rooms = await redis.smembers(`rooms:${id}`)
  await redis.del(`rooms:${id}`)
  rooms.forEach(async (room) => {
    const remainingConnections = await redis.hincrby(`room-connections`, room, -1)
    if (remainingConnections === 0) {
      await redis.hdel(`room-connections`, room)
      subRedis.unsubscribe(room, async (err) => {
        if (err) {
          console.error(err)
        } else {
          await redis.srem(`subscribed-rooms`, room)
        }
      })
    }
  })
})

const PORT = process.env.APP_PORT || 8080
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})