import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const {
      currentCalories,
      targetCalories,
      currentProtein,
      targetProtein,
      goal,
      dietaryPreference,
      mealType,
      loggedFoods,
    } = await request.json()

    const remainingCalories = targetCalories - currentCalories
    const remainingProtein = targetProtein - currentProtein

    const prompt = `You are a nutrition expert and meal planner. Based on the user's current nutrition status, suggest 3 specific ${mealType} options.

Current Status:
- Calories consumed: ${currentCalories}/${targetCalories} (${remainingCalories} remaining)
- Protein consumed: ${currentProtein}g/${targetProtein}g (${remainingProtein}g remaining)
- Goal: ${goal} weight
- Dietary Preference: ${dietaryPreference}
- Already logged today: ${loggedFoods.join(", ") || "Nothing yet"}

You MUST respond with ONLY a valid JSON object in this exact format (no additional text before or after):
{
  "suggestions": [
    {
      "name": "Grilled Chicken Salad",
      "description": "Fresh mixed greens with grilled chicken breast",
      "calories": 350,
      "protein": 30,
      "carbs": 15,
      "fat": 12,
      "ingredients": ["chicken breast", "mixed greens", "olive oil"],
      "prepTime": "15 minutes",
      "reason": "High protein to help reach daily goals"
    },
    {
      "name": "Quinoa Bowl",
      "description": "Nutritious quinoa with vegetables",
      "calories": 300,
      "protein": 12,
      "carbs": 45,
      "fat": 8,
      "ingredients": ["quinoa", "vegetables", "olive oil"],
      "prepTime": "20 minutes",
      "reason": "Balanced macros for sustained energy"
    },
    {
      "name": "Protein Smoothie",
      "description": "Protein-rich smoothie with fruits",
      "calories": 250,
      "protein": 25,
      "carbs": 20,
      "fat": 5,
      "ingredients": ["protein powder", "banana", "berries"],
      "prepTime": "5 minutes",
      "reason": "Quick protein boost"
    }
  ]
}

Focus on meals that help them reach their remaining calorie and protein targets while aligning with their ${goal} goal and ${dietaryPreference} preference.`

    const { text } = await generateText({
      model: groq("llama-3.1-8b-instant"),
      prompt,
      temperature: 0.7,
    })

    // Clean the response and try to parse JSON
    let cleanedText = text.trim()

    // Remove any markdown code blocks
    cleanedText = cleanedText.replace(/```json\n?/g, "").replace(/```\n?/g, "")

    // Find JSON object in the response
    const jsonStart = cleanedText.indexOf("{")
    const jsonEnd = cleanedText.lastIndexOf("}") + 1

    if (jsonStart !== -1 && jsonEnd > jsonStart) {
      cleanedText = cleanedText.substring(jsonStart, jsonEnd)
    }

    let suggestions
    try {
      suggestions = JSON.parse(cleanedText)
    } catch (parseError) {
      // Fallback response if JSON parsing fails
      console.error("JSON parsing failed, using fallback:", parseError)

      // Create fallback suggestions based on dietary preference and meal type
      const fallbackMeals =
        dietaryPreference === "vegetarian"
          ? [
              {
                name: "Quinoa Salad Bowl",
                description: "Nutritious quinoa with mixed vegetables and chickpeas",
                calories: 380,
                protein: 16,
                carbs: 55,
                fat: 12,
                ingredients: ["quinoa", "chickpeas", "mixed vegetables", "olive oil"],
                prepTime: "15 minutes",
                reason: "Balanced plant-based nutrition",
              },
              {
                name: "Greek Yogurt Parfait",
                description: "High-protein yogurt with granola and berries",
                calories: 320,
                protein: 20,
                carbs: 35,
                fat: 8,
                ingredients: ["Greek yogurt", "granola", "mixed berries"],
                prepTime: "5 minutes",
                reason: "High protein and probiotics",
              },
              {
                name: "Lentil Soup",
                description: "Hearty lentil soup with vegetables",
                calories: 290,
                protein: 18,
                carbs: 40,
                fat: 6,
                ingredients: ["lentils", "vegetables", "vegetable broth"],
                prepTime: "25 minutes",
                reason: "High fiber and plant protein",
              },
            ]
          : [
              {
                name: "Grilled Chicken Breast",
                description: "Lean grilled chicken with steamed vegetables",
                calories: 350,
                protein: 35,
                carbs: 10,
                fat: 12,
                ingredients: ["chicken breast", "broccoli", "olive oil"],
                prepTime: "20 minutes",
                reason: "High protein for muscle maintenance",
              },
              {
                name: "Salmon with Quinoa",
                description: "Baked salmon with quinoa and asparagus",
                calories: 420,
                protein: 32,
                carbs: 25,
                fat: 18,
                ingredients: ["salmon fillet", "quinoa", "asparagus"],
                prepTime: "25 minutes",
                reason: "Omega-3 fatty acids and complete protein",
              },
              {
                name: "Turkey Wrap",
                description: "Lean turkey wrap with vegetables",
                calories: 310,
                protein: 28,
                carbs: 30,
                fat: 8,
                ingredients: ["turkey breast", "whole wheat tortilla", "vegetables"],
                prepTime: "10 minutes",
                reason: "Convenient high-protein option",
              },
            ]

      suggestions = { suggestions: fallbackMeals }
    }

    return NextResponse.json(suggestions)
  } catch (error) {
    console.error("Error generating meal suggestions:", error)
    return NextResponse.json({ error: "Failed to generate meal suggestions" }, { status: 500 })
  }
}
