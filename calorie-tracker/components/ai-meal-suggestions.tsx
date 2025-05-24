"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, ChefHat, Clock, Plus } from "lucide-react"

interface MealSuggestion {
  name: string
  description: string
  calories: number
  protein: number
  carbs: number
  fat: number
  ingredients: string[]
  prepTime: string
  reason: string
}

interface AIMealSuggestionsProps {
  userProfile: any
  dailyLog: any
  calorieGoal: number
  proteinGoal: number
  onMealSelected: (meal: MealSuggestion) => void
}

export function AIMealSuggestions({
  userProfile,
  dailyLog,
  calorieGoal,
  proteinGoal,
  onMealSelected,
}: AIMealSuggestionsProps) {
  const [mealType, setMealType] = useState<string>("lunch")
  const [suggestions, setSuggestions] = useState<MealSuggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const generateSuggestions = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/meal-suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentCalories: dailyLog.totalCalories,
          targetCalories: calorieGoal,
          currentProtein: dailyLog.totalProtein,
          targetProtein: proteinGoal,
          goal: userProfile.goal,
          dietaryPreference: userProfile.dietaryPreference,
          mealType,
          loggedFoods: dailyLog.foods.map((f: any) => f.name),
        }),
      })

      const data = await response.json()
      setSuggestions(data.suggestions || [])
    } catch (error) {
      console.error("Error generating suggestions:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-t-lg p-4 sm:p-6">
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <ChefHat className="h-5 w-5" />
          AI Meal Suggestions
        </CardTitle>
        <CardDescription className="text-emerald-50 text-sm sm:text-base">
          Get personalized meal recommendations based on your goals
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-end">
          <div className="flex-1 space-y-2">
            <label className="text-sm font-medium text-gray-700">Meal Type</label>
            <Select value={mealType} onValueChange={setMealType}>
              <SelectTrigger className="border-gray-200 focus:border-emerald-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="breakfast">Breakfast</SelectItem>
                <SelectItem value="lunch">Lunch</SelectItem>
                <SelectItem value="dinner">Dinner</SelectItem>
                <SelectItem value="snack">Snack</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={generateSuggestions}
            disabled={isLoading}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 w-full sm:w-auto"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <ChefHat className="h-4 w-4 mr-2" />
                Get Suggestions
              </>
            )}
          </Button>
        </div>

        {suggestions.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-800 text-sm sm:text-base">Recommended {mealType} options:</h4>
            {suggestions.map((meal, index) => (
              <div
                key={index}
                className="p-3 sm:p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-200 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h5 className="font-semibold text-gray-800 text-sm sm:text-base">{meal.name}</h5>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">{meal.description}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-500 self-start">
                    <Clock className="h-3 w-3" />
                    {meal.prepTime}
                  </div>
                </div>

                <div className="flex gap-1 sm:gap-2 flex-wrap">
                  <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-emerald-300 text-xs">
                    {meal.calories} cal
                  </Badge>
                  <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300 text-xs">
                    {meal.protein}g protein
                  </Badge>
                  <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-300 text-xs">
                    {meal.carbs}g carbs
                  </Badge>
                  <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-300 text-xs">
                    {meal.fat}g fat
                  </Badge>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-medium text-gray-700">Ingredients:</p>
                  <p className="text-xs text-gray-600">{meal.ingredients.join(", ")}</p>
                </div>

                <div className="bg-white/70 p-2 sm:p-3 rounded text-xs text-gray-600">
                  <strong>Why this meal:</strong> {meal.reason}
                </div>

                <Button
                  onClick={() => onMealSelected(meal)}
                  size="sm"
                  className="w-full bg-emerald-500 hover:bg-emerald-600"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add to Log
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
