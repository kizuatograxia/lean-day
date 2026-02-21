import { WeekHistory } from "@/hooks/useAppData";
import { Pencil, Plus } from "lucide-react";

interface HistoryTabProps {
  history: WeekHistory[];
  onNewWeek: () => void;
  onEditWeek: (entry: WeekHistory) => void;
}

const ZONE_CONFIG = {
  green: { label: "Estratégico", bg: "zone-green", emoji: "🟢" },
  yellow: { label: "Atenção", bg: "zone-yellow", emoji: "🟡" },
  red: { label: "Fora do planejado", bg: "zone-red", emoji: "🔴" },
};

const ZONE_SUMMARIES = {
  green: "Dentro da margem estratégica.",
  yellow: "Levemente acima, mas dentro da média.",
  red: "Acima da margem. Pequenos ajustes resolvem.",
};

function getConsistency(history: WeekHistory[]): number | null {
  const last4 = history.slice(0, 4);
  if (last4.length === 0) return null;
  const greenCount = last4.filter(h => h.classification === "green").length;
  return Math.round((greenCount / last4.length) * 100);
}

export function HistoryTab({ history, onNewWeek, onEditWeek }: HistoryTabProps) {
  const consistency = getConsistency(history);

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="text-5xl">📋</div>
        <p className="text-muted-foreground text-sm text-center">
          Nenhuma semana registrada ainda.<br />Complete seu primeiro Dia Livre para começar.
        </p>
        <button
          onClick={onNewWeek}
          className="flex items-center gap-2 h-10 px-5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Iniciar Nova Semana
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Histórico de semanas</h2>
        <button
          onClick={onNewWeek}
          className="flex items-center gap-1.5 h-9 px-4 bg-primary text-primary-foreground rounded-xl text-xs font-semibold hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          Nova semana
        </button>
      </div>

      {/* Consistency indicator */}
      {consistency !== null && (
        <div className="bg-card border border-border rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Consistência nas últimas {Math.min(4, history.length)} semanas</p>
            <p className="text-xl font-bold text-foreground">{consistency}%</p>
          </div>
          <div className="flex gap-1">
            {history.slice(0, 4).reverse().map((h, i) => (
              <span key={i} className="text-sm">{ZONE_CONFIG[h.classification].emoji}</span>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        {history.map(entry => {
          const zone = ZONE_CONFIG[entry.classification];
          const diff = entry.totalConsumed - entry.margin;
          const isAbove = diff > 0;
          const isBelow = diff < 0;

          return (
            <div key={entry.id} className="bg-card border border-border rounded-2xl p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Semana {entry.weekNumber} · {entry.date}</p>
                  <p className="text-lg font-bold mt-0.5">{entry.totalConsumed.toLocaleString()} kcal</p>
                  <p className="text-xs text-muted-foreground">Consumido no Dia Livre</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onEditWeek(entry)}
                    className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:border-primary/40 transition-colors"
                  >
                    <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                </div>
              </div>

              {isBelow && (
                <p className="text-sm font-medium text-primary">
                  −{Math.abs(diff).toLocaleString()} kcal dentro da margem
                </p>
              )}
              {isAbove && (
                <p className="text-sm font-medium text-destructive">
                  +{diff.toLocaleString()} kcal acima da margem
                </p>
              )}

              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${zone.bg}`}>
                  {zone.emoji} {zone.label}
                </span>
                {entry.emotion && (
                  <span className="text-xs text-muted-foreground border border-border rounded-full px-2.5 py-1">
                    {entry.emotion}
                  </span>
                )}
              </div>

              {/* Summary text */}
              <p className="text-xs text-muted-foreground italic">
                {ZONE_SUMMARIES[entry.classification]}
              </p>

              <div className="text-xs text-muted-foreground">
                Margem da semana: {entry.margin.toLocaleString()} kcal
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
