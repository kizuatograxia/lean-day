import { useState, useEffect } from "react";
import api from "@/lib/api";

export interface UserData {
  id?: string;
  email?: string;
  name?: string;
  weight: number;
  height: number;
  age: number;
  sex: "male" | "female";
  activityLevel: "sedentary" | "light" | "moderate" | "active";
  weeklyGoal: 0.25 | 0.5 | 0.75;
  isActivated?: boolean;
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

const ACTIVITY_FACTORS: Record<string, number> = {
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

export function getMealKcal(option: string): number {
  return MEAL_ESTIMATES[option] ?? 0;
}

export function getClassification(consumed: number, margin: number): "green" | "yellow" | "red" {
  const diff = consumed - margin;
  if (diff <= 0) return "green";
  if (diff <= 300) return "yellow";
  return "red";
}

export function calculateResults(userData: UserData): CalcResults {
  const { weight, height, age, sex, activityLevel, weeklyGoal } = userData;

  let tmb: number;
  if (sex === "male") {
    tmb = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    tmb = 10 * weight + 6.25 * height - 5 * age - 161;
  }

  const tdee = tmb * ACTIVITY_FACTORS[activityLevel as any];
  const weeklyTarget = tdee * 7 - WEEKLY_DEFICIT[String(weeklyGoal)];

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

export function useAppData() {
  const [userData, setUserDataState] = useState<UserData | null>(null);
  const [history, setHistory] = useState<WeekHistory[]>([]);
  const [currentMealsData, setCurrentMealsData] = useState<MealsData | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchUserData = async () => {
    try {
      const response = await api.get("/user/profile");
      const user = response.data;
      if (user.isActivated) {
        setUserDataState(user);
      } else {
        setUserDataState(user); // Still set it so we know we have a user but not activated
      }
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Failed to fetch user data", error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await api.get("/history");
      setHistory(response.data);
    } catch (error) {
      console.error("Failed to fetch history", error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      fetchUserData();
      fetchHistory();
    } else {
      setIsLoading(false);
    }
  }, []);

  const setUserData = async (data: UserData) => {
    try {
      const response = await api.post("/user/activate", data);
      setUserDataState(response.data);
    } catch (error) {
      console.error("Failed to activate user", error);
    }
  };

  const saveWeek = async (entry: Omit<WeekHistory, "id" | "weekNumber" | "date">) => {
    try {
      const response = await api.post("/history", {
        ...entry,
        weekNumber: history.length + 1,
        date: new Date().toLocaleDateString("pt-BR"),
      });
      setHistory(prev => [response.data, ...prev]);
      setCurrentMealsData(null);
    } catch (error) {
      console.error("Failed to save week", error);
    }
  };

  const updateHistoryEntry = async (id: string, updates: Partial<WeekHistory>) => {
    try {
      const response = await api.put(`/history/${id}`, updates);
      setHistory(prev => prev.map(h => h.id === id ? response.data : h));
    } catch (error) {
      console.error("Failed to update history entry", error);
    }
  };

  const startNewWeek = () => {
    setCurrentMealsData(null);
  };

  const loginWithGoogle = () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    window.location.href = `${apiUrl}/auth/google`;
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    setIsAuthenticated(false);
    setUserDataState(null);
    setHistory([]);
    window.location.reload();
  };

  const calcResults = userData && userData.isActivated ? calculateResults(userData) : null;

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
    isAuthenticated,
    isLoading,
    loginWithGoogle,
    logout,
  };
}
