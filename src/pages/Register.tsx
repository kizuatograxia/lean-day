import React, { useState, useCallback, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Mail, Lock, Eye, EyeOff, User, Phone, MapPin, Calendar,
    CreditCard, ChevronRight, ChevronLeft, Check, Gift, Loader2,
    Smartphone, Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { GoogleLogin } from "@react-oauth/google";
import { api } from "@/lib/api";
import { CPFGate } from "@/components/gate/CPFGate";
import { registerSchema, RegisterFormData } from "@/lib/schemas";
import { storage } from "@/lib/storage";
import mascotZe from "@/assets/mascot-ze.png";

const INITIAL_FORM: RegisterFormData = {
    email: "", confirmEmail: "", birthDate: "", cpf: "", gender: "",
    address: "", number: "", district: "", city: "", state: "", cep: "", country: "brasil", phone: "",
    username: "", password: "", promoCode: "", acceptTerms: false, acceptBonus: true,
};

// ─── Masks ──────────────────────────────────────────────
const maskCPF = (v: string) => v.replace(/\D/g, "").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2").slice(0, 14);
const maskCEP = (v: string) => v.replace(/\D/g, "").replace(/(\d{5})(\d)/, "$1-$2").slice(0, 9);
const maskPhone = (v: string) => v.replace(/\D/g, "").replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2").slice(0, 15);
const maskDate = (v: string) => v.replace(/\D/g, "").replace(/(\d{2})(\d)/, "$1/$2").replace(/(\d{2})(\d)/, "$1/$2").slice(0, 10);

// ─── Stepper ────────────────────────────────────────────
const steps = [
    { label: "Identificação", icon: User },
    { label: "Endereço", icon: MapPin },
    { label: "Conta", icon: Gift },
];

const Stepper: React.FC<{ current: number }> = ({ current }) => (
    <div className="flex items-center justify-center gap-1 mb-8">
        {steps.map((s, i) => {
            const done = i < current;
            const active = i === current;
            return (
                <React.Fragment key={i}>
                    <div className="flex flex-col items-center gap-1.5">
                        <div className={`
              w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 border-2
              ${done ? "bg-primary border-primary text-primary-foreground" : active ? "bg-primary border-primary text-primary-foreground shadow-glow" : "bg-muted border-border text-muted-foreground"}
            `}>
                            {done ? <Check className="w-5 h-5" /> : <s.icon className="w-5 h-5" />}
                        </div>
                        <span className={`text-[10px] font-semibold ${active ? "text-primary" : done ? "text-primary" : "text-muted-foreground"}`}>
                            {s.label}
                        </span>
                    </div>
                    {i < steps.length - 1 && (
                        <div className={`w-12 h-0.5 mt-[-18px] rounded-full transition-all ${done ? "bg-primary" : "bg-border"}`} />
                    )}
                </React.Fragment>
            );
        })}
    </div>
);

// ─── Input component helper ───────────────────────────
const Field: React.FC<{
    icon: React.ReactNode; label: string; id: string; placeholder: string;
    value: string; onChange: (v: string) => void; type?: string; rightIcon?: React.ReactNode;
    error?: string;
}> = ({ icon, label, id, placeholder, value, onChange, type = "text", rightIcon, error }) => (
    <div className="space-y-1.5">
        <Label htmlFor={id} className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">{label}</Label>
        <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</span>
            <input
                id={id} type={type} placeholder={placeholder} value={value}
                onChange={e => onChange(e.target.value)}
                className={`w-full h-12 pl-11 pr-4 rounded-xl border ${error ? 'border-destructive' : 'border-input'} bg-background/50 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm font-medium`}
            />
            {rightIcon && <span className="absolute right-3 top-1/2 -translate-y-1/2">{rightIcon}</span>}
        </div>
        {error && <p className="text-[10px] text-destructive font-medium pl-1">{error}</p>}
    </div>
);

// ─── Page ───────────────────────────────────────────────
const Register: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const resetToken = searchParams.get('token');

    const initialView = resetToken ? 'reset-password' : (location.pathname.includes('login') ? 'login' : 'register');
    const { register: registerUser, login, googleLogin, user, updateUser } = useAuth();
    const [view, setView] = useState<'register' | 'login' | 'forgot-password' | 'reset-password'>(initialView);
    const [step, setStep] = useState<-1 | 0 | 1 | 2>(-1);
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isGoogleAuth, setIsGoogleAuth] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        getValues,
        trigger,
        watch,
        formState: { errors },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
        defaultValues: INITIAL_FORM,
        mode: "onBlur"
    });

    // Password Recovery State
    const [recoveryEmail, setRecoveryEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!recoveryEmail) { toast.error("Informe seu e-mail"); return; }
        setIsSubmitting(true);
        try {
            await api.forgotPassword(recoveryEmail);
            toast.success("E-mail enviado!", { description: "Verifique sua caixa de entrada para as instruções." });
            setRecoveryEmail("");
        } catch (error: any) {
            toast.error(error.message || "Erro ao solicitar recuperação");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmNewPassword) { toast.error("As senhas não coincidem"); return; }
        if (newPassword.length < 6) { toast.error("A senha deve ter 6+ caracteres"); return; }
        setIsSubmitting(true);
        try {
            if (!resetToken) throw new Error("Token de redefinição ausente");
            await api.resetPassword(resetToken, newPassword);
            toast.success("Senha redefinida com sucesso!", { description: "Você já pode fazer login com sua nova senha." });
            setView('login');
            navigate('/login');
        } catch (error: any) {
            toast.error(error.message || "Erro ao redefinir senha");
        } finally {
            setIsSubmitting(false);
        }
    };

    const [cepLoading, setCepLoading] = useState(false);

    // Login state
    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");


    const handleBlurCep = async () => {
        const rawCep = getValues("cep").replace(/\D/g, '');
        if (rawCep.length === 8) {
            setCepLoading(true);
            try {
                const response = await fetch(`https://viacep.com.br/ws/${rawCep}/json/`);
                const data = await response.json();
                if (!data.erro) {
                    setValue("address", data.logradouro);
                    setValue("district", data.bairro);
                    setValue("city", data.localidade);
                    setValue("state", data.uf);
                    document.getElementById('number')?.focus();
                } else {
                    toast.error("CEP não encontrado");
                }
            } catch (error) {
                toast.error("Erro ao buscar CEP");
            } finally {
                setCepLoading(false);
            }
        }
    };

    const validateStep = async (s: number): Promise<boolean> => {
        if (s === 0) {
            return await trigger(["email", "confirmEmail", "birthDate", "cpf", "gender"]);
        }
        if (s === 1) {
            return await trigger(["cep", "address", "number", "district", "city", "state", "phone"]);
        }
        if (s === 2) {
            const fields: (keyof RegisterFormData)[] = ["username", "acceptTerms"];
            if (!isGoogleAuth) fields.push("password");
            return await trigger(fields);
        }
        return true;
    };

    const next = async () => {
        if (step >= 0) {
            const isValid = await validateStep(step);
            if (!isValid) return;
        }
        setStep(prev => Math.min(prev + 1, 2) as any);
    };
    const prev = () => setStep(prev => Math.max(prev - 1, -1) as any);

    const onSubmit = async (data: RegisterFormData) => {
        setIsSubmitting(true);
        try {
            if (isGoogleAuth) {
                if (user?.id) {
                    await api.updateProfile(user.id, data);
                    updateUser({
                        ...data,
                        profile_complete: true,
                    });
                }
                toast.success("Perfil completo e conta criada! 🎉");
                navigate("/");
            } else {
                const result = await registerUser(data.email, data.password || "");
                if (result.success) {
                    const sessionUser = storage.getUser();
                    if (sessionUser?.id) {
                        try {
                            await api.updateProfile(sessionUser.id, data);
                            updateUser({
                                ...data,
                                profile_complete: true,
                            });
                        } catch (profileErr) {
                            console.warn("Profile save failed, continuing:", profileErr);
                        }
                    }
                    toast.success("Conta criada com sucesso!");
                    setIsGoogleAuth(false);
                    setStep(-1);
                } else {
                    toast.error(result.error || "Erro ao criar conta");
                }
            }
        } catch {
            toast.error("Erro inesperado");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!loginEmail || !loginPassword) { toast.error("Preencha email e senha"); return; }
        setIsSubmitting(true);
        try {
            const response = await login(loginEmail, loginPassword);
            if (response.success) {
                toast.success("Bem-vindo de volta!");
                navigate("/");
            } else {
                toast.error(response.error || "Falha ao entrar");
            }
        } catch {
            toast.error("Erro ao fazer login");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGoogleSuccess = async (cred: any) => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        try {
            const r = await googleLogin(cred.credential!);
            if (r.success) {
                toast.success("Login com Google realizado!");
                if (view === 'login') {
                    navigate("/");
                } else {
                    const sessionUser = storage.getUser();
                    if (sessionUser?.profile_complete) {
                        toast.success("Perfil já completo! Redirecionando...");
                        navigate("/");
                    } else {
                        setIsGoogleAuth(true);
                        setStep(0);
                    }
                }
            }
        } catch {
            toast.error("Falha no login com Google");
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        if (isGoogleAuth && user?.email) {
            setValue("email", user.email);
            setValue("confirmEmail", user.email);
        }
    }, [isGoogleAuth, user, setValue]);

    // ─── Step Content ─────────────────────────────────────
    const renderStep = () => {
        const variants = {
            enter: { opacity: 0, x: 40 },
            center: { opacity: 1, x: 0 },
            exit: { opacity: 0, x: -40 },
        };

        if (view === 'login') {
            return (
                <motion.div key="login" variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="space-y-5">
                    <div className="text-center space-y-2">
                        <h2 className="text-2xl font-extrabold text-foreground">Bem-vindo de volta! 👋</h2>
                        <p className="text-muted-foreground text-sm">Entre na sua conta para continuar</p>
                    </div>

                    {/* Social buttons */}
                    <div className="space-y-3">
                        <div className="flex justify-center">
                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={() => toast.error("Erro no Google")}
                                width={340}
                                theme="filled_black"
                                shape="pill"
                            />
                        </div>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-3 text-muted-foreground font-semibold">ou entre com e-mail</span>
                        </div>
                    </div>

                    <form onSubmit={handleLoginSubmit} className="space-y-4">
                        <Field
                            icon={<Mail className="w-4 h-4" />}
                            label="Email"
                            id="loginEmail"
                            placeholder="seu@email.com"
                            value={loginEmail}
                            onChange={setLoginEmail}
                            type="email"
                        />
                        <Field
                            icon={<Lock className="w-4 h-4" />}
                            label="Senha"
                            id="loginPassword"
                            placeholder="••••••••"
                            value={loginPassword}
                            onChange={setLoginPassword}
                            type={showPassword ? "text" : "password"}
                            rightIcon={
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-muted-foreground hover:text-foreground">
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            }
                        />
                        <Button type="submit" className="w-full h-12 rounded-xl text-lg font-bold" disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "ENTRAR AGORA"}
                        </Button>
                        <div className="flex justify-center">
                            <button type="button" onClick={() => setView('forgot-password')} className="text-xs text-muted-foreground hover:text-primary transition-colors">
                                Esqueci minha senha
                            </button>
                        </div>
                    </form>

                    <p className="text-center text-xs text-muted-foreground">
                        Não tem conta?{" "}
                        <button onClick={() => setView('register')} className="text-primary font-bold hover:underline">Cadastre-se grátis</button>
                    </p>
                </motion.div>
            );
        }

        if (view === 'forgot-password') {
            return (
                <motion.div key="forgot" variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="space-y-5">
                    <div className="text-center space-y-2">
                        <h2 className="text-2xl font-extrabold text-foreground">Recuperar Senha 🔑</h2>
                        <p className="text-muted-foreground text-sm">Insira seu e-mail para receber as instruções</p>
                    </div>
                    <form onSubmit={handleForgotPassword} className="space-y-4">
                        <Field
                            icon={<Mail className="w-4 h-4" />}
                            label="E-mail"
                            id="recoveryEmail"
                            placeholder="seu@email.com"
                            value={recoveryEmail}
                            onChange={setRecoveryEmail}
                            type="email"
                        />
                        <Button type="submit" className="w-full h-12 rounded-xl text-lg font-bold" disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "ENVIAR INSTRUÇÕES"}
                        </Button>
                    </form>
                    <button onClick={() => setView('login')} className="w-full text-center text-xs text-muted-foreground hover:text-primary flex items-center justify-center gap-2">
                        <ChevronLeft className="w-3 h-3" /> Voltar para o Login
                    </button>
                </motion.div>
            );
        }

        if (view === 'reset-password') {
            return (
                <motion.div key="reset" variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="space-y-5">
                    <div className="text-center space-y-2">
                        <h2 className="text-2xl font-extrabold text-foreground">Nova Senha 🛡️</h2>
                        <p className="text-muted-foreground text-sm">Crie uma senha forte e segura</p>
                    </div>
                    <form onSubmit={handleResetPassword} className="space-y-4">
                        <Field
                            icon={<Lock className="w-4 h-4" />}
                            label="Nova Senha"
                            id="newPassword"
                            placeholder="••••••••"
                            value={newPassword}
                            onChange={setNewPassword}
                            type={showPassword ? "text" : "password"}
                            rightIcon={
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-muted-foreground hover:text-foreground">
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            }
                        />
                        <Field
                            icon={<Lock className="w-4 h-4" />}
                            label="Confirmar Nova Senha"
                            id="confirmNewPassword"
                            placeholder="••••••••"
                            value={confirmNewPassword}
                            onChange={setConfirmNewPassword}
                            type={showPassword ? "text" : "password"}
                        />
                        <Button type="submit" className="w-full h-12 rounded-xl text-lg font-bold" disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "ATUALIZAR SENHA"}
                        </Button>
                    </form>
                </motion.div>
            );
        }

        if (step === -1) {
            return (
                <motion.div key="social" variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="space-y-5">
                    <div className="text-center space-y-2">
                        <h2 className="text-2xl font-extrabold text-foreground">Cadastre-se agora!</h2>
                        <p className="text-muted-foreground text-sm">Escolha como deseja se cadastrar</p>
                    </div>

                    {/* Social buttons */}
                    <div className="space-y-3">
                        <div className="flex justify-center">
                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={() => toast.error("Erro no Google")}
                                width={340}
                                text="signup_with"
                                theme="filled_black"
                                shape="pill"
                            />
                        </div>

                        <div className="flex justify-center">
                            <button className="w-[340px] h-[40px] rounded-full border border-input bg-card hover:bg-accent/10 text-foreground text-sm font-medium flex items-center justify-center gap-3 transition-colors">
                                <svg className="w-5 h-5 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                                Cadastrar com Facebook
                            </button>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-3 text-muted-foreground font-semibold">ou cadastre com e-mail</span>
                        </div>
                    </div>

                    <button
                        onClick={() => setStep(0)}
                        className="w-full h-12 rounded-xl border border-primary/50 text-primary font-bold flex items-center justify-center gap-3 hover:bg-primary/10 transition-all"
                    >
                        <Mail className="w-5 h-5" />
                        Cadastrar com E-mail
                    </button>

                    <p className="text-center text-xs text-muted-foreground">
                        Já tem conta?{" "}
                        <button onClick={() => setView('login')} className="text-primary font-bold hover:underline">Faça login</button>
                    </p>
                </motion.div>
            );
        }

        if (step === 0) {
            return (
                <motion.div key="step0" variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="space-y-4">
                    <div className="space-y-1">
                        <h2 className="text-xl font-extrabold text-foreground">Vamos começar! 🎯</h2>
                        <p className="text-muted-foreground text-xs">Insira seus dados para garantir sua segurança.</p>
                    </div>
                    {/* If Google Auth, maybe restrict editing email? Or let them confirm? 
                        The requirement implies using gmail data, so pre-fill is good.
                        Maybe disable readOnly to allow correction if needed, but Google email is usually fixed for the account.
                    */}
                    <div className={isGoogleAuth ? "opacity-70 pointer-events-none" : ""}>
                        <Field icon={<Mail className="w-4 h-4" />} label="E-mail" id="email" placeholder="seu@email.com" value={watch("email")} onChange={v => setValue("email", v)} type="email" error={errors.email?.message} />
                    </div>
                    {!isGoogleAuth && (
                        <Field icon={<Mail className="w-4 h-4" />} label="Confirmar E-mail" id="confirmEmail" placeholder="seu@email.com" value={watch("confirmEmail")} onChange={v => setValue("confirmEmail", v)} type="email" error={errors.confirmEmail?.message} />
                    )}

                    <Field icon={<Calendar className="w-4 h-4" />} label="Data de Nascimento" id="birthDate" placeholder="DD/MM/AAAA" value={watch("birthDate")} onChange={v => setValue("birthDate", maskDate(v))} error={errors.birthDate?.message} />
                    <Field icon={<CreditCard className="w-4 h-4" />} label="CPF" id="cpf" placeholder="000.000.000-00" value={watch("cpf")} onChange={v => setValue("cpf", maskCPF(v))} error={errors.cpf?.message} />
                    <div className="space-y-1.5">
                        <Label className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">Gênero</Label>
                        <Select value={watch("gender")} onValueChange={v => setValue("gender", v)}>
                            <SelectTrigger className={`h-12 rounded-xl border ${errors.gender ? 'border-destructive' : 'border-input'} bg-background/50 text-foreground focus:ring-1 focus:ring-primary focus:border-primary`}>
                                <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                            <SelectContent className="bg-card border-border text-foreground">
                                <SelectItem value="masculino">Masculino</SelectItem>
                                <SelectItem value="feminino">Feminino</SelectItem>
                                <SelectItem value="outro">Outro</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.gender && <p className="text-[10px] text-destructive font-medium pl-1">{errors.gender.message}</p>}
                    </div>
                </motion.div>
            );
        }

        if (step === 1) {
            return (
                <motion.div key="step1" variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="space-y-4">
                    <div className="space-y-1">
                        <h2 className="text-xl font-extrabold text-foreground">Quase lá! 📍</h2>
                        <p className="text-muted-foreground text-xs">Onde a sorte te encontra?</p>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="cep" className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">CEP</Label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                {cepLoading ? <Loader2 className="w-4 h-4 animate-spin text-primary" /> : <MapPin className="w-4 h-4" />}
                            </span>
                            <input
                                id="cep" type="text" placeholder="00000-000" value={watch("cep")}
                                onChange={e => {
                                    const v = maskCEP(e.target.value);
                                    setValue("cep", v);
                                }}
                                onBlur={handleBlurCep}
                                className={`w-full h-12 pl-11 pr-4 rounded-xl border ${errors.cep ? 'border-destructive' : 'border-input'} bg-background/50 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm font-medium`}
                            />
                            {errors.cep && <p className="text-[10px] text-destructive font-medium pl-1 mt-1">{errors.cep.message}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-[1fr,100px] gap-4">
                        <Field icon={<MapPin className="w-4 h-4" />} label="Endereço (Rua)" id="address" placeholder="Rua da Sorte" value={watch("address")} onChange={v => setValue("address", v)} error={errors.address?.message} />
                        <Field icon={<MapPin className="w-4 h-4" />} label="Número" id="number" placeholder="123" value={watch("number")} onChange={v => setValue("number", v)} error={errors.number?.message} />
                    </div>

                    <Field icon={<MapPin className="w-4 h-4" />} label="Bairro" id="district" placeholder="Centro" value={watch("district")} onChange={v => setValue("district", v)} error={errors.district?.message} />

                    <div className="grid grid-cols-[1fr,80px] gap-4">
                        <Field icon={<MapPin className="w-4 h-4" />} label="Cidade" id="city" placeholder="Sua cidade" value={watch("city")} onChange={v => setValue("city", v)} error={errors.city?.message} />
                        <Field icon={<MapPin className="w-4 h-4" />} label="Estado" id="state" placeholder="UF" value={watch("state")} onChange={v => setValue("state", v)} error={errors.state?.message} />
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">País</Label>
                        <Select value={watch("country")} onValueChange={v => setValue("country", v)}>
                            <SelectTrigger className="h-12 rounded-xl border border-input bg-background/50 text-foreground focus:ring-1 focus:ring-primary focus:border-primary">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-card border-border text-foreground">
                                <SelectItem value="brasil">🇧🇷 Brasil</SelectItem>
                                <SelectItem value="portugal">🇵🇹 Portugal</SelectItem>
                                <SelectItem value="outro">Outro</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Field icon={<Smartphone className="w-4 h-4" />} label="Celular" id="phone" placeholder="(00) 90000-0000" value={watch("phone")} onChange={v => setValue("phone", maskPhone(v))} type="tel" error={errors.phone?.message} />
                </motion.div>
            );
        }

        return (
            <motion.div key="step2" variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="space-y-4">
                <div className="space-y-1">
                    <h2 className="text-xl font-extrabold text-foreground">Defina seu acesso 🏆</h2>
                    <p className="text-muted-foreground text-xs">Crie seu login e comece a ganhar!</p>
                </div>
                <Field icon={<User className="w-4 h-4" />} label="Nome de Usuário" id="username" placeholder="ReiDoBicho2024" value={watch("username")} onChange={v => setValue("username", v)} error={errors.username?.message} />

                {!isGoogleAuth && (
                    <Field
                        icon={<Lock className="w-4 h-4" />} label="Senha" id="password" placeholder="••••••••"
                        value={watch("password") || ""} onChange={v => setValue("password", v)}
                        type={showPassword ? "text" : "password"}
                        error={errors.password?.message}
                        rightIcon={
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-muted-foreground hover:text-foreground">
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        }
                    />
                )}

                <Field icon={<Gift className="w-4 h-4" />} label="Código Promocional (opcional)" id="promo" placeholder="BONUS2024" value={watch("promoCode") || ""} onChange={v => setValue("promoCode", v)} />

                <div className="space-y-3 pt-2">
                    <label className="flex items-start gap-3 cursor-pointer">
                        <Checkbox
                            checked={watch("acceptTerms")}
                            onCheckedChange={v => setValue("acceptTerms", !!v)}
                            className={`mt-0.5 border-input data-[state=checked]:bg-primary data-[state=checked]:border-primary ${errors.acceptTerms ? 'border-destructive' : ''}`}
                        />
                        <span className="text-xs text-muted-foreground leading-relaxed">
                            Li e aceito os <a href="#" className="text-primary font-semibold hover:underline">Termos e Condições</a> e a{" "}
                            <a href="#" className="text-primary font-semibold hover:underline">Política de Privacidade</a>.
                            {errors.acceptTerms && <p className="text-[10px] text-destructive font-medium">{errors.acceptTerms.message}</p>}
                        </span>
                    </label>
                    <label className="flex items-start gap-3 cursor-pointer">
                        <Checkbox
                            checked={watch("acceptBonus")}
                            onCheckedChange={v => setValue("acceptBonus", !!v)}
                            className="mt-0.5 border-input data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                        <span className="text-xs text-muted-foreground leading-relaxed">
                            Quero receber bônus, promoções e novidades por e-mail. 🎁
                        </span>
                    </label>
                </div>
            </motion.div>
        );
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 font-sans">
            {/* CPF Gate only for Registration */}
            {view === 'register' && (
                <CPFGate>
                    <></>
                </CPFGate>
            )}

            <div className="w-full max-w-md">
                {/* Stepper (only for wizard steps and IF in register view) */}
                {view === 'register' && step >= 0 && <Stepper current={step} />}

                {/* Form area */}
                <div className="bg-card/50 backdrop-blur-sm rounded-2xl shadow-lg border border-border p-6 sm:p-8">
                    <AnimatePresence mode="wait">
                        {renderStep()}
                    </AnimatePresence>

                    {/* Navigation buttons (Wizard only) */}
                    {view === 'register' && (
                        <div className="mt-6 space-y-3">
                            {step === -1 ? null : step < 2 ? (
                                <>
                                    <button
                                        onClick={next}
                                        className="w-full h-13 rounded-xl bg-primary text-primary-foreground font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-primary/90 active:scale-[0.98] transition-all shadow-glow py-3.5"
                                    >
                                        Próxima <ChevronRight className="w-5 h-5" />
                                    </button>
                                    {step > 0 && (
                                        <button onClick={prev} className="w-full text-center text-sm text-muted-foreground hover:text-foreground font-medium py-2">
                                            <ChevronLeft className="w-4 h-4 inline mr-1" /> Voltar
                                        </button>
                                    )}
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={handleSubmit(onSubmit)}
                                        disabled={isSubmitting}
                                        className="w-full h-13 rounded-xl bg-primary text-primary-foreground font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-primary/90 active:scale-[0.98] transition-all shadow-glow disabled:opacity-50 py-3.5"
                                    >
                                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <>CRIAR CONTA E APOSTAR 🎲</>}
                                    </button>
                                    <button onClick={prev} className="w-full text-center text-sm text-muted-foreground hover:text-foreground font-medium py-2">
                                        <ChevronLeft className="w-4 h-4 inline mr-1" /> Voltar
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {view === 'register' && step === -1 && (
                    <div className="text-center mt-6">
                        <p className="text-sm text-muted-foreground">
                            Já tem conta? <button onClick={() => setView('login')} className="text-primary hover:underline font-bold">Faça login</button>
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Register;
