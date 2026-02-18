import { useState } from "react";
import { CalcResults, UserData } from "@/hooks/useAppData";
import { Info, ChevronDown, ChevronUp } from "lucide-react";

interface MyPlanTabProps {
  calcResults: CalcResults;
  userData: UserData;
  onGoToFreeDay: () => void;
  onEditData: () => void;
}

export function MyPlanTab({ calcResults, userData, onGoToFreeDay, onEditData }: MyPlanTabProps) {
  const [showInfo, setShowInfo] = useState(false);

  const goalLabels: Record<string, string> = {
    "0.25": "0,25 kg/semana",
    "0.5": "0,5 kg/semana",
    "0.75": "0,75 kg/semana",
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Tagline */}
      <p className="text-sm text-muted-foreground italic text-center">
        Equilíbrio não é restrição. É estratégia.
      </p>

      {/* Main highlight: Free Day margin */}
      <div className="bg-primary/10 border border-primary/20 rounded-2xl p-6 text-center space-y-1">
        <p className="text-xs font-medium text-primary uppercase tracking-widest">Margem para seu Dia Livre</p>
        <p className="text-5xl font-bold text-primary">{calcResults.dailyFreeDay.toLocaleString()}</p>
        <p className="text-sm text-primary/70">kcal disponíveis</p>
        <p className="text-xs text-muted-foreground mt-2">
          Baseado no seu gasto estimado e no déficit semanal escolhido.
        </p>
      </div>

      {/* Flow visual: routine → margin → free day */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1 px-1">
          <span>Dias de rotina</span>
          <span>Margem acumulada</span>
          <span>Dia Livre</span>
        </div>
        <div className="relative h-2 bg-secondary rounded-full overflow-hidden">
          <div className="absolute left-0 top-0 h-full bg-primary rounded-full" style={{ width: "72%" }} />
          <div className="absolute left-[72%] top-0 h-full bg-primary/30 rounded-full" style={{ width: "14%" }} />
          <div className="absolute left-[86%] top-0 h-full bg-primary/60 rounded-full" style={{ width: "14%" }} />
        </div>
      </div>

      {/* Secondary info */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card border border-border rounded-xl p-4 space-y-0.5">
          <p className="text-xs text-muted-foreground">Meta semanal</p>
          <p className="text-xl font-bold text-foreground">{calcResults.weeklyTarget.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">kcal</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 space-y-0.5">
          <p className="text-xs text-muted-foreground">Dias de rotina</p>
          <p className="text-xl font-bold text-foreground">{calcResults.dailyRoutine.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">kcal/dia</p>
        </div>
      </div>

      {/* Info expandable */}
      <button
        onClick={() => setShowInfo(!showInfo)}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <Info className="h-3.5 w-3.5" />
        Como calculamos isso?
        {showInfo ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      </button>

      {showInfo && (
        <div className="bg-secondary/60 rounded-xl p-4 text-sm text-muted-foreground leading-relaxed">
          O cálculo é baseado nos dados informados (peso, altura, idade e nível de atividade). Estimamos seu gasto energético diário e aplicamos um déficit moderado para gerar progresso sustentável. Esse valor é um ponto de partida estratégico e pode ser ajustado conforme sua evolução.
        </div>
      )}

      {/* Summary */}
      <div className="bg-secondary/40 rounded-xl p-4 space-y-1.5">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Meta de déficit</span>
          <span className="font-medium">{goalLabels[String(userData.weeklyGoal)]}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Gasto diário estimado</span>
          <span className="font-medium">{calcResults.tdee.toLocaleString()} kcal</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Déficit semanal</span>
          <span className="font-medium">{calcResults.weeklyDeficit.toLocaleString()} kcal</span>
        </div>
      </div>

      {/* CTAs */}
      <div className="space-y-3">
        <button
          onClick={onGoToFreeDay}
          className="w-full h-12 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors"
        >
          Registrar Dia Livre
        </button>
        <button
          onClick={onEditData}
          className="w-full h-10 text-muted-foreground text-sm hover:text-foreground transition-colors"
        >
          Editar dados
        </button>
      </div>
    </div>
  );
}
