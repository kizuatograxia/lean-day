import { useState, useEffect } from "react";
import { useAppData } from "@/hooks/useAppData";
import { SetupForm } from "@/components/SetupForm";
import { MyPlanTab } from "@/components/MyPlanTab";
import { FreeDayTab } from "@/components/FreeDayTab";
import { HistoryTab } from "@/components/HistoryTab";
import { AdjustTab } from "@/components/AdjustTab";
import { Login } from "@/components/Login";
import { CalendarHeart, BarChart3, ClipboardList, Settings2, Leaf, LogOut } from "lucide-react";
import { WeekHistory, MealsData } from "@/hooks/useAppData";
import { useSearchParams } from "react-router-dom";

type Tab = "plan" | "freeDay" | "history" | "adjust";

const TABS = [
  { id: "plan" as Tab, label: "Meu Plano", icon: BarChart3 },
  { id: "freeDay" as Tab, label: "Dia Livre", icon: CalendarHeart },
  { id: "history" as Tab, label: "Histórico", icon: ClipboardList },
  { id: "adjust" as Tab, label: "Ajustar", icon: Settings2 },
];

const Index = () => {
  const [searchParams] = useSearchParams();
  const {
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
  } = useAppData();

  const [activeTab, setActiveTab] = useState<Tab>("plan");
  const [editingEntry, setEditingEntry] = useState<WeekHistory | null>(null);

  useEffect(() => {
    if (searchParams.get("setup") === "true") {
      setActiveTab("adjust");
    }
  }, [searchParams]);

  const handleFreeDayFinalize = (data: {
    totalConsumed: number;
    classification: "green" | "yellow" | "red";
    weekQuality: string;
    mealsData: MealsData;
    emotion?: string;
  }) => {
    if (editingEntry) {
      updateHistoryEntry(editingEntry.id, {
        totalConsumed: data.totalConsumed,
        classification: data.classification,
        weekQuality: data.weekQuality as any,
        mealsData: data.mealsData,
        emotion: data.emotion,
        margin: calcResults!.dailyFreeDay,
      });
      setEditingEntry(null);
      setActiveTab("history");
    } else {
      saveWeek({
        totalConsumed: data.totalConsumed,
        classification: data.classification,
        weekQuality: data.weekQuality as any,
        mealsData: data.mealsData,
        emotion: data.emotion,
        margin: calcResults!.dailyFreeDay,
      });
      setActiveTab("history");
    }
  };

  const handleEditWeek = (entry: WeekHistory) => {
    setEditingEntry(entry);
    setActiveTab("freeDay");
  };

  const handleNewWeek = () => {
    startNewWeek();
    setEditingEntry(null);
    setActiveTab("freeDay");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLogin={loginWithGoogle} />;
  }

  // Setup screen if not activated
  if (!userData?.isActivated) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <div className="bg-card border-b border-border px-5 py-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Leaf className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-base font-bold leading-tight">Lean Day</h1>
              <p className="text-xs text-muted-foreground">sem sabotar seu progresso</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-6">
          <div className="max-w-md mx-auto">
            <div className="mb-6 text-center">
              <h2 className="text-xl font-bold">Configure seu perfil</h2>
              <p className="text-sm text-muted-foreground">Precisamos desses dados para calcular seu plano.</p>
            </div>
            <SetupForm onComplete={setUserData} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto">
      {/* Header */}
      <div className="bg-card border-b border-border px-5 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Leaf className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-sm font-bold leading-tight text-foreground">Lean Day</h1>
              <p className="text-xs text-muted-foreground">Aproveite o Dia Livre</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="p-2 text-muted-foreground hover:text-destructive transition-colors"
            title="Sair"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 pt-5">
        {activeTab === "plan" && calcResults && (
          <MyPlanTab
            calcResults={calcResults}
            userData={userData}
            onGoToFreeDay={() => { setEditingEntry(null); setActiveTab("freeDay"); }}
            onEditData={() => setActiveTab("adjust")}
          />
        )}

        {activeTab === "freeDay" && calcResults && (
          <div>
            <h2 className="text-lg font-bold mb-4">
              {editingEntry ? "Editar Dia Livre" : "Dia Livre"}
            </h2>
            <FreeDayTab
              calcResults={calcResults}
              onFinalize={handleFreeDayFinalize}
              initialData={editingEntry?.mealsData ?? currentMealsData}
            />
          </div>
        )}

        {activeTab === "history" && (
          <HistoryTab
            history={history}
            onNewWeek={handleNewWeek}
            onEditWeek={handleEditWeek}
          />
        )}

        {activeTab === "adjust" && (
          <AdjustTab
            userData={userData}
            calcResults={calcResults!}
            onSave={setUserData}
          />
        )}
      </div>

      {/* Bottom nav */}
      <div className="flex-shrink-0 bg-card border-t border-border px-2 pb-safe">
        <div className="grid grid-cols-4 gap-0.5">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => { setEditingEntry(null); setActiveTab(tab.id); }}
                className={`flex flex-col items-center justify-center py-3 px-1 gap-1 transition-colors rounded-lg ${isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? "stroke-[2.5px]" : "stroke-2"}`} />
                <span className={`text-[10px] font-medium leading-none ${isActive ? "font-semibold" : ""}`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Index;
