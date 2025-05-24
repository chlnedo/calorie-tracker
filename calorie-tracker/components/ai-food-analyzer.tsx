"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Sparkles, CheckCircle, AlertCircle } from "lucide-react"

interface AnalyzedFood {
  name: string
  calories: number
  protein: number
  carbs: number
  fat: number
  serving: string
  confidence: string
  suggestions: string
  alternatives: string[]
}

interface AIFoodAnalyzerProps {
  onFoodAnalyzed: (food: AnalyzedFood) => void
  userProfile: any
}

export function AIFoodAnalyzer({ onFoodAnalyzed, userProfile }: AIFoodAnalyzerProps) {
  const [foodDescription, setFoodDescription] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analyzedFood, setAnalyzedFood] = useState<AnalyzedFood | null>(null)

  const analyzeFood = async () => {
    if (!foodDescription.trim()) return

    setIsAnalyzing(true)
    try {
      const response = await fetch("/api/analyze-food", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          foodDescription,
          goal: userProfile.goal,
          dietaryPreference: userProfile.dietaryPreference,
        }),
      })

      const data = await response.json()
      setAnalyzedFood(data)
    } catch (error) {
      console.error("Error analyzing food:", error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const addToLog = () => {
    if (analyzedFood) {
      onFoodAnalyzed(analyzedFood)
      setAnalyzedFood(null)
      setFoodDescription("")
    }
  }

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-lg p-4 sm:p-6">
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <Sparkles className="h-5 w-5" />
          AI Food Analyzer
        </CardTitle>
        <CardDescription className="text-purple-50 text-sm sm:text-base">
          Describe any food and get instant nutrition analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="foodDesc" className="text-sm font-medium text-gray-700">
            Describe your food
          </Label>
          <Input
            id="foodDesc"
            placeholder="e.g., 'large grilled chicken breast with rice' or 'homemade pasta with tomato sauce'"
            value={foodDescription}
            onChange={(e) => setFoodDescription(e.target.value)}
            className="border-gray-200 focus:border-purple-500 focus:ring-purple-500"
            onKeyPress={(e) => e.key === "Enter" && analyzeFood()}
          />
        </div>

        <Button
          onClick={analyzeFood}
          disabled={!foodDescription.trim() || isAnalyzing}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Analyze Food
            </>
          )}
        </Button>

        {analyzedFood && (
          <div className="space-y-4 p-3 sm:p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h4 className="font-semibold text-gray-800 text-sm sm:text-base">{analyzedFood.name}</h4>
              <Badge
                variant={
                  analyzedFood.confidence === "high"
                    ? "default"
                    : analyzedFood.confidence === "medium"
                      ? "secondary"
                      : "destructive"
                }
                className="flex items-center gap-1 text-xs self-start sm:self-center"
              >
                {analyzedFood.confidence === "high" ? (
                  <CheckCircle className="h-3 w-3" />
                ) : (
                  <AlertCircle className="h-3 w-3" />
                )}
                {analyzedFood.confidence} confidence
              </Badge>
            </div>

            <div className="space-y-3">
              <p className="text-xs sm:text-sm text-gray-600">Serving: {analyzedFood.serving}</p>
              <div className="flex gap-1 sm:gap-2 flex-wrap">
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">
                  {analyzedFood.calories} cal
                </Badge>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                  {analyzedFood.protein}g protein
                </Badge>
                <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 text-xs">
                  {analyzedFood.carbs}g carbs
                </Badge>
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs">
                  {analyzedFood.fat}g fat
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs sm:text-sm font-medium text-gray-700">AI Suggestions:</p>
              <p className="text-xs sm:text-sm text-gray-600 bg-white/50 p-2 sm:p-3 rounded">
                {analyzedFood.suggestions}
              </p>
            </div>

            {analyzedFood.alternatives.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs sm:text-sm font-medium text-gray-700">Alternatives:</p>
                <div className="flex gap-1 sm:gap-2 flex-wrap">
                  {analyzedFood.alternatives.map((alt, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {alt}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <Button onClick={addToLog} className="w-full bg-emerald-500 hover:bg-emerald-600">
              <CheckCircle className="h-4 w-4 mr-2" />
              Add to Food Log
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
