'use server'

import { redirect } from "next/navigation"
import { redis } from '@/lib/redis'
export const createTopic = async ({ topicName }: { topicName: string }) => {
  const regex = /^[a-zA-Z-]+$/
  if (!topicName || (topicName.length > 50)) {
    return { error: "Topic name is required and must be less than 50 characters" }
  }
  if (!regex.test(topicName)) {
    return { error: "Topic name must only contain letters and dashes" }
  }
  await redis.sadd("existing-topics", topicName)
  redirect(`/${topicName}`)
}

function wordFreq(text: string): { text: string, value: number }[] {
  const words = text.replace(/\./g, "").split(/\s/)
  const freqMap: Record<string, number> = {}

  for (const w of words) {
    if (!freqMap[w]) {
      freqMap[w] = 0
    }
    freqMap[w]++
  }
  return Object.keys(freqMap).map((key) => {
    return { text: key, value: freqMap[key] }
  })
}
export const submitComment = async ({ topic, comment }: { topic: string, comment: string }) => {
  const words = wordFreq(comment)
  await Promise.all(words.map(async (word) => {
    await redis.zadd(`room:${topic}`, { incr: true }, { member: word.text, score: word.value })
  }))
  await redis.incr("served-requests")
  await redis.publish(`room:${topic}`, words)
  return comment
}