import { z } from "zod";

/**
 * Zod schema for user registration.
 * Includes validations for CPF, Age (18+), and matching fields.
 */
export const registerSchema = z.object({
    email: z.string().email("E-mail inválido"),
    confirmEmail: z.string().email("Confirmação de e-mail inválida"),
    birthDate: z.string().refine((val) => {
        const parts = val.split("/");
        if (parts.length !== 3) return false;
        const birth = new Date(+parts[2], +parts[1] - 1, +parts[0]);
        const age = (Date.now() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
        return age >= 18;
    }, "Você precisa ter 18+ anos e data válida (DD/MM/AAAA)"),
    cpf: z.string().refine((val) => val.replace(/\D/g, "").length === 11, "CPF inválido (11 dígitos)"),
    gender: z.string().min(1, "Selecione seu gênero"),
    cep: z.string().refine((val) => val.replace(/\D/g, "").length === 8, "CEP inválido"),
    address: z.string().min(1, "Endereço é obrigatório"),
    number: z.string().min(1, "Número é obrigatório"),
    district: z.string().min(1, "Bairro é obrigatório"),
    city: z.string().min(1, "Cidade é obrigatória"),
    state: z.string().min(1, "Estado é obrigatório"),
    country: z.string().default("brasil"),
    phone: z.string().refine((val) => val.replace(/\D/g, "").length >= 10, "Telefone inválido"),
    username: z.string().min(3, "Nome de usuário deve ter pelo menos 3 caracteres"),
    password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres").optional().or(z.literal("")),
    promoCode: z.string().optional(),
    acceptTerms: z.boolean().refine(val => val === true, "Você deve aceitar os termos"),
    acceptBonus: z.boolean().default(true),
}).refine((data) => data.email === data.confirmEmail, {
    message: "Os e-mails não coincidem",
    path: ["confirmEmail"],
});

export type RegisterFormData = z.infer<typeof registerSchema>;
