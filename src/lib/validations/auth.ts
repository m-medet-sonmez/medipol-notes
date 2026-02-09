import { z } from 'zod';

export const loginSchema = z.object({
    email: z.string().email('Geçerli bir e-posta adresi giriniz'),
    password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır'),
});

export const registerSchema = z.object({
    email: z.string().email('Geçerli bir e-posta adresi giriniz'),
    password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır'),
    fullName: z.string().min(2, 'Ad Soyad en az 2 karakter olmalıdır'),
    phone: z.string().optional(),
    group: z.enum(['Grup 1', 'Grup 2'], {
        required_error: 'Lütfen bir grup seçiniz',
        invalid_type_error: 'Geçersiz grup seçimi',
    }),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
