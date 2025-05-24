import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { question, userProfile, dailyLog, calorieGoal, proteinGoal } = await request.json()

    const prompt = `You are a certified nutritionist and fitness coach. Answer the user's question based on their profile and current nutrition data.

User Profile:
- Age: ${userProfile.age}, Gender: ${userProfile.gender}
- Weight: ${userProfile.weight}kg, Target: ${userProfile.targetWeight}kg
- Goal: ${userProfile.goal} weight
- Activity Level: ${userProfile.activityLevel}
- Dietary Preference: ${userProfile.dietaryPreference}

Today's Nutrition:
- Calories: ${dailyLog.totalCalories}/${calorieGoal}
- Protein: ${dailyLog.totalProtein}g/${proteinGoal}g
- Foods logged: ${dailyLog.foods.map((f: any) => f.name).join(", ") || "None"}

User Question: "${question}"

Provide a helpful, personalized response that:
1. Addresses their specific question
2. Considers their goals and current progress
3. Gives actionable advice
4. Is encouraging and supportive
5. Is based on sound nutritional science

Keep the response conversational but professional, around 100-150 words. Do not use JSON format - just provide a natural text response.`

    const { text } = await generateText({
      model: groq("llama-3.1-8b-instant"),
      prompt,
      temperature: 0.6,
    })

    return NextResponse.json({ response: text.trim() })
  } catch (error) {
    console.error("Error generating coach response:", error)

    // Provide a fallback response
    const fallbackResponse =
      "I'm having trouble processing your question right now. However, based on your profile, I'd recommend focusing on balanced nutrition that aligns with your goals. Make sure you're getting adequate protein, staying hydrated, and eating a variety of whole foods. Feel free to try asking your question again!"

    return NextResponse.json({ response: fallbackResponse })
  }
}
