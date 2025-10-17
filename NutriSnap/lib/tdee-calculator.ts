// Utility functions for TDEE calculation and unit conversions

export type Sex = 'male' | 'female' | 'other';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
export type Goal = 'lose' | 'maintain' | 'gain';

// Unit conversion functions
export const lbsToKg = (lbs: number): number => lbs * 0.453592;
export const kgToLbs = (kg: number): number => kg * 2.20462;
export const cmToFeet = (cm: number): { feet: number; inches: number } => {
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return { feet, inches };
};
export const feetToCm = (feet: number, inches: number): number => {
  return (feet * 12 + inches) * 2.54;
};

// Activity level multipliers
export const getActivityMultiplier = (level: ActivityLevel): number => {
  const multipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };
  return multipliers[level];
};

// Calculate BMR using Mifflin-St Jeor equation
export const calculateBMR = (
  weightKg: number,
  heightCm: number,
  age: number,
  sex: Sex
): number => {
  const baseCalc = 10 * weightKg + 6.25 * heightCm - 5 * age;
  
  if (sex === 'male') {
    return baseCalc + 5;
  } else if (sex === 'female') {
    return baseCalc - 161;
  } else {
    // For 'other', use average
    return baseCalc - 78;
  }
};

// Calculate TDEE (Total Daily Energy Expenditure)
export const calculateTDEE = (
  weightKg: number,
  heightCm: number,
  age: number,
  sex: Sex,
  activityLevel: ActivityLevel
): number => {
  const bmr = calculateBMR(weightKg, heightCm, age, sex);
  const multiplier = getActivityMultiplier(activityLevel);
  return Math.round(bmr * multiplier);
};

// Adjust TDEE based on goal
export const adjustForGoal = (tdee: number, goal: Goal): number => {
  switch (goal) {
    case 'lose':
      return tdee - 500; // 500 calorie deficit for ~1 lb/week loss
    case 'gain':
      return tdee + 500; // 500 calorie surplus for ~1 lb/week gain
    case 'maintain':
    default:
      return tdee;
  }
};

// Calculate macronutrient targets
export const calculateMacros = (calories: number) => {
  // 30% protein, 40% carbs, 30% fat
  const proteinCalories = calories * 0.3;
  const carbsCalories = calories * 0.4;
  const fatCalories = calories * 0.3;

  return {
    protein: Math.round(proteinCalories / 4), // 4 calories per gram
    carbs: Math.round(carbsCalories / 4), // 4 calories per gram
    fat: Math.round(fatCalories / 9), // 9 calories per gram
  };
};

// Validate input ranges
export const validateAge = (age: number): boolean => {
  return age >= 13 && age <= 120;
};

export const validateHeight = (heightCm: number): boolean => {
  return heightCm >= 100 && heightCm <= 250; // ~3'3" to 8'2"
};

export const validateWeight = (weightKg: number): boolean => {
  return weightKg >= 30 && weightKg <= 300; // ~66 lbs to 660 lbs
};

// Get activity level descriptions
export const getActivityDescription = (level: ActivityLevel): string => {
  const descriptions = {
    sedentary: 'Little to no exercise',
    light: 'Exercise 1-3 days/week',
    moderate: 'Exercise 3-5 days/week',
    active: 'Exercise 6-7 days/week',
    very_active: 'Physical job + daily exercise',
  };
  return descriptions[level];
};

// Get goal description
export const getGoalDescription = (goal: Goal): string => {
  const descriptions = {
    lose: 'Lose Weight (500 cal deficit)',
    maintain: 'Maintain Weight',
    gain: 'Gain Weight (500 cal surplus)',
  };
  return descriptions[goal];
};
