"use client"
import { useState } from "react"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { useMutation } from "@tanstack/react-query"
import { createTopic } from "@/app/actions"

export default function TopicCreator() {
  const [topic, setTopic] = useState<string>("")
  const { mutate, error, isPending } = useMutation({
    mutationFn: createTopic,
  })
  return (
    <div className="mt-12 flex flex-col gap-2">
      <div className="flex gap-2">
        <Input
          className="bg-white min-w-64"
          placeholder="Enter a topic here..."
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />
        <Button
          disabled={isPending}
          onClick={() => mutate({ topicName: topic })}
        >
          Create
        </Button>
      </div>
      {error && <p className="text-sm text-red-600">{error.message}</p>}
    </div>
  )
}
