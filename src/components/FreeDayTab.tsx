import { useState } from "react";
import { CalcResults, MealsData, FoodItem, getClassification, getMealKcal } from "@/hooks/useAppData";
import { Plus, Minus, CheckCircle2, ChevronDown, ChevronUp, Coffee, UtensilsCrossed, Moon, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";

interface FreeDayTabProps {
  calcResults: CalcResults;
  onFinalize: (data: { totalConsumed: number; classification: "green" | "yellow" | "red"; weekQuality: string; mealsData: MealsData; emotion?: string }) => void;
  initialData?: MealsData | null;
}

const MEAL_OPTIONS = [
  { value: "not_consumed", label: "Não consumi" },
  { value: "light", label: "Igual à rotina" },
  { value: "moderate", label: "Um pouco a mais" },
  { value: "high", label: "Bem acima do normal" },
];

const DRINKS: FoodItem[] = [
  { name: "Cerveja lata 350ml", kcalEach: 150, quantity: 0 },
  { name: "Long neck 330ml", kcalEach: 140, quantity: 0 },
  { name: "Chopp 300ml", kcalEach: 120, quantity: 0 },
  { name: "Taça de vinho 150ml", kcalEach: 130, quantity: 0 },
  { name: "Whisky dose 50ml", kcalEach: 120, quantity: 0 },
  { name: "Vodka dose 50ml", kcalEach: 110, quantity: 0 },
  { name: "Refrigerante lata 350ml", kcalEach: 140, quantity: 0 },
];

const FOODS: FoodItem[] = [
  { name: "Lanche médio (hambúrguer simples)", kcalEach: 600, quantity: 0 },
  { name: "Porção de batata (150g)", kcalEach: 350, quantity: 0 },
  { name: "Fatia de pizza média", kcalEach: 300, quantity: 0 },
  { name: "Rodízio de petro (+ fritas)", kcalEach: 900, quantity: 0 },
  { name: "Sushi (6 unidades)", kcalEach: 250, quantity: 0 },
  { name: "Sashimi (6 unidades)", kcalEach: 180, quantity: 0 },
  { name: "Hot roll (4 unidades)", kcalEach: 320, quantity: 0 },
  { name: "Rodízio japonês (média geral)", kcalEach: 800, quantity: 0 },
  { name: "Churrasco (prato com acompanhamentos)", kcalEach: 900, quantity: 0 },
  { name: "Sobremesa média", kcalEach: 400, quantity: 0 },
];

const EMOTIONS = ["Satisfeito", "Exagerei", "Me senti culpado", "Valeu a pena"];

const RESULT_MESSAGES = {
  green: "Você aproveitou sem comprometer seu progresso.",
  yellow: "Houve exagero leve. Ajuste na próxima semana.",
  red: "Essa semana exigirá compensação estratégica.",
};

export function FreeDayTab({ calcResults, onFinalize, initialData }: FreeDayTabProps) {
  const [step, setStep] = useState<"meals" | "event" | "result">("meals");
  const [meals, setMeals] = useState({
    breakfast: initialData?.breakfast ?? "",
    lunch: initialData?.lunch ?? "",
    dinnerBefore: initialData?.dinnerBefore ?? "",
  });

  const allItems = [...DRINKS, ...FOODS];
  const [foodItems, setFoodItems] = useState<FoodItem[]>(
    initialData?.items ?? allItems.map(i => ({ ...i }))
  );
  const [customKcal, setCustomKcal] = useState(initialData?.customKcal?.toString() ?? "");
  const [emotion, setEmotion] = useState("");
  const [finalized, setFinalized] = useState(false);
  const [drinksOpen, setDrinksOpen] = useState(true);
  const [foodsOpen, setFoodsOpen] = useState(true);

  const margin = calcResults.dailyFreeDay;

  const mealKcal = getMealKcal(meals.breakfast) + getMealKcal(meals.lunch) + getMealKcal(meals.dinnerBefore);
  const eventKcal = foodItems.reduce((sum, item) => sum + item.kcalEach * item.quantity, 0);
  const extraKcal = parseFloat(customKcal) || 0;
  const totalConsumed = mealKcal + eventKcal + extraKcal;
  const remainingMargin = margin - mealKcal;
  const finalBalance = margin - totalConsumed;
  const classification = getClassification(totalConsumed, margin);

  const drinkItems = foodItems.slice(0, DRINKS.length);
  const foodItemsList = foodItems.slice(DRINKS.length);

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
    onFinalize({ totalConsumed, classification, weekQuality: "followed", mealsData, emotion });
    setFinalized(true);
  };

  const zoneEmoji = { green: "🟢", yellow: "🟡", red: "🔴" };
  const zoneLabel = { green: "Estratégico", yellow: "Atenção", red: "Fora do planejado" };
  const zoneColors = { green: "zone-green", yellow: "zone-yellow", red: "zone-red" };

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
            <span className="font-medium">{margin.toLocaleString()} kcal</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total consumido</span>
            <span className="font-medium">{totalConsumed.toLocaleString()} kcal</span>
          </div>
          <div className="flex justify-between text-sm font-semibold border-t border-border pt-2 mt-2">
            <span>{finalBalance >= 0 ? "Dentro da margem" : "Acima da margem"}</span>
            <span className={finalBalance >= 0 ? "text-primary" : "text-destructive"}>
              {finalBalance >= 0 ? `−${finalBalance.toLocaleString()}` : `+${Math.abs(finalBalance).toLocaleString()}`} kcal
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
          </div>
        )}

        <div className="space-y-2">
          <p className="text-sm font-medium">Como você se sentiu? <span className="text-muted-foreground">(opcional)</span></p>
          <div className="grid grid-cols-2 gap-2">
            {EMOTIONS.map(e => (
              <button
                key={e}
                onClick={() => setEmotion(prev => prev === e ? "" : e)}
                className={`h-10 rounded-lg border text-sm font-medium transition-all ${emotion === e
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

  // Step 1: Meals before event
  if (step === "meals") {
    return (
      <div className="space-y-5 pb-6">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Registre o consumo completo do seu dia especial.</p>
        </div>

        {/* Margin card */}
        <div className="bg-primary/10 border border-primary/20 rounded-2xl p-5 text-center space-y-1">
          <p className="text-xs font-medium text-primary">Margem total disponível para hoje</p>
          <p className="text-3xl font-bold text-primary">{margin.toLocaleString()} kcal</p>
        </div>

        {/* Meals */}
        <p className="text-sm font-medium text-muted-foreground">Refeições anteriores ao evento</p>

        {[
          { key: "breakfast" as const, label: "Café da manhã", icon: Coffee },
          { key: "lunch" as const, label: "Almoço", icon: UtensilsCrossed },
          { key: "dinnerBefore" as const, label: "Janta (antes do evento)", icon: Moon },
        ].map(({ key, label, icon: Icon }) => (
          <div key={key} className="bg-card border border-border rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Icon className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-semibold">{label}</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {MEAL_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setMeals(prev => ({ ...prev, [key]: opt.value }))}
                  className={`px-3 py-2.5 rounded-lg border text-xs font-medium transition-all ${meals[key] === opt.value
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-secondary/40 text-foreground hover:border-primary/40"
                    }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Remaining margin */}
        <div className="flex items-center justify-between bg-secondary/40 rounded-xl px-4 py-3">
          <p className="text-sm text-muted-foreground">Margem restante para o evento</p>
          <p className="text-lg font-bold text-foreground">{remainingMargin.toLocaleString()} kcal</p>
        </div>

        <button
          onClick={() => setStep("event")}
          className="w-full h-12 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors"
        >
          Continuar para o Evento
        </button>
      </div>
    );
  }

  // Step 2: Event items
  return (
    <div className="space-y-5 pb-6">
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">Registre o consumo completo do seu dia especial.</p>
      </div>

      {/* Margin card */}
      <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 text-center space-y-1">
        <p className="text-xs font-medium text-primary">Margem total disponível para hoje</p>
        <p className="text-2xl font-bold text-primary">{margin.toLocaleString()} kcal</p>
      </div>

      {/* Progress indicator */}
      <div className="flex items-center gap-2">
        <span className="text-sm">{totalConsumed <= margin ? "🟢" : "🔴"}</span>
        <span className="text-sm font-medium">
          {totalConsumed <= margin ? "Dentro do planejado" : "Acima da margem"}
        </span>
        <span className="text-xs text-muted-foreground ml-auto">
          {totalConsumed.toLocaleString()} / {margin.toLocaleString()} kcal
        </span>
      </div>

      <div className="relative h-2 bg-secondary rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${totalConsumed > margin ? "bg-destructive" : "bg-primary"}`}
          style={{ width: `${Math.min(100, (totalConsumed / margin) * 100)}%` }}
        />
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Restam {Math.max(0, margin - totalConsumed).toLocaleString()} kcal
      </p>

      {/* Event / Night section */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Evento / Noite</p>

        {/* Drinks */}
        <button
          onClick={() => setDrinksOpen(!drinksOpen)}
          className="w-full flex items-center justify-between bg-card border border-border rounded-xl px-4 py-3"
        >
          <div className="flex items-center gap-2">
            <span className="text-sm">🍺</span>
            <span className="text-sm font-semibold">Bebidas</span>
          </div>
          {drinksOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </button>

        {drinksOpen && (
          <div className="bg-card border border-border rounded-xl divide-y divide-border">
            {drinkItems.map((item, i) => (
              <div key={item.name} className="flex items-center justify-between p-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.kcalEach} kcal</p>
                </div>
                <div className="flex items-center gap-2.5 flex-shrink-0">
                  <span className="w-5 text-center font-semibold text-sm">{item.quantity}</span>
                  <button
                    onClick={() => updateItemQty(i, -1)}
                    className="w-7 h-7 rounded-full border border-border flex items-center justify-center hover:border-primary/60 transition-colors"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => updateItemQty(i, 1)}
                    className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Foods */}
        <button
          onClick={() => setFoodsOpen(!foodsOpen)}
          className="w-full flex items-center justify-between bg-card border border-border rounded-xl px-4 py-3"
        >
          <div className="flex items-center gap-2">
            <span className="text-sm">🍽️</span>
            <span className="text-sm font-semibold">Comidas</span>
          </div>
          {foodsOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </button>

        {foodsOpen && (
          <div className="bg-card border border-border rounded-xl divide-y divide-border">
            {foodItemsList.map((item, i) => {
              const globalIndex = DRINKS.length + i;
              return (
                <div key={item.name} className="flex items-center justify-between p-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.kcalEach} kcal</p>
                  </div>
                  <div className="flex items-center gap-2.5 flex-shrink-0">
                    <span className="w-5 text-center font-semibold text-sm">{item.quantity}</span>
                    <button
                      onClick={() => updateItemQty(globalIndex, -1)}
                      className="w-7 h-7 rounded-full border border-border flex items-center justify-center hover:border-primary/60 transition-colors"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => updateItemQty(globalIndex, 1)}
                      className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Custom */}
        <div className="bg-card border border-border rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm">✏️</span>
            <p className="text-sm font-semibold">Personalizado</p>
          </div>
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
          <span className="text-muted-foreground">Total do dia</span>
          <span className="font-bold">{totalConsumed.toLocaleString()} kcal</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Saldo</span>
          <span className={`font-bold ${finalBalance >= 0 ? "text-primary" : "text-destructive"}`}>
            {finalBalance >= 0 ? `${finalBalance.toLocaleString()}` : `−${Math.abs(finalBalance).toLocaleString()}`} kcal
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setStep("meals")}
          className="h-12 border border-border rounded-xl font-semibold text-sm text-foreground hover:bg-secondary/40 transition-colors flex items-center justify-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </button>
        <button
          onClick={handleFinalize}
          className="h-12 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors"
        >
          Realizar Dia Livre
        </button>
      </div>
    </div>
  );
}
