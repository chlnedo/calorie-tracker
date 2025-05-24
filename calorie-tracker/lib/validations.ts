export interface ValidationError {
  field: string
  message: string
}

export const validateProfileForm = (formData: FormData): ValidationError[] => {
  const errors: ValidationError[] = []

  const age = Number(formData.get("age"))
  const weight = Number(formData.get("weight"))
  const height = Number(formData.get("height"))
  const targetWeight = Number(formData.get("targetWeight"))
  const gender = formData.get("gender")
  const activityLevel = formData.get("activityLevel")
  const goal = formData.get("goal")
  const dietaryPreference = formData.get("dietaryPreference")

  // Age validation
  if (!age || age < 13 || age > 120) {
    errors.push({ field: "age", message: "Age must be between 13 and 120 years" })
  }

  // Weight validation
  if (!weight || weight < 20 || weight > 500) {
    errors.push({ field: "weight", message: "Weight must be between 20 and 500 kg" })
  }

  // Height validation
  if (!height || height < 100 || height > 250) {
    errors.push({ field: "height", message: "Height must be between 100 and 250 cm" })
  }

  // Target weight validation
  if (!targetWeight || targetWeight < 20 || targetWeight > 500) {
    errors.push({ field: "targetWeight", message: "Target weight must be between 20 and 500 kg" })
  }

  // Target weight vs current weight validation
  if (weight && targetWeight) {
    const weightDifference = Math.abs(weight - targetWeight)
    if (weightDifference > 100) {
      errors.push({
        field: "targetWeight",
        message: "Target weight should not differ by more than 100 kg from current weight",
      })
    }
  }

  // Required field validations
  if (!gender) {
    errors.push({ field: "gender", message: "Please select your gender" })
  }

  if (!activityLevel) {
    errors.push({ field: "activityLevel", message: "Please select your activity level" })
  }

  if (!goal) {
    errors.push({ field: "goal", message: "Please select your goal" })
  }

  if (!dietaryPreference) {
    errors.push({ field: "dietaryPreference", message: "Please select your dietary preference" })
  }

  return errors
}

export const validateFoodForm = (foodData: {
  name: string
  calories: string
  protein: string
  carbs: string
  fat: string
  serving: string
}): ValidationError[] => {
  const errors: ValidationError[] = []

  // Name validation
  if (!foodData.name.trim()) {
    errors.push({ field: "name", message: "Food name is required" })
  } else if (foodData.name.trim().length < 2) {
    errors.push({ field: "name", message: "Food name must be at least 2 characters" })
  } else if (foodData.name.trim().length > 100) {
    errors.push({ field: "name", message: "Food name must be less than 100 characters" })
  }

  // Calories validation
  const calories = Number(foodData.calories)
  if (!foodData.calories || isNaN(calories)) {
    errors.push({ field: "calories", message: "Calories is required and must be a number" })
  } else if (calories < 0) {
    errors.push({ field: "calories", message: "Calories cannot be negative" })
  } else if (calories > 5000) {
    errors.push({ field: "calories", message: "Calories seems too high (max 5000)" })
  }

  // Protein validation
  if (foodData.protein) {
    const protein = Number(foodData.protein)
    if (isNaN(protein) || protein < 0) {
      errors.push({ field: "protein", message: "Protein must be a positive number" })
    } else if (protein > 200) {
      errors.push({ field: "protein", message: "Protein seems too high (max 200g)" })
    }
  }

  // Carbs validation
  if (foodData.carbs) {
    const carbs = Number(foodData.carbs)
    if (isNaN(carbs) || carbs < 0) {
      errors.push({ field: "carbs", message: "Carbs must be a positive number" })
    } else if (carbs > 500) {
      errors.push({ field: "carbs", message: "Carbs seems too high (max 500g)" })
    }
  }

  // Fat validation
  if (foodData.fat) {
    const fat = Number(foodData.fat)
    if (isNaN(fat) || fat < 0) {
      errors.push({ field: "fat", message: "Fat must be a positive number" })
    } else if (fat > 200) {
      errors.push({ field: "fat", message: "Fat seems too high (max 200g)" })
    }
  }

  // Serving validation
  if (foodData.serving && foodData.serving.trim().length > 50) {
    errors.push({ field: "serving", message: "Serving size must be less than 50 characters" })
  }

  return errors
}

export const validateAIFoodDescription = (description: string): ValidationError[] => {
  const errors: ValidationError[] = []

  if (!description.trim()) {
    errors.push({ field: "description", message: "Please describe the food you want to analyze" })
  } else if (description.trim().length < 3) {
    errors.push({ field: "description", message: "Description must be at least 3 characters" })
  } else if (description.trim().length > 200) {
    errors.push({ field: "description", message: "Description must be less than 200 characters" })
  }

  return errors
}
