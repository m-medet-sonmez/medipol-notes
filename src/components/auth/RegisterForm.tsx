'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, RegisterFormData } from '@/lib/validations/auth';
import { useAuth } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import Link from 'next/link';

export function RegisterForm() {
    const { register, isLoading } = useAuth();

    const form = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            email: '',
            password: '',
            fullName: '',
            phone: '',
            // @ts-ignore
            group: undefined,
        },
    });

    function onSubmit(data: RegisterFormData) {
        register(data);
    }

    return (
        <div className="w-full space-y-8">
            <div className="text-center">
                <h2 className="text-2xl font-bold tracking-tight text-white">Kayıt Ol</h2>
                <p className="text-sm text-zinc-400 mt-2">
                    Ders notlarına erişmek için yeni bir hesap oluşturun
                </p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="fullName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-zinc-300">Ad Soyad</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Ahmet Yılmaz"
                                        {...field}
                                        className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500 focus-visible:ring-violet-500"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-zinc-300">E-posta</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="ornek@ogrenci.com"
                                        {...field}
                                        className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500 focus-visible:ring-violet-500"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-zinc-300">Telefon (İsteğe Bağlı)</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="0555 555 55 55"
                                        {...field}
                                        className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500 focus-visible:ring-violet-500"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="group"
                        render={({ field }) => (
                            <FormItem className="space-y-3">
                                <FormLabel className="text-zinc-300">Grup Seçimi <span className="text-red-500">*</span></FormLabel>
                                <FormControl>
                                    <RadioGroup
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        className="grid grid-cols-2 gap-4"
                                    >
                                        <FormItem>
                                            <FormControl>
                                                <RadioGroupItem value="Grup 1" id="r1" className="peer sr-only" />
                                            </FormControl>
                                            <FormLabel
                                                htmlFor="r1"
                                                className="flex flex-col items-center justify-between rounded-md border-2 border-zinc-700 bg-zinc-800/50 p-4 hover:bg-zinc-700 hover:text-white peer-data-[state=checked]:border-violet-500 [&:has([data-state=checked])]:border-violet-500 cursor-pointer transition-all text-zinc-300"
                                            >
                                                <span className="text-sm font-semibold">Grup 1</span>
                                            </FormLabel>
                                        </FormItem>
                                        <FormItem>
                                            <FormControl>
                                                <RadioGroupItem value="Grup 2" id="r2" className="peer sr-only" />
                                            </FormControl>
                                            <FormLabel
                                                htmlFor="r2"
                                                className="flex flex-col items-center justify-between rounded-md border-2 border-zinc-700 bg-zinc-800/50 p-4 hover:bg-zinc-700 hover:text-white peer-data-[state=checked]:border-violet-500 [&:has([data-state=checked])]:border-violet-500 cursor-pointer transition-all text-zinc-300"
                                            >
                                                <span className="text-sm font-semibold">Grup 2</span>
                                            </FormLabel>
                                        </FormItem>
                                    </RadioGroup>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-zinc-300">Şifre</FormLabel>
                                <FormControl>
                                    <Input
                                        type="password"
                                        placeholder="******"
                                        {...field}
                                        className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500 focus-visible:ring-violet-500"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button type="submit" className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white border-0" disabled={isLoading}>
                        {isLoading ? 'Kaydediliyor...' : 'Kayıt Ol'}
                    </Button>
                </form>
            </Form>

            <div className="text-center text-sm text-zinc-400">
                Zaten hesabınız var mı?{' '}
                <Link href="/giris" className="text-violet-400 hover:text-violet-300 hover:underline font-medium">
                    Giriş Yap
                </Link>
            </div>
        </div>
    );
}
