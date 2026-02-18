import { useState, useEffect } from "react";

export interface UserData {
  weight: number;
  height: number;
  age: number;
  sex: "male" | "female";
  activityLevel: "sedentary" | "light" | "moderate" | "active";
  weeklyGoal: 0.25 | 0.5 | 0.75;
}

export interface WeekHistory {
  id: string;
  weekNumber: number;
  date: string;
  totalConsumed: number;
  margin: number;
  classification: "green" | "yellow" | "red";
  emotion?: string;
  weekQuality?: "followed" | "small_deviations" | "lost_control";
  mealsData?: MealsData;
}

export interface MealsData {
  breakfast: string;
  lunch: string;
  dinnerBefore: string;
  items: FoodItem[];
  customKcal: number;
}

export interface FoodItem {
  name: string;
  kcalEach: number;
  quantity: number;
}

export interface CalcResults {
  tmb: number;
  tdee: number;
  weeklyDeficit: number;
  weeklyTarget: number;
  dailyRoutine: number;
  dailyFreeDay: number;
}

const ACTIVITY_FACTORS: Record<UserData["activityLevel"], number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
};

const WEEKLY_DEFICIT: Record<string, number> = {
  "0.25": 1900,
  "0.5": 3500,
  "0.75": 5250,
};

const MEAL_ESTIMATES: Record<string, number> = {
  not_consumed: 0,
  light: 350,
  moderate: 550,
  high: 800,
};

export function calculateResults(userData: UserData): CalcResults {
  const { weight, height, age, sex, activityLevel, weeklyGoal } = userData;
  
  // Mifflin-St Jeor
  let tmb: number;
  if (sex === "male") {
    tmb = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    tmb = 10 * weight + 6.25 * height - 5 * age - 161;
  }

  const tdee = tmb * ACTIVITY_FACTORS[activityLevel];
  const weeklyTarget = tdee * 7 - WEEKLY_DEFICIT[String(weeklyGoal)];
  
  // 5 routine days + 1 free day
  // Free day gets more margin, routine days get less
  // weeklyTarget = 5 * dailyRoutine + 1 * dailyFreeDay
  // dailyFreeDay = tdee + (tdee - dailyRoutine) * 1 (redistribute)
  // Simple approach: give free day = tdee + weekly surplus from routine days
  const dailyRoutine = (weeklyTarget - tdee) / 6;
  const dailyFreeDay = weeklyTarget - 5 * dailyRoutine;

  return {
    tmb: Math.round(tmb),
    tdee: Math.round(tdee),
    weeklyDeficit: WEEKLY_DEFICIT[String(weeklyGoal)],
    weeklyTarget: Math.round(weeklyTarget),
    dailyRoutine: Math.round(dailyRoutine),
    dailyFreeDay: Math.round(dailyFreeDay),
  };
}

export function getMealKcal(option: string): number {
  return MEAL_ESTIMATES[option] ?? 0;
}

export function getClassification(consumed: number, margin: number): "green" | "yellow" | "red" {
  const diff = consumed - margin;
  if (diff <= 0) return "green";
  if (diff <= 300) return "yellow";
  return "red";
}

export function useAppData() {
  const [userData, setUserData] = useState<UserData | null>(() => {
    const stored = localStorage.getItem("anti_sabotagem_user");
    return stored ? JSON.parse(stored) : null;
  });

  const [history, setHistory] = useState<WeekHistory[]>(() => {
    const stored = localStorage.getItem("anti_sabotagem_history");
    return stored ? JSON.parse(stored) : [];
  });

  const [currentMealsData, setCurrentMealsData] = useState<MealsData | null>(() => {
    const stored = localStorage.getItem("anti_sabotagem_current_meals");
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    if (userData) {
      localStorage.setItem("anti_sabotagem_user", JSON.stringify(userData));
    }
  }, [userData]);

  useEffect(() => {
    localStorage.setItem("anti_sabotagem_history", JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    if (currentMealsData) {
      localStorage.setItem("anti_sabotagem_current_meals", JSON.stringify(currentMealsData));
    }
  }, [currentMealsData]);

  const calcResults = userData ? calculateResults(userData) : null;

  const saveWeek = (entry: Omit<WeekHistory, "id" | "weekNumber" | "date">) => {
    const newEntry: WeekHistory = {
      ...entry,
      id: Date.now().toString(),
      weekNumber: history.length + 1,
      date: new Date().toLocaleDateString("pt-BR"),
    };
    setHistory(prev => [newEntry, ...prev]);
    localStorage.removeItem("anti_sabotagem_current_meals");
    setCurrentMealsData(null);
  };

  const updateHistoryEntry = (id: string, updates: Partial<WeekHistory>) => {
    setHistory(prev => prev.map(h => h.id === id ? { ...h, ...updates } : h));
  };

  const startNewWeek = () => {
    localStorage.removeItem("anti_sabotagem_current_meals");
    setCurrentMealsData(null);
  };

  return {
    userData,
    setUserData,
    calcResults,
    history,
    saveWeek,
    updateHistoryEntry,
    startNewWeek,
    currentMealsData,
    setCurrentMealsData,
  };
}
