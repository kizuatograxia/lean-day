import { useState } from "react";
import { UserData } from "@/hooks/useAppData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronRight } from "lucide-react";

interface SetupFormProps {
  onComplete: (data: UserData) => void;
  initialData?: UserData | null;
  compact?: boolean;
}

export function SetupForm({ onComplete, initialData, compact = false }: SetupFormProps) {
  const [form, setForm] = useState({
    weight: initialData?.weight?.toString() ?? "",
    height: initialData?.height?.toString() ?? "",
    age: initialData?.age?.toString() ?? "",
    sex: initialData?.sex ?? "male" as "male" | "female",
    activityLevel: initialData?.activityLevel ?? "moderate" as UserData["activityLevel"],
    weeklyGoal: initialData?.weeklyGoal?.toString() ?? "0.5",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.weight || !form.height || !form.age) return;
    onComplete({
      weight: parseFloat(form.weight),
      height: parseFloat(form.height),
      age: parseInt(form.age),
      sex: form.sex,
      activityLevel: form.activityLevel,
      weeklyGoal: parseFloat(form.weeklyGoal) as 0.25 | 0.5 | 0.75,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {!compact && (
        <div className="text-center space-y-2 pb-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Lean Day sem sabotar seu progresso
          </h1>
          <p className="text-muted-foreground text-sm">
            Configure seus dados para descobrir sua margem segura para o final de semana
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Peso (kg)</Label>
          <Input
            type="number"
            placeholder="75"
            value={form.weight}
            onChange={e => setForm(p => ({ ...p, weight: e.target.value }))}
            className="text-center font-semibold text-lg h-12"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Altura (cm)</Label>
          <Input
            type="number"
            placeholder="175"
            value={form.height}
            onChange={e => setForm(p => ({ ...p, height: e.target.value }))}
            className="text-center font-semibold text-lg h-12"
            required
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Idade</Label>
        <Input
          type="number"
          placeholder="30"
          value={form.age}
          onChange={e => setForm(p => ({ ...p, age: e.target.value }))}
          className="text-center font-semibold text-lg h-12"
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Sexo</Label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setForm(p => ({ ...p, sex: "male" }))}
            className={`h-12 rounded-lg border-2 font-semibold text-sm transition-all ${form.sex === "male"
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-foreground hover:border-primary/50"
              }`}
          >
            Masculino
          </button>
          <button
            type="button"
            onClick={() => setForm(p => ({ ...p, sex: "female" }))}
            className={`h-12 rounded-lg border-2 font-semibold text-sm transition-all ${form.sex === "female"
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-foreground hover:border-primary/50"
              }`}
          >
            Feminino
          </button>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Nível de atividade</Label>
        <Select value={form.activityLevel} onValueChange={v => setForm(p => ({ ...p, activityLevel: v as UserData["activityLevel"] }))}>
          <SelectTrigger className="h-12">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sedentary">Sedentário</SelectItem>
            <SelectItem value="light">Levemente ativo</SelectItem>
            <SelectItem value="moderate">Moderadamente ativo</SelectItem>
            <SelectItem value="active">Muito ativo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Meta de perda semanal</Label>
        <div className="grid grid-cols-3 gap-2">
          {["0.25", "0.5", "0.75"].map(v => (
            <button
              key={v}
              type="button"
              onClick={() => setForm(p => ({ ...p, weeklyGoal: v }))}
              className={`h-12 rounded-lg border-2 font-semibold text-sm transition-all flex flex-col items-center justify-center leading-tight ${form.weeklyGoal === v
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground hover:border-primary/50"
                }`}
            >
              <span>{v} kg</span>
            </button>
          ))}
        </div>
      </div>

      <Button type="submit" className="w-full h-13 text-base font-semibold" size="lg">
        {compact ? "Salvar alterações" : "Gerar Meu Plano Semanal"}
        <ChevronRight className="ml-1 h-4 w-4" />
      </Button>
    </form>
  );
}
