import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { foodDescription, goal, dietaryPreference } = await request.json()

    const prompt = `You are a nutrition expert. Analyze the following food description and provide detailed nutritional information.

Food Description: "${foodDescription}"
User Goal: ${goal} weight
Dietary Preference: ${dietaryPreference}

You MUST respond with ONLY a valid JSON object in this exact format (no additional text before or after):
{
  "name": "Clean, formatted food name",
  "calories": 250,
  "protein": 25,
  "carbs": 10,
  "fat": 5,
  "serving": "estimated serving size",
  "confidence": "high",
  "suggestions": "Brief suggestions for this food based on user's goal",
  "alternatives": ["alternative food 1", "alternative food 2"]
}

Be accurate with nutritional values. If the description is unclear, make reasonable assumptions and set confidence to "low".`

    const { text } = await generateText({
      model: groq("llama-3.1-8b-instant"),
      prompt,
      temperature: 0.3,
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

    let nutritionData
    try {
      nutritionData = JSON.parse(cleanedText)
    } catch (parseError) {
      // Fallback response if JSON parsing fails
      console.error("JSON parsing failed, using fallback:", parseError)
      nutritionData = {
        name: foodDescription,
        calories: 200,
        protein: 15,
        carbs: 20,
        fat: 8,
        serving: "1 serving",
        confidence: "low",
        suggestions: "Unable to analyze this food accurately. Please try a more specific description.",
        alternatives: ["Try describing the food more specifically"],
      }
    }

    return NextResponse.json(nutritionData)
  } catch (error) {
    console.error("Error analyzing food:", error)
    return NextResponse.json({ error: "Failed to analyze food" }, { status: 500 })
  }
}
