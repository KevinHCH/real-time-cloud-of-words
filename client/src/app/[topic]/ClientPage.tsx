"use client"
import MaxWidthWrapper from "@/components/MaxWidthWrapper"
import { useState, useEffect } from "react"
import { Wordcloud } from "@visx/wordcloud"
import { scaleLog } from "@visx/scale"
import { Text } from "@visx/text"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { submitComment } from "@/app/actions"
import { useMutation } from "@tanstack/react-query"
import { io } from "socket.io-client"

const socket = io("http://127.0.0.1:8080")
interface ClientPageProps {
  topicName: string
  initialData: { text: string; value: number }[]
}

const COLORS = ["#143059", "#2F6B9A", "#82a6c2"]

export default function ClientPage({
  topicName,
  initialData,
}: ClientPageProps) {
  const [words, setWords] = useState(initialData)
  const [input, setInput] = useState("")

  useEffect(() => {
    socket.emit("join-room", `room:${topicName}`)
  }, [])

  useEffect(() => {
    socket.on("room-update", (data) => {
      const message = JSON.parse(data) as { text: string; value: number }[]
      message.map((newWord) => {
        const isWordAlreadyIncluded = words.some(
          (word) => word.text === newWord.text
        )
        if (isWordAlreadyIncluded) {
          setWords((prev) => {
            const before = prev.find((word) => word.text === newWord.text)
            const rest = prev.filter((word) => word.text === newWord.text)
            return [
              ...rest,
              { text: before!.text, value: before!.value + newWord.value },
            ]
          })
        } else if (words.length < 50) {
          setWords((prev) => [...prev, newWord])
        }
      })
    })
    return () => {
      socket.off("room-update")
    }
  }, [words])

  const fontScale = scaleLog({
    domain: [
      Math.min(...words.map((d) => d.value)),
      Math.max(...words.map((d) => d.value)),
    ],
    range: [10, 100],
  })
  const { mutate, isPending, error } = useMutation({
    mutationFn: submitComment,
  })
  return (
    <div className="w-full flex flex-col items-center justify-center min-h-screen pb-20">
      <MaxWidthWrapper className="flex flex-col items-center gap-6 pt-20">
        <h1 className="text-4xl sm:text-5xl font-bold text-center tracking-tighter-balance">
          What people think about{" "}
          <span className="text-blue-600">{topicName}</span>:
        </h1>
        <p className="text-sm">(updated in real-time)</p>
        <div className="aspect-square max-w-xl flex items-center justify-center">
          <Wordcloud
            words={words}
            width={500}
            height={500}
            fontSize={(data) => fontScale(data.value)}
            font={"Impact"}
            padding={2}
            spiral={"archimedean"}
            rotate={0}
            random={() => 0.5}
          >
            {(cloudWords) =>
              cloudWords.map((word, i) => (
                <Text
                  key={word.text}
                  fill={COLORS[i % COLORS.length]}
                  textAnchor="middle"
                  transform={`translate(${word.x}, ${word.y})`}
                  fontSize={word.size}
                  fontFamily={word.font}
                >
                  {word.text}
                </Text>
              ))
            }
          </Wordcloud>
        </div>

        <div className="max-w-lg w-full">
          <Label className="font-semibold tracking-tight text-lg pb-2">
            {topicName}
          </Label>
          <div className="mt-1 flex gap-2 items-center">
            <Input
              placeholder={`${topicName} is ...`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <Button
              disabled={isPending}
              onClick={() => mutate({ comment: input, topic: topicName })}
            >
              Submit
            </Button>
          </div>
        </div>
      </MaxWidthWrapper>
    </div>
  )
}
