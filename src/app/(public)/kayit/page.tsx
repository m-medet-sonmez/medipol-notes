import { RegisterForm } from '@/components/auth/RegisterForm';
import { Meteors } from '@/components/ui/meteors';

export default function RegisterPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4 py-12">
            <div className="relative w-full max-w-md">
                {/* Gradient Blob Effect from Demo */}
                <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-violet-600 to-indigo-600 transform scale-[0.80] bg-red-500 rounded-full blur-3xl opacity-50" />

                {/* Card Container matching Demo style */}
                <div className="relative shadow-xl bg-gray-900 border border-gray-800 px-4 py-8 h-full overflow-hidden rounded-2xl flex flex-col justify-end items-start w-full">
                    <div className="w-full relative z-50">
                        <RegisterForm />
                    </div>

                    {/* Meteors contained within the card */}
                    <Meteors number={20} />
                </div>
            </div>
        </div>
    );
}
