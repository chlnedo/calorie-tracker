"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, Send, Bot } from "lucide-react"

interface ChatMessage {
  type: "user" | "coach"
  message: string
  timestamp: Date
}

interface AINutritionCoachProps {
  userProfile: any
  dailyLog: any
  calorieGoal: number
  proteinGoal: number
}

export function AINutritionCoach({ userProfile, dailyLog, calorieGoal, proteinGoal }: AINutritionCoachProps) {
  const [question, setQuestion] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      type: "coach",
      message: `Hi! I'm your AI nutrition coach. I can help you with meal planning, nutrition questions, and achieving your ${userProfile.goal} weight goal. What would you like to know?`,
      timestamp: new Date(),
    },
  ])

  const askCoach = async () => {
    if (!question.trim()) return

    const userMessage: ChatMessage = {
      type: "user",
      message: question,
      timestamp: new Date(),
    }

    setChatHistory((prev) => [...prev, userMessage])
    setQuestion("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/nutrition-coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          userProfile,
          dailyLog,
          calorieGoal,
          proteinGoal,
        }),
      })

      const data = await response.json()

      const coachMessage: ChatMessage = {
        type: "coach",
        message: data.response,
        timestamp: new Date(),
      }

      setChatHistory((prev) => [...prev, coachMessage])
    } catch (error) {
      console.error("Error asking coach:", error)
      const errorMessage: ChatMessage = {
        type: "coach",
        message: "Sorry, I'm having trouble right now. Please try again later.",
        timestamp: new Date(),
      }
      setChatHistory((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const quickQuestions = [
    "How can I increase my protein intake?",
    "What should I eat before a workout?",
    "Am I eating enough calories for my goal?",
    "Suggest a healthy snack for me",
    "How to meal prep for the week?",
  ]

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-t-lg p-4 sm:p-6">
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <Bot className="h-5 w-5" />
          AI Nutrition Coach
        </CardTitle>
        <CardDescription className="text-indigo-50 text-sm sm:text-base">
          Get personalized nutrition advice and answers to your questions
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 space-y-4">
        <ScrollArea className="h-60 sm:h-80 w-full border border-gray-200 rounded-lg p-3 sm:p-4 bg-gray-50">
          <div className="space-y-3 sm:space-y-4">
            {chatHistory.map((chat, index) => (
              <div key={index} className={`flex ${chat.type === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] sm:max-w-[80%] p-2 sm:p-3 rounded-lg ${
                    chat.type === "user" ? "bg-indigo-500 text-white" : "bg-white border border-gray-200 text-gray-800"
                  }`}
                >
                  <p className="text-xs sm:text-sm">{chat.message}</p>
                  <p className={`text-xs mt-1 ${chat.type === "user" ? "text-indigo-100" : "text-gray-500"}`}>
                    {chat.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 text-gray-800 p-2 sm:p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-xs sm:text-sm">Coach is thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="Ask your nutrition coach anything..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && askCoach()}
              className="border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 text-sm"
            />
            <Button
              onClick={askCoach}
              disabled={!question.trim() || isLoading}
              className="bg-indigo-500 hover:bg-indigo-600 px-3"
              size="sm"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-600">Quick questions:</p>
            <div className="flex flex-wrap gap-1 sm:gap-2">
              {quickQuestions.map((q, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setQuestion(q)}
                  className="text-xs border-indigo-200 text-indigo-600 hover:bg-indigo-50 h-auto py-1 px-2"
                >
                  {q}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
