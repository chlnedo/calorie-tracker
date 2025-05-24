"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/hooks/use-toast"
import {
  Plus,
  Target,
  TrendingDown,
  TrendingUp,
  User,
  Utensils,
  Calendar,
  ChefHat,
  Leaf,
  Beef,
  Clock,
  Trash2,
  Save,
  RotateCcw,
  Sparkles,
  AlertCircle,
} from "lucide-react"

import { AIFoodAnalyzer } from "@/components/ai-food-analyzer"
import { AIMealSuggestions } from "@/components/ai-meal-suggestions"
import { AINutritionCoach } from "@/components/ai-nutrition-coach"
import { validateProfileForm, validateFoodForm, type ValidationError } from "@/lib/validations"

interface UserProfile {
  age: number
  weight: number
  height: number
  gender: "male" | "female"
  activityLevel: string
  goal: "lose" | "maintain" | "gain"
  targetWeight: number
  dietaryPreference: "vegetarian" | "non-vegetarian"
}

interface FoodEntry {
  id: string
  name: string
  calories: number
  protein: number
  carbs: number
  fat: number
  serving: string
  mealType: "breakfast" | "lunch" | "dinner" | "snack"
}

interface DailyLog {
  date: string
  foods: FoodEntry[]
  totalCalories: number
  totalProtein: number
  totalCarbs: number
  totalFat: number
}

interface MealPlan {
  breakfast: string[]
  lunch: string[]
  dinner: string[]
  snacks: string[]
}

export default function CalorieTracker() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [dailyLog, setDailyLog] = useState<DailyLog>({
    date: new Date().toISOString().split("T")[0],
    foods: [],
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFat: 0,
  })
  const [newFood, setNewFood] = useState({
    name: "",
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
    serving: "",
    mealType: "breakfast" as "breakfast" | "lunch" | "dinner" | "snack",
  })
  const [showProfileForm, setShowProfileForm] = useState(true)
  const [activeTab, setActiveTab] = useState("dashboard")
  const [profileErrors, setProfileErrors] = useState<ValidationError[]>([])
  const [foodErrors, setFoodErrors] = useState<ValidationError[]>([])
  const { toast } = useToast()

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedProfile = localStorage.getItem("calorieTracker_profile")
    const savedLog = localStorage.getItem("calorieTracker_dailyLog")

    if (savedProfile) {
      setUserProfile(JSON.parse(savedProfile))
      setShowProfileForm(false)
    }

    if (savedLog) {
      const log = JSON.parse(savedLog)
      const today = new Date().toISOString().split("T")[0]

      // Only load if it's today's log
      if (log.date === today) {
        setDailyLog(log)
      }
    }
  }, [])

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (userProfile) {
      localStorage.setItem("calorieTracker_profile", JSON.stringify(userProfile))
    }
  }, [userProfile])

  useEffect(() => {
    localStorage.setItem("calorieTracker_dailyLog", JSON.stringify(dailyLog))
  }, [dailyLog])

  // Diet plans based on dietary preference
  const getDietPlan = (profile: UserProfile): MealPlan => {
    if (profile.dietaryPreference === "vegetarian") {
      return {
        breakfast: [
          "Oatmeal with berries and nuts (350 cal, 12g protein)",
          "Greek yogurt with granola and honey (280 cal, 15g protein)",
          "Avocado toast with eggs (320 cal, 14g protein)",
          "Smoothie bowl with protein powder (300 cal, 20g protein)",
          "Quinoa breakfast bowl with fruits (290 cal, 10g protein)",
        ],
        lunch: [
          "Quinoa salad with chickpeas and vegetables (420 cal, 18g protein)",
          "Lentil soup with whole grain bread (380 cal, 16g protein)",
          "Paneer curry with brown rice (450 cal, 22g protein)",
          "Buddha bowl with tofu and tahini dressing (400 cal, 20g protein)",
          "Black bean and sweet potato bowl (390 cal, 15g protein)",
        ],
        dinner: [
          "Grilled tofu with roasted vegetables (350 cal, 18g protein)",
          "Vegetable stir-fry with tempeh (380 cal, 20g protein)",
          "Stuffed bell peppers with quinoa (320 cal, 14g protein)",
          "Chickpea curry with cauliflower rice (340 cal, 16g protein)",
          "Eggplant parmesan with side salad (360 cal, 15g protein)",
        ],
        snacks: [
          "Hummus with vegetable sticks (120 cal, 5g protein)",
          "Mixed nuts and dried fruits (150 cal, 6g protein)",
          "Greek yogurt with berries (100 cal, 8g protein)",
          "Protein smoothie (180 cal, 15g protein)",
          "Cottage cheese with cucumber (90 cal, 12g protein)",
        ],
      }
    } else {
      return {
        breakfast: [
          "Scrambled eggs with whole grain toast (320 cal, 18g protein)",
          "Greek yogurt with granola and berries (280 cal, 15g protein)",
          "Protein smoothie with banana (300 cal, 25g protein)",
          "Omelette with vegetables and cheese (350 cal, 22g protein)",
          "Overnight oats with protein powder (290 cal, 20g protein)",
        ],
        lunch: [
          "Grilled chicken salad with quinoa (420 cal, 35g protein)",
          "Salmon with sweet potato and broccoli (450 cal, 32g protein)",
          "Turkey and avocado wrap (380 cal, 28g protein)",
          "Tuna salad with mixed greens (350 cal, 30g protein)",
          "Chicken stir-fry with brown rice (400 cal, 33g protein)",
        ],
        dinner: [
          "Baked cod with roasted vegetables (320 cal, 28g protein)",
          "Lean beef with quinoa and asparagus (420 cal, 35g protein)",
          "Grilled chicken breast with sweet potato (380 cal, 32g protein)",
          "Shrimp and vegetable curry (340 cal, 25g protein)",
          "Turkey meatballs with zucchini noodles (360 cal, 30g protein)",
        ],
        snacks: [
          "Hard-boiled eggs with apple slices (150 cal, 12g protein)",
          "Protein bar with nuts (180 cal, 15g protein)",
          "Greek yogurt with almonds (120 cal, 10g protein)",
          "Cottage cheese with berries (100 cal, 14g protein)",
          "Jerky with vegetable sticks (140 cal, 18g protein)",
        ],
      }
    }
  }

  // Calculate BMR using Mifflin-St Jeor Equation
  const calculateBMR = (profile: UserProfile) => {
    if (profile.gender === "male") {
      return 10 * profile.weight + 6.25 * profile.height - 5 * profile.age + 5
    } else {
      return 10 * profile.weight + 6.25 * profile.height - 5 * profile.age - 161
    }
  }

  // Calculate TDEE (Total Daily Energy Expenditure)
  const calculateTDEE = (profile: UserProfile) => {
    const bmr = calculateBMR(profile)
    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      veryActive: 1.9,
    }
    return bmr * activityMultipliers[profile.activityLevel as keyof typeof activityMultipliers]
  }

  // Calculate daily calorie goal
  const calculateCalorieGoal = (profile: UserProfile) => {
    const tdee = calculateTDEE(profile)

    if (profile.goal === "lose") {
      return Math.round(tdee - 500) // 500 calorie deficit for 1 lb/week loss
    } else if (profile.goal === "gain") {
      return Math.round(tdee + 500) // 500 calorie surplus for 1 lb/week gain
    } else {
      return Math.round(tdee) // Maintenance
    }
  }

  // Calculate protein goal (1g per lb of body weight for active individuals)
  const calculateProteinGoal = (profile: UserProfile) => {
    return Math.round(profile.weight * 2.2 * 0.8) // Convert kg to lbs, then 0.8g per lb
  }

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)

    // Validate form
    const errors = validateProfileForm(formData)
    setProfileErrors(errors)

    if (errors.length > 0) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fix the errors below and try again.",
      })
      return
    }

    const profile: UserProfile = {
      age: Number(formData.get("age")),
      weight: Number(formData.get("weight")),
      height: Number(formData.get("height")),
      gender: formData.get("gender") as "male" | "female",
      activityLevel: formData.get("activityLevel") as string,
      goal: formData.get("goal") as "lose" | "maintain" | "gain",
      targetWeight: Number(formData.get("targetWeight")),
      dietaryPreference: formData.get("dietaryPreference") as "vegetarian" | "non-vegetarian",
    }

    setUserProfile(profile)
    setShowProfileForm(false)
    setProfileErrors([])

    toast({
      variant: "success",
      title: "Profile Created Successfully! 🎉",
      description: "Your personalized nutrition plan is ready. Let's start tracking!",
    })
  }

  const addFood = () => {
    // Validate food form
    const errors = validateFoodForm(newFood)
    setFoodErrors(errors)

    if (errors.length > 0) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fix the errors below and try again.",
      })
      return
    }

    const food: FoodEntry = {
      id: Date.now().toString(),
      name: newFood.name,
      calories: Number(newFood.calories),
      protein: Number(newFood.protein) || 0,
      carbs: Number(newFood.carbs) || 0,
      fat: Number(newFood.fat) || 0,
      serving: newFood.serving || "1 serving",
      mealType: newFood.mealType,
    }

    const updatedLog = {
      ...dailyLog,
      foods: [...dailyLog.foods, food],
      totalCalories: dailyLog.totalCalories + food.calories,
      totalProtein: dailyLog.totalProtein + food.protein,
      totalCarbs: dailyLog.totalCarbs + food.carbs,
      totalFat: dailyLog.totalFat + food.fat,
    }

    setDailyLog(updatedLog)
    setNewFood({
      name: "",
      calories: "",
      protein: "",
      carbs: "",
      fat: "",
      serving: "",
      mealType: "breakfast",
    })
    setFoodErrors([])

    toast({
      variant: "success",
      title: "Food Added Successfully! 🍽️",
      description: `${food.name} has been added to your ${food.mealType} log.`,
    })
  }

  const addAIFood = (analyzedFood: any) => {
    const food: FoodEntry = {
      id: Date.now().toString(),
      name: analyzedFood.name,
      calories: analyzedFood.calories,
      protein: analyzedFood.protein,
      carbs: analyzedFood.carbs,
      fat: analyzedFood.fat,
      serving: analyzedFood.serving,
      mealType: "lunch", // Default to lunch, user can change if needed
    }

    const updatedLog = {
      ...dailyLog,
      foods: [...dailyLog.foods, food],
      totalCalories: dailyLog.totalCalories + food.calories,
      totalProtein: dailyLog.totalProtein + food.protein,
      totalCarbs: dailyLog.totalCarbs + food.carbs,
      totalFat: dailyLog.totalFat + food.fat,
    }

    setDailyLog(updatedLog)
    setActiveTab("dashboard") // Switch to dashboard to see the added food

    toast({
      variant: "success",
      title: "AI Food Analysis Complete! 🤖",
      description: `${food.name} has been analyzed and added to your food log.`,
    })
  }

  const addMealSuggestion = (meal: any) => {
    const food: FoodEntry = {
      id: Date.now().toString(),
      name: meal.name,
      calories: meal.calories,
      protein: meal.protein,
      carbs: meal.carbs,
      fat: meal.fat,
      serving: "1 serving",
      mealType: "lunch", // Default to lunch
    }

    const updatedLog = {
      ...dailyLog,
      foods: [...dailyLog.foods, food],
      totalCalories: dailyLog.totalCalories + food.calories,
      totalProtein: dailyLog.totalProtein + food.protein,
      totalCarbs: dailyLog.totalCarbs + food.carbs,
      totalFat: dailyLog.totalFat + food.fat,
    }

    setDailyLog(updatedLog)
    setActiveTab("dashboard")

    toast({
      variant: "success",
      title: "Meal Suggestion Added! 🍽️",
      description: `${meal.name} has been added to your food log.`,
    })
  }

  const removeFood = (id: string) => {
    const food = dailyLog.foods.find((f) => f.id === id)
    if (!food) return

    const updatedLog = {
      ...dailyLog,
      foods: dailyLog.foods.filter((f) => f.id !== id),
      totalCalories: dailyLog.totalCalories - food.calories,
      totalProtein: dailyLog.totalProtein - food.protein,
      totalCarbs: dailyLog.totalCarbs - food.carbs,
      totalFat: dailyLog.totalFat - food.fat,
    }

    setDailyLog(updatedLog)

    toast({
      variant: "success",
      title: "Food Removed",
      description: `${food.name} has been removed from your log.`,
    })
  }

  const resetDailyLog = () => {
    const resetLog = {
      date: new Date().toISOString().split("T")[0],
      foods: [],
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0,
    }
    setDailyLog(resetLog)

    toast({
      variant: "success",
      title: "Daily Log Reset",
      description: "Your daily food log has been cleared. Start fresh!",
    })
  }

  const groupFoodsByMeal = (foods: FoodEntry[]) => {
    return foods.reduce(
      (acc, food) => {
        if (!acc[food.mealType]) {
          acc[food.mealType] = []
        }
        acc[food.mealType].push(food)
        return acc
      },
      {} as Record<string, FoodEntry[]>,
    )
  }

  const getFieldError = (fieldName: string, errors: ValidationError[]) => {
    return errors.find((error) => error.field === fieldName)?.message
  }

  if (showProfileForm || !userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 p-2 sm:p-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent mb-2">
              NutriTrack Pro
            </h1>
            <p className="text-sm sm:text-base text-gray-600 px-4">
              Your personal nutrition and fitness companion with AI Assistant
            </p>
          </div>

          <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-t-lg p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <User className="h-5 w-5 sm:h-6 sm:w-6" />
                Create Your Profile
              </CardTitle>
              <CardDescription className="text-emerald-50 text-sm sm:text-base">
                Tell us about yourself to get personalized nutrition recommendations
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 lg:p-8">
              {profileErrors.length > 0 && (
                <Alert className="mb-4 sm:mb-6 border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    Please fix the following errors:
                    <ul className="mt-2 list-disc list-inside">
                      {profileErrors.map((error, index) => (
                        <li key={index} className="text-sm">
                          {error.message}
                        </li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleProfileSubmit} className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="age" className="text-sm font-medium text-gray-700">
                      Age *
                    </Label>
                    <Input
                      id="age"
                      name="age"
                      type="number"
                      placeholder="25"
                      required
                      min="13"
                      max="120"
                      className={`border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 ${
                        getFieldError("age", profileErrors) ? "border-red-300 bg-red-50" : ""
                      }`}
                    />
                    {getFieldError("age", profileErrors) && (
                      <p className="text-sm text-red-600">{getFieldError("age", profileErrors)}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weight" className="text-sm font-medium text-gray-700">
                      Weight (kg) *
                    </Label>
                    <Input
                      id="weight"
                      name="weight"
                      type="number"
                      placeholder="70"
                      required
                      min="20"
                      max="500"
                      step="0.1"
                      className={`border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 ${
                        getFieldError("weight", profileErrors) ? "border-red-300 bg-red-50" : ""
                      }`}
                    />
                    {getFieldError("weight", profileErrors) && (
                      <p className="text-sm text-red-600">{getFieldError("weight", profileErrors)}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="height" className="text-sm font-medium text-gray-700">
                      Height (cm) *
                    </Label>
                    <Input
                      id="height"
                      name="height"
                      type="number"
                      placeholder="175"
                      required
                      min="100"
                      max="250"
                      className={`border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 ${
                        getFieldError("height", profileErrors) ? "border-red-300 bg-red-50" : ""
                      }`}
                    />
                    {getFieldError("height", profileErrors) && (
                      <p className="text-sm text-red-600">{getFieldError("height", profileErrors)}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="targetWeight" className="text-sm font-medium text-gray-700">
                      Target Weight (kg) *
                    </Label>
                    <Input
                      id="targetWeight"
                      name="targetWeight"
                      type="number"
                      placeholder="65"
                      required
                      min="20"
                      max="500"
                      step="0.1"
                      className={`border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 ${
                        getFieldError("targetWeight", profileErrors) ? "border-red-300 bg-red-50" : ""
                      }`}
                    />
                    {getFieldError("targetWeight", profileErrors) && (
                      <p className="text-sm text-red-600">{getFieldError("targetWeight", profileErrors)}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-700">Gender *</Label>
                  <RadioGroup name="gender" defaultValue="male" className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="male" id="male" className="text-emerald-500" />
                      <Label htmlFor="male">Male</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="female" id="female" className="text-emerald-500" />
                      <Label htmlFor="female">Female</Label>
                    </div>
                  </RadioGroup>
                  {getFieldError("gender", profileErrors) && (
                    <p className="text-sm text-red-600">{getFieldError("gender", profileErrors)}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="activityLevel" className="text-sm font-medium text-gray-700">
                    Activity Level *
                  </Label>
                  <Select name="activityLevel" defaultValue="moderate">
                    <SelectTrigger className="border-gray-200 focus:border-emerald-500 focus:ring-emerald-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sedentary">Sedentary (little/no exercise)</SelectItem>
                      <SelectItem value="light">Light (light exercise 1-3 days/week)</SelectItem>
                      <SelectItem value="moderate">Moderate (moderate exercise 3-5 days/week)</SelectItem>
                      <SelectItem value="active">Active (hard exercise 6-7 days/week)</SelectItem>
                      <SelectItem value="veryActive">Very Active (very hard exercise, physical job)</SelectItem>
                    </SelectContent>
                  </Select>
                  {getFieldError("activityLevel", profileErrors) && (
                    <p className="text-sm text-red-600">{getFieldError("activityLevel", profileErrors)}</p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-700">Dietary Preference *</Label>
                  <RadioGroup
                    name="dietaryPreference"
                    defaultValue="non-vegetarian"
                    className="flex flex-col sm:flex-row gap-4 sm:gap-6"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="vegetarian" id="vegetarian" className="text-emerald-500" />
                      <Label htmlFor="vegetarian" className="flex items-center gap-2">
                        <Leaf className="h-4 w-4 text-green-600" />
                        Vegetarian
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="non-vegetarian" id="non-vegetarian" className="text-emerald-500" />
                      <Label htmlFor="non-vegetarian" className="flex items-center gap-2">
                        <Beef className="h-4 w-4 text-red-600" />
                        Non-Vegetarian
                      </Label>
                    </div>
                  </RadioGroup>
                  {getFieldError("dietaryPreference", profileErrors) && (
                    <p className="text-sm text-red-600">{getFieldError("dietaryPreference", profileErrors)}</p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-700">Goal *</Label>
                  <RadioGroup name="goal" defaultValue="lose" className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="lose" id="lose" className="text-emerald-500" />
                      <Label htmlFor="lose" className="flex items-center gap-2">
                        <TrendingDown className="h-4 w-4 text-green-600" />
                        Lose Weight
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="maintain" id="maintain" className="text-emerald-500" />
                      <Label htmlFor="maintain" className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-orange-600" />
                        Maintain Weight
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="gain" id="gain" className="text-emerald-500" />
                      <Label htmlFor="gain" className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-blue-600" />
                        Gain Weight
                      </Label>
                    </div>
                  </RadioGroup>
                  {getFieldError("goal", profileErrors) && (
                    <p className="text-sm text-red-600">{getFieldError("goal", profileErrors)}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white font-medium py-3 rounded-lg transition-all duration-200 transform hover:scale-105"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Create Profile & Start Tracking
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
        <Toaster />
      </div>
    )
  }

  const calorieGoal = calculateCalorieGoal(userProfile)
  const proteinGoal = calculateProteinGoal(userProfile)
  const calorieProgress = Math.min((dailyLog.totalCalories / calorieGoal) * 100, 100)
  const proteinProgress = Math.min((dailyLog.totalProtein / proteinGoal) * 100, 100)
  const groupedFoods = groupFoodsByMeal(dailyLog.foods)

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 p-2 sm:p-4">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header - Responsive */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent truncate">
              NutriTrack Pro
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">Welcome back! Let's track your nutrition today.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={resetDailyLog}
              className="border-orange-200 text-orange-600 hover:bg-orange-50 text-sm"
              size="sm"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset Day
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowProfileForm(true)}
              className="border-emerald-200 text-emerald-600 hover:bg-emerald-50 text-sm"
              size="sm"
            >
              <User className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
          {/* Responsive Tabs */}
          <div className="overflow-x-auto">
            <TabsList className="grid w-full grid-cols-5 bg-white/80 backdrop-blur-sm border border-gray-200 min-w-[500px] sm:min-w-0">
              <TabsTrigger
                value="dashboard"
                className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white text-xs sm:text-sm px-2 sm:px-4"
              >
                <Target className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Dashboard</span>
                <span className="sm:hidden">Home</span>
              </TabsTrigger>
              <TabsTrigger
                value="log-food"
                className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white text-xs sm:text-sm px-2 sm:px-4"
              >
                <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Log Food</span>
                <span className="sm:hidden">Add</span>
              </TabsTrigger>
              <TabsTrigger
                value="ai-features"
                className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white text-xs sm:text-sm px-2 sm:px-4"
              >
                <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">AI Features</span>
                <span className="sm:hidden">AI</span>
              </TabsTrigger>
              <TabsTrigger
                value="diet-plan"
                className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white text-xs sm:text-sm px-2 sm:px-4"
              >
                <ChefHat className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Diet Plan</span>
                <span className="sm:hidden">Plan</span>
              </TabsTrigger>
              <TabsTrigger
                value="recommendations"
                className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white text-xs sm:text-sm px-2 sm:px-4"
              >
                <Utensils className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Tips</span>
                <span className="sm:hidden">Tips</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="dashboard" className="space-y-4 sm:space-y-6">
            {/* Stats Cards - Responsive Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-500 to-green-500 p-3 sm:p-4">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-0">
                    <CardTitle className="text-sm font-medium text-white">Daily Calories</CardTitle>
                    <Target className="h-4 w-4 text-white" />
                  </CardHeader>
                </div>
                <CardContent className="p-4 sm:p-6">
                  <div className="text-2xl sm:text-3xl font-bold text-gray-800">{dailyLog.totalCalories}</div>
                  <p className="text-xs text-gray-600 mb-3">Goal: {calorieGoal} calories</p>
                  <Progress value={calorieProgress} className="h-2 mb-2" />
                  <p className="text-xs">
                    {calorieGoal - dailyLog.totalCalories > 0
                      ? `${calorieGoal - dailyLog.totalCalories} calories remaining`
                      : `${dailyLog.totalCalories - calorieGoal} calories over goal`}
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-3 sm:p-4">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-0">
                    <CardTitle className="text-sm font-medium text-white">Protein</CardTitle>
                    <Utensils className="h-4 w-4 text-white" />
                  </CardHeader>
                </div>
                <CardContent className="p-4 sm:p-6">
                  <div className="text-2xl sm:text-3xl font-bold text-gray-800">{dailyLog.totalProtein}g</div>
                  <p className="text-xs text-gray-600 mb-3">Goal: {proteinGoal}g</p>
                  <Progress value={proteinProgress} className="h-2 mb-2" />
                  <p className="text-xs">
                    {proteinGoal - dailyLog.totalProtein > 0
                      ? `${proteinGoal - dailyLog.totalProtein}g remaining`
                      : `Goal achieved! 🎉`}
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm overflow-hidden sm:col-span-2 lg:col-span-1">
                <div
                  className={`bg-gradient-to-r p-3 sm:p-4 ${
                    userProfile.goal === "lose"
                      ? "from-green-500 to-emerald-500"
                      : userProfile.goal === "gain"
                        ? "from-blue-500 to-indigo-500"
                        : "from-orange-500 to-yellow-500"
                  }`}
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-0">
                    <CardTitle className="text-sm font-medium text-white">Weight Goal</CardTitle>
                    {userProfile.goal === "lose" ? (
                      <TrendingDown className="h-4 w-4 text-white" />
                    ) : userProfile.goal === "gain" ? (
                      <TrendingUp className="h-4 w-4 text-white" />
                    ) : (
                      <Target className="h-4 w-4 text-white" />
                    )}
                  </CardHeader>
                </div>
                <CardContent className="p-4 sm:p-6">
                  <div className="text-2xl sm:text-3xl font-bold text-gray-800">{userProfile.weight}kg</div>
                  <p className="text-xs text-gray-600 mb-3">Target: {userProfile.targetWeight}kg</p>
                  <Badge
                    variant="secondary"
                    className={`text-xs ${
                      userProfile.goal === "lose"
                        ? "bg-green-100 text-green-700"
                        : userProfile.goal === "gain"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-orange-100 text-orange-700"
                    }`}
                  >
                    {userProfile.goal === "lose"
                      ? "Losing Weight"
                      : userProfile.goal === "gain"
                        ? "Gaining Weight"
                        : "Maintaining"}
                  </Badge>
                </CardContent>
              </Card>
            </div>

            {/* Food Log */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <Calendar className="h-5 w-5" />
                  Today's Food Log
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">{dailyLog.foods.length} items logged</CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                {dailyLog.foods.length === 0 ? (
                  <div className="text-center py-8 sm:py-12">
                    <Utensils className="h-8 w-8 sm:h-12 sm:w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-base sm:text-lg mb-2">No food logged today</p>
                    <p className="text-gray-400 text-sm sm:text-base">Start by adding your first meal!</p>
                  </div>
                ) : (
                  <div className="space-y-4 sm:space-y-6">
                    {["breakfast", "lunch", "dinner", "snack"].map((mealType) => {
                      const mealFoods = groupedFoods[mealType] || []
                      if (mealFoods.length === 0) return null

                      return (
                        <div key={mealType} className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <h4 className="font-semibold capitalize text-gray-700 text-sm sm:text-base">{mealType}</h4>
                            <Separator className="flex-1" />
                          </div>
                          <div className="space-y-2">
                            {mealFoods.map((food) => (
                              <div
                                key={food.id}
                                className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-100 hover:shadow-md transition-shadow gap-3 sm:gap-0"
                              >
                                <div className="flex-1 min-w-0">
                                  <h5 className="font-medium text-gray-800 text-sm sm:text-base truncate">
                                    {food.name}
                                  </h5>
                                  <p className="text-xs sm:text-sm text-gray-600">{food.serving}</p>
                                  <div className="flex flex-wrap gap-1 sm:gap-2 text-xs mt-2">
                                    <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded">
                                      {food.calories} cal
                                    </span>
                                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                      {food.protein}g protein
                                    </span>
                                    <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded">
                                      {food.carbs}g carbs
                                    </span>
                                    <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded">
                                      {food.fat}g fat
                                    </span>
                                  </div>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeFood(food.id)}
                                  className="border-red-200 text-red-600 hover:bg-red-50 self-start sm:self-center"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="log-food" className="space-y-4 sm:space-y-6">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-t-lg p-4 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <Plus className="h-5 w-5" />
                  Add Food
                </CardTitle>
                <CardDescription className="text-emerald-50 text-sm sm:text-base">
                  Log your meals and snacks to track your daily nutrition
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
                {foodErrors.length > 0 && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                      Please fix the following errors:
                      <ul className="mt-2 list-disc list-inside">
                        {foodErrors.map((error, index) => (
                          <li key={index} className="text-sm">
                            {error.message}
                          </li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="foodName" className="text-sm font-medium text-gray-700">
                      Food Name *
                    </Label>
                    <Input
                      id="foodName"
                      placeholder="e.g., Grilled Chicken Breast"
                      value={newFood.name}
                      onChange={(e) => setNewFood({ ...newFood, name: e.target.value })}
                      className={`border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 ${
                        getFieldError("name", foodErrors) ? "border-red-300 bg-red-50" : ""
                      }`}
                    />
                    {getFieldError("name", foodErrors) && (
                      <p className="text-sm text-red-600">{getFieldError("name", foodErrors)}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="serving" className="text-sm font-medium text-gray-700">
                      Serving Size
                    </Label>
                    <Input
                      id="serving"
                      placeholder="e.g., 100g, 1 cup"
                      value={newFood.serving}
                      onChange={(e) => setNewFood({ ...newFood, serving: e.target.value })}
                      className={`border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 ${
                        getFieldError("serving", foodErrors) ? "border-red-300 bg-red-50" : ""
                      }`}
                    />
                    {getFieldError("serving", foodErrors) && (
                      <p className="text-sm text-red-600">{getFieldError("serving", foodErrors)}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mealType" className="text-sm font-medium text-gray-700">
                      Meal Type
                    </Label>
                    <Select
                      value={newFood.mealType}
                      onValueChange={(value) => setNewFood({ ...newFood, mealType: value as any })}
                    >
                      <SelectTrigger className="border-gray-200 focus:border-emerald-500 focus:ring-emerald-500">
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
                  <div className="space-y-2">
                    <Label htmlFor="calories" className="text-sm font-medium text-gray-700">
                      Calories *
                    </Label>
                    <Input
                      id="calories"
                      type="number"
                      placeholder="250"
                      value={newFood.calories}
                      onChange={(e) => setNewFood({ ...newFood, calories: e.target.value })}
                      className={`border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 ${
                        getFieldError("calories", foodErrors) ? "border-red-300 bg-red-50" : ""
                      }`}
                    />
                    {getFieldError("calories", foodErrors) && (
                      <p className="text-sm text-red-600">{getFieldError("calories", foodErrors)}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="protein" className="text-sm font-medium text-gray-700">
                      Protein (g)
                    </Label>
                    <Input
                      id="protein"
                      type="number"
                      placeholder="25"
                      value={newFood.protein}
                      onChange={(e) => setNewFood({ ...newFood, protein: e.target.value })}
                      className={`border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 ${
                        getFieldError("protein", foodErrors) ? "border-red-300 bg-red-50" : ""
                      }`}
                    />
                    {getFieldError("protein", foodErrors) && (
                      <p className="text-sm text-red-600">{getFieldError("protein", foodErrors)}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="carbs" className="text-sm font-medium text-gray-700">
                      Carbs (g)
                    </Label>
                    <Input
                      id="carbs"
                      type="number"
                      placeholder="10"
                      value={newFood.carbs}
                      onChange={(e) => setNewFood({ ...newFood, carbs: e.target.value })}
                      className={`border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 ${
                        getFieldError("carbs", foodErrors) ? "border-red-300 bg-red-50" : ""
                      }`}
                    />
                    {getFieldError("carbs", foodErrors) && (
                      <p className="text-sm text-red-600">{getFieldError("carbs", foodErrors)}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fat" className="text-sm font-medium text-gray-700">
                      Fat (g)
                    </Label>
                    <Input
                      id="fat"
                      type="number"
                      placeholder="5"
                      value={newFood.fat}
                      onChange={(e) => setNewFood({ ...newFood, fat: e.target.value })}
                      className={`border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 ${
                        getFieldError("fat", foodErrors) ? "border-red-300 bg-red-50" : ""
                      }`}
                    />
                    {getFieldError("fat", foodErrors) && (
                      <p className="text-sm text-red-600">{getFieldError("fat", foodErrors)}</p>
                    )}
                  </div>
                </div>
                <Button
                  onClick={addFood}
                  className="w-full bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white font-medium py-3 rounded-lg transition-all duration-200 transform hover:scale-105"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Food to Log
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai-features" className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-4 sm:space-y-6">
                <AIFoodAnalyzer onFoodAnalyzed={addAIFood} userProfile={userProfile} />
                <AIMealSuggestions
                  userProfile={userProfile}
                  dailyLog={dailyLog}
                  calorieGoal={calorieGoal}
                  proteinGoal={proteinGoal}
                  onMealSelected={addMealSuggestion}
                />
              </div>
              <div>
                <AINutritionCoach
                  userProfile={userProfile}
                  dailyLog={dailyLog}
                  calorieGoal={calorieGoal}
                  proteinGoal={proteinGoal}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="diet-plan" className="space-y-4 sm:space-y-6">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-lg p-4 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <ChefHat className="h-5 w-5" />
                  Personalized Diet Plan
                  {userProfile.dietaryPreference === "vegetarian" ? (
                    <Leaf className="h-5 w-5 text-green-200" />
                  ) : (
                    <Beef className="h-5 w-5 text-red-200" />
                  )}
                </CardTitle>
                <CardDescription className="text-purple-50 text-sm sm:text-base">
                  {userProfile.dietaryPreference === "vegetarian" ? "Vegetarian" : "Non-Vegetarian"} meal suggestions
                  for your {userProfile.goal} goal
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 lg:p-8">
                <ScrollArea className="h-[400px] sm:h-[500px] lg:h-[600px] pr-4">
                  <div className="space-y-6 sm:space-y-8">
                    {Object.entries(getDietPlan(userProfile)).map(([mealType, meals]) => (
                      <div key={mealType} className="space-y-3 sm:space-y-4">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                          <h3 className="text-lg sm:text-xl font-semibold capitalize text-gray-800">{mealType}</h3>
                        </div>
                        <div className="grid gap-2 sm:gap-3">
                          {meals.map((meal, index) => (
                            <div
                              key={index}
                              className="p-3 sm:p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                            >
                              <p className="text-gray-700 leading-relaxed text-sm sm:text-base">{meal}</p>
                            </div>
                          ))}
                        </div>
                        {mealType !== "snacks" && <Separator />}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-t-lg p-4 sm:p-6">
                  <CardTitle className="text-lg sm:text-xl">Your Daily Targets</CardTitle>
                  <CardDescription className="text-emerald-50 text-sm sm:text-base">
                    Based on your profile and goals
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                  <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-lg">
                    <span className="font-medium text-emerald-800 text-sm sm:text-base">Daily Calories:</span>
                    <Badge variant="outline" className="border-emerald-200 text-emerald-700 text-xs sm:text-sm">
                      {calorieGoal} calories
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="font-medium text-blue-800 text-sm sm:text-base">Daily Protein:</span>
                    <Badge variant="outline" className="border-blue-200 text-blue-700 text-xs sm:text-sm">
                      {proteinGoal}g
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                    <span className="font-medium text-purple-800 text-sm sm:text-base">BMR:</span>
                    <Badge variant="outline" className="border-purple-200 text-purple-700 text-xs sm:text-sm">
                      {Math.round(calculateBMR(userProfile))} calories
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                    <span className="font-medium text-orange-800 text-sm sm:text-base">TDEE:</span>
                    <Badge variant="outline" className="border-orange-200 text-orange-700 text-xs sm:text-sm">
                      {Math.round(calculateTDEE(userProfile))} calories
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-t-lg p-4 sm:p-6">
                  <CardTitle className="text-lg sm:text-xl">Weight Management Tips</CardTitle>
                  <CardDescription className="text-blue-50 text-sm sm:text-base">
                    Personalized advice for your goals
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                  {userProfile.goal === "lose" && (
                    <div className="space-y-3 p-3 sm:p-4 bg-green-50 rounded-lg border border-green-200">
                      <h4 className="font-semibold text-green-800 flex items-center gap-2 text-sm sm:text-base">
                        <TrendingDown className="h-4 w-4" />
                        For Weight Loss:
                      </h4>
                      <ul className="text-xs sm:text-sm space-y-1 sm:space-y-2 text-green-700">
                        <li>• Maintain a 500-calorie daily deficit</li>
                        <li>• Aim for 1-2 lbs weight loss per week</li>
                        <li>• Focus on high-protein foods to preserve muscle</li>
                        <li>• Include strength training in your routine</li>
                        <li>• Stay hydrated and get adequate sleep</li>
                      </ul>
                    </div>
                  )}
                  {userProfile.goal === "gain" && (
                    <div className="space-y-3 p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-blue-800 flex items-center gap-2 text-sm sm:text-base">
                        <TrendingUp className="h-4 w-4" />
                        For Weight Gain:
                      </h4>
                      <ul className="text-xs sm:text-sm space-y-1 sm:space-y-2 text-blue-700">
                        <li>• Maintain a 500-calorie daily surplus</li>
                        <li>• Aim for 1-2 lbs weight gain per week</li>
                        <li>• Eat protein-rich foods throughout the day</li>
                        <li>• Include resistance training for muscle growth</li>
                        <li>• Focus on nutrient-dense, calorie-rich foods</li>
                      </ul>
                    </div>
                  )}
                  {userProfile.goal === "maintain" && (
                    <div className="space-y-3 p-3 sm:p-4 bg-orange-50 rounded-lg border border-orange-200">
                      <h4 className="font-semibold text-orange-800 flex items-center gap-2 text-sm sm:text-base">
                        <Target className="h-4 w-4" />
                        For Maintenance:
                      </h4>
                      <ul className="text-xs sm:text-sm space-y-1 sm:space-y-2 text-orange-700">
                        <li>• Eat at your TDEE level</li>
                        <li>• Focus on balanced nutrition</li>
                        <li>• Maintain regular exercise routine</li>
                        <li>• Monitor weight weekly</li>
                        <li>• Adjust calories based on activity changes</li>
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-t-lg p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl">Nutrition Guidelines</CardTitle>
                <CardDescription className="text-indigo-50 text-sm sm:text-base">
                  {userProfile.dietaryPreference === "vegetarian" ? "Vegetarian" : "General"} recommendations for
                  optimal health
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 lg:p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-base sm:text-lg text-gray-800 flex items-center gap-2">
                      <Utensils className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                      Protein Sources
                    </h4>
                    <div className="space-y-2">
                      {userProfile.dietaryPreference === "vegetarian" ? (
                        <>
                          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                            <p className="text-sm font-medium text-green-800">Plant-Based Proteins:</p>
                            <ul className="text-xs text-green-700 mt-1 space-y-1">
                              <li>• Lentils and legumes</li>
                              <li>• Quinoa and tofu</li>
                              <li>• Nuts and seeds</li>
                              <li>• Greek yogurt and eggs</li>
                            </ul>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                            <p className="text-sm font-medium text-red-800">Animal Proteins:</p>
                            <ul className="text-xs text-red-700 mt-1 space-y-1">
                              <li>• Lean meats (chicken, turkey)</li>
                              <li>• Fish and seafood</li>
                              <li>• Eggs and dairy</li>
                              <li>• Protein supplements</li>
                            </ul>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-semibold text-base sm:text-lg text-gray-800 flex items-center gap-2">
                      <Target className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
                      Healthy Carbs
                    </h4>
                    <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <ul className="text-xs sm:text-sm space-y-1 text-orange-700">
                        <li>• Whole grains and oats</li>
                        <li>• Fruits and vegetables</li>
                        <li>• Sweet potatoes</li>
                        <li>• Quinoa and brown rice</li>
                        <li>• Legumes and beans</li>
                      </ul>
                    </div>
                  </div>
                  <div className="space-y-4 md:col-span-2 lg:col-span-1">
                    <h4 className="font-semibold text-base sm:text-lg text-gray-800 flex items-center gap-2">
                      <Leaf className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                      Healthy Fats
                    </h4>
                    <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <ul className="text-xs sm:text-sm space-y-1 text-purple-700">
                        <li>• Avocados and olive oil</li>
                        <li>• Nuts and seeds</li>
                        <li>• Fatty fish (if non-veg)</li>
                        <li>• Coconut oil</li>
                        <li>• Nut butters</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <Toaster />
    </div>
  )
}
