import { useState } from "react";
import { UserData, CalcResults } from "@/hooks/useAppData";
import { SetupForm } from "@/components/SetupForm";
import { ChevronDown, ChevronUp } from "lucide-react";

interface AdjustTabProps {
  userData: UserData;
  calcResults: CalcResults;
  onSave: (data: UserData) => void;
}

export function AdjustTab({ userData, calcResults, onSave }: AdjustTabProps) {
  const [showFull, setShowFull] = useState(false);
  const [quickWeight, setQuickWeight] = useState(userData.weight.toString());
  const [quickGoal, setQuickGoal] = useState(userData.weeklyGoal.toString());

  const handleQuickSave = () => {
    onSave({
      ...userData,
      weight: parseFloat(quickWeight) || userData.weight,
      weeklyGoal: parseFloat(quickGoal) as 0.25 | 0.5 | 0.75,
    });
  };

  const goalLabels: Record<string, string> = {
    "0.25": "0,25 kg",
    "0.5": "0,5 kg",
    "0.75": "0,75 kg",
  };

  return (
    <div className="space-y-6 pb-6">
      <div className="space-y-1">
        <h2 className="text-base font-semibold">Ajustar dados</h2>
        <p className="text-sm text-muted-foreground">Alterações recalculam automaticamente sua margem.</p>
      </div>

      {/* Quick adjust */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Peso atual (kg)</label>
          <input
            type="number"
            value={quickWeight}
            onChange={e => setQuickWeight(e.target.value)}
            className="w-full h-12 px-4 bg-background border border-input rounded-xl text-center font-semibold text-lg focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Meta de déficit semanal</label>
          <div className="grid grid-cols-3 gap-2">
            {["0.25", "0.5", "0.75"].map(v => (
              <button
                key={v}
                onClick={() => setQuickGoal(v)}
                className={`h-11 rounded-xl border-2 font-semibold text-sm transition-all ${
                  quickGoal === v
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-secondary/40 text-foreground hover:border-primary/50"
                }`}
              >
                {goalLabels[v]}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleQuickSave}
          className="w-full h-11 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors"
        >
          Salvar alterações
        </button>
      </div>

      {/* Summary of current calc */}
      <div className="bg-secondary/40 rounded-xl p-4 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Valores calculados</p>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Meta para dias de rotina</span>
          <span className="font-semibold">{calcResults.dailyRoutine.toLocaleString()} kcal</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Margem estimada para Dia Livre</span>
          <span className="font-semibold text-primary">{calcResults.dailyFreeDay.toLocaleString()} kcal</span>
        </div>
      </div>

      {/* Edit full data */}
      <div>
        <button
          onClick={() => setShowFull(!showFull)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {showFull ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          Editar dados completos
        </button>

        {showFull && (
          <div className="mt-4 bg-card border border-border rounded-2xl p-5">
            <SetupForm
              onComplete={(data) => { onSave(data); setShowFull(false); }}
              initialData={userData}
              compact
            />
          </div>
        )}
      </div>
    </div>
  );
}
