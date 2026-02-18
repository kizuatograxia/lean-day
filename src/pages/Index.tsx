import { useState } from "react";
import { useAppData } from "@/hooks/useAppData";
import { SetupForm } from "@/components/SetupForm";
import { MyPlanTab } from "@/components/MyPlanTab";
import { FreeDayTab } from "@/components/FreeDayTab";
import { HistoryTab } from "@/components/HistoryTab";
import { AdjustTab } from "@/components/AdjustTab";
import { CalendarHeart, BarChart3, ClipboardList, Settings2, Leaf } from "lucide-react";
import { WeekHistory, MealsData } from "@/hooks/useAppData";

type Tab = "plan" | "freeDay" | "history" | "adjust";

const TABS = [
  { id: "plan" as Tab, label: "Meu Plano", icon: BarChart3 },
  { id: "freeDay" as Tab, label: "Dia Livre", icon: CalendarHeart },
  { id: "history" as Tab, label: "Histórico", icon: ClipboardList },
  { id: "adjust" as Tab, label: "Ajustar", icon: Settings2 },
];

const Index = () => {
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
  } = useAppData();

  const [activeTab, setActiveTab] = useState<Tab>("plan");
  const [editingEntry, setEditingEntry] = useState<WeekHistory | null>(null);

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
        weekQuality: data.weekQuality as WeekHistory["weekQuality"],
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
        weekQuality: data.weekQuality as WeekHistory["weekQuality"],
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

  // Setup screen
  if (!userData) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <div className="bg-card border-b border-border px-5 py-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Leaf className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-base font-bold leading-tight">Viva sua vida</h1>
              <p className="text-xs text-muted-foreground">sem sabotar seu progresso</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-6">
          <div className="max-w-md mx-auto">
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
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Leaf className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-sm font-bold leading-tight text-foreground">Viva sua vida</h1>
            <p className="text-xs text-muted-foreground">Aproveite o Dia Livre sem comprometer seu progresso</p>
          </div>
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

        {activeTab === "adjust" && calcResults && (
          <AdjustTab
            userData={userData}
            calcResults={calcResults}
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
                className={`flex flex-col items-center justify-center py-3 px-1 gap-1 transition-colors rounded-lg ${
                  isActive
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
