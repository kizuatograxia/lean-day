import { useState } from "react";
import { CalcResults, MealsData, FoodItem, getClassification, getMealKcal } from "@/hooks/useAppData";
import { Plus, Minus, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

interface FreeDayTabProps {
  calcResults: CalcResults;
  onFinalize: (data: { totalConsumed: number; classification: "green" | "yellow" | "red"; weekQuality: string; mealsData: MealsData; emotion?: string }) => void;
  initialData?: MealsData | null;
}

const MEAL_OPTIONS = [
  { value: "not_consumed", label: "Não consumi", kcal: 0 },
  { value: "light", label: "Igual à rotina", kcal: 350 },
  { value: "moderate", label: "Um pouco a mais", kcal: 550 },
  { value: "high", label: "Bem acima do normal", kcal: 800 },
];

const FOOD_ITEMS: FoodItem[] = [
  { name: "Cerveja lata 350ml", kcalEach: 150, quantity: 0 },
  { name: "Long neck 330ml", kcalEach: 140, quantity: 0 },
  { name: "Chopp 300ml", kcalEach: 120, quantity: 0 },
  { name: "Fatia de pizza", kcalEach: 300, quantity: 0 },
  { name: "Lanche médio", kcalEach: 600, quantity: 0 },
  { name: "Porção frita", kcalEach: 350, quantity: 0 },
  { name: "Sobremesa média", kcalEach: 400, quantity: 0 },
];

const WEEK_QUALITY_OPTIONS = [
  {
    value: "followed",
    emoji: "🔹",
    title: "Segui como planejado",
    desc: "Mantive consistência na maior parte dos dias e cumpri minha meta diária.",
    multiplier: 1.0,
  },
  {
    value: "small_deviations",
    emoji: "🔹",
    title: "Tive pequenos desvios",
    desc: "Houve alguns momentos fora do planejado, mas mantive controle geral.",
    multiplier: 0.9,
  },
  {
    value: "lost_control",
    emoji: "🔹",
    title: "Perdi o controle em vários dias",
    desc: "Tive excessos frequentes e não mantive a estrutura planejada.",
    multiplier: 0.75,
  },
];

const EMOTIONS = ["Satisfeito", "Exagerei", "Me senti culpado", "Valeu a pena"];

const RESULT_MESSAGES = {
  green: "Você aproveitou sem comprometer seu progresso.",
  yellow: "Houve exagero leve. Ajuste na próxima semana.",
  red: "Essa semana exigirá compensação estratégica.",
};

export function FreeDayTab({ calcResults, onFinalize, initialData }: FreeDayTabProps) {
  const [step, setStep] = useState<"week" | "meals" | "result">(initialData ? "meals" : "week");
  const [weekQuality, setWeekQuality] = useState<string>(initialData ? "followed" : "");
  const [meals, setMeals] = useState({
    breakfast: initialData?.breakfast ?? "not_consumed",
    lunch: initialData?.lunch ?? "not_consumed",
    dinnerBefore: initialData?.dinnerBefore ?? "not_consumed",
  });
  const [foodItems, setFoodItems] = useState<FoodItem[]>(
    initialData?.items ?? FOOD_ITEMS.map(i => ({ ...i }))
  );
  const [customKcal, setCustomKcal] = useState(initialData?.customKcal?.toString() ?? "");
  const [emotion, setEmotion] = useState("");
  const [finalized, setFinalized] = useState(false);

  const qualityMultiplier = WEEK_QUALITY_OPTIONS.find(q => q.value === weekQuality)?.multiplier ?? 1.0;
  const adjustedMargin = Math.round(calcResults.dailyFreeDay * qualityMultiplier);

  const mealKcal = getMealKcal(meals.breakfast) + getMealKcal(meals.lunch) + getMealKcal(meals.dinnerBefore);
  const eventKcal = foodItems.reduce((sum, item) => sum + item.kcalEach * item.quantity, 0);
  const extraKcal = parseFloat(customKcal) || 0;
  const totalConsumed = mealKcal + eventKcal + extraKcal;
  const remainingMargin = adjustedMargin - totalConsumed;
  const classification = getClassification(totalConsumed, adjustedMargin);
  const usagePercent = adjustedMargin > 0 ? Math.min(100, (totalConsumed / adjustedMargin) * 100) : 0;

  const marginDiff = Math.round(calcResults.dailyFreeDay - adjustedMargin);

  const updateItemQty = (index: number, delta: number) => {
    setFoodItems(prev => prev.map((item, i) =>
      i === index ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item
    ));
  };

  const handleFinalize = () => {
    const mealsData: MealsData = {
      breakfast: meals.breakfast,
      lunch: meals.lunch,
      dinnerBefore: meals.dinnerBefore,
      items: foodItems,
      customKcal: extraKcal,
    };
    onFinalize({ totalConsumed, classification, weekQuality, mealsData, emotion });
    setFinalized(true);
  };

  const zoneColors = {
    green: "zone-green",
    yellow: "zone-yellow",
    red: "zone-red",
  };

  const zoneEmoji = { green: "🟢", yellow: "🟡", red: "🔴" };
  const zoneLabel = { green: "Estratégico", yellow: "Atenção", red: "Fora do planejado" };

  const getProgressColor = () => {
    if (usagePercent >= 100) return "bg-destructive";
    if (usagePercent >= 85) return "bg-[hsl(var(--zone-yellow))]";
    return "bg-primary";
  };

  if (finalized) {
    return (
      <div className="space-y-6 pb-6">
        <div className={`rounded-2xl border-2 p-6 text-center space-y-3 ${zoneColors[classification]}`}>
          <div className="text-4xl">{zoneEmoji[classification]}</div>
          <p className="text-2xl font-bold">{zoneLabel[classification]}</p>
          <p className="text-sm opacity-80">{RESULT_MESSAGES[classification]}</p>
          <div className="text-3xl font-bold">{totalConsumed.toLocaleString()} kcal</div>
          <p className="text-xs opacity-60">Consumo total do Dia Livre</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Margem disponível</span>
            <span className="font-medium">{adjustedMargin.toLocaleString()} kcal</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total consumido</span>
            <span className="font-medium">{totalConsumed.toLocaleString()} kcal</span>
          </div>
          <div className="flex justify-between text-sm font-semibold border-t border-border pt-2 mt-2">
            <span>{remainingMargin >= 0 ? "Dentro da margem" : "Acima da margem"}</span>
            <span className={remainingMargin >= 0 ? "text-primary" : "text-destructive"}>
              {remainingMargin >= 0 ? `−${remainingMargin.toLocaleString()}` : `+${Math.abs(remainingMargin).toLocaleString()}`} kcal
            </span>
          </div>
        </div>

        {classification !== "green" && (
          <div className="bg-secondary/40 rounded-xl p-4 space-y-2">
            <p className="text-sm font-semibold">Ajuste sugerido</p>
            <p className="text-sm text-muted-foreground">
              {classification === "yellow"
                ? "Reduza aproximadamente 100 kcal por dia entre segunda e quarta-feira."
                : "Reduza aproximadamente 150 kcal por dia na próxima semana."}
            </p>
            <p className="text-xs text-muted-foreground italic">
              Não é necessária compensação extrema. Pequenos ajustes mantêm a constância.
            </p>
          </div>
        )}

        <div className="space-y-2">
          <p className="text-sm font-medium">Como você se sentiu no Dia Livre? <span className="text-muted-foreground">(opcional)</span></p>
          <div className="grid grid-cols-2 gap-2">
            {EMOTIONS.map(e => (
              <button
                key={e}
                onClick={() => setEmotion(prev => prev === e ? "" : e)}
                className={`h-10 rounded-lg border text-sm font-medium transition-all ${
                  emotion === e
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card text-foreground hover:border-primary/40"
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (step === "week") {
    return (
      <div className="space-y-6 pb-6">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground italic">Seja honesto. Sua resposta ajusta sua margem estratégica.</p>
          <h2 className="text-lg font-semibold">Como foi sua semana?</h2>
        </div>

        <div className="space-y-3">
          {WEEK_QUALITY_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setWeekQuality(opt.value)}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all space-y-1 ${
                weekQuality === opt.value
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card hover:border-primary/40"
              }`}
            >
              <p className={`text-sm font-semibold ${weekQuality === opt.value ? "text-primary" : "text-foreground"}`}>
                {opt.emoji} {opt.title}
              </p>
              <p className="text-xs text-muted-foreground leading-snug">{opt.desc}</p>
              {weekQuality === opt.value && opt.multiplier < 1.0 && (
                <p className="text-xs text-primary/80 mt-1">
                  Essa escolha ajusta sua margem do Dia Livre em −{Math.round(calcResults.dailyFreeDay * (1 - opt.multiplier))} kcal.
                </p>
              )}
              {weekQuality === opt.value && opt.multiplier === 1.0 && (
                <p className="text-xs text-primary/80 mt-1">
                  Margem completa mantida.
                </p>
              )}
            </button>
          ))}
        </div>

        <button
          disabled={!weekQuality}
          onClick={() => setStep("meals")}
          className="w-full h-12 bg-primary text-primary-foreground rounded-xl font-semibold text-sm disabled:opacity-40 hover:bg-primary/90 transition-colors"
        >
          Continuar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-6">
      {/* Progress bar visual - main focus */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="text-lg">{usagePercent < 85 ? "🟢" : usagePercent < 100 ? "🟡" : "🔴"}</span>
            <span className="text-sm font-semibold">
              {usagePercent < 85 ? "Dentro do planejado" : usagePercent < 100 ? "Próximo do limite" : "Acima da margem"}
            </span>
          </div>
        </div>
        <div className="relative h-3 bg-secondary rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${getProgressColor()}`}
            style={{ width: `${Math.min(usagePercent, 100)}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground text-center">
          {remainingMargin >= 0
            ? `${remainingMargin.toLocaleString()} kcal restantes`
            : `${Math.abs(remainingMargin).toLocaleString()} kcal acima da margem`
          }
        </p>
      </div>

      {/* Refeições do dia */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Refeições do dia</h3>

        {[
          { key: "breakfast" as const, label: "Café da manhã" },
          { key: "lunch" as const, label: "Almoço" },
          { key: "dinnerBefore" as const, label: "Janta antes do evento" },
        ].map(({ key, label }) => (
          <div key={key} className="bg-card border border-border rounded-xl p-4 space-y-3">
            <p className="text-sm font-medium">{label}</p>
            <div className="space-y-2">
              {MEAL_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setMeals(prev => ({ ...prev, [key]: opt.value }))}
                  className={`w-full text-left px-3 py-2 rounded-lg border text-sm transition-all flex justify-between items-center ${
                    meals[key] === opt.value
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border hover:border-primary/40 text-foreground"
                  }`}
                >
                  <span>{opt.label}</span>
                  {opt.kcal > 0 && meals[key] === opt.value && (
                    <span className="text-xs text-muted-foreground">~{opt.kcal} kcal</span>
                  )}
                </button>
              ))}
            </div>
            {meals[key] !== "not_consumed" && (
              <p className="text-xs text-muted-foreground">
                Estimativa aproximada: ~{getMealKcal(meals[key])} kcal
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Food counters */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Evento / Noite</h3>
        <div className="bg-card border border-border rounded-xl divide-y divide-border">
          {foodItems.map((item, i) => (
            <div key={item.name} className="flex items-center justify-between p-3">
              <div>
                <p className="text-sm font-medium">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.kcalEach} kcal cada</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => updateItemQty(i, -1)}
                  className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:border-primary/60 transition-colors"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-6 text-center font-semibold text-sm">{item.quantity}</span>
                <button
                  onClick={() => updateItemQty(i, 1)}
                  className="w-8 h-8 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center hover:bg-primary/20 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5 text-primary" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-card border border-border rounded-xl p-4 space-y-2">
          <p className="text-sm font-medium">Alimento personalizado</p>
          <Input
            type="number"
            placeholder="kcal (opcional)"
            value={customKcal}
            onChange={e => setCustomKcal(e.target.value)}
            className="h-10"
          />
        </div>
      </div>

      {/* Summary */}
      <div className="bg-secondary/40 rounded-xl p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Refeições do dia</span>
          <span className="font-medium">{mealKcal.toLocaleString()} kcal</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Evento / noite</span>
          <span className="font-medium">{eventKcal.toLocaleString()} kcal</span>
        </div>
        {extraKcal > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Outros</span>
            <span className="font-medium">{extraKcal.toLocaleString()} kcal</span>
          </div>
        )}
        <div className="flex justify-between text-sm font-bold border-t border-border pt-2 mt-1">
          <span>Total utilizado</span>
          <span className={totalConsumed > adjustedMargin ? "text-destructive" : "text-primary"}>
            {totalConsumed.toLocaleString()} kcal
          </span>
        </div>
      </div>

      <button
        onClick={handleFinalize}
        className="w-full h-12 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
      >
        <CheckCircle2 className="h-4 w-4" />
        Finalizar Dia Livre
      </button>
    </div>
  );
}
