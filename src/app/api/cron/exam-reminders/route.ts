import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendEmail } from '@/lib/mail';
import { differenceInDays, startOfDay } from 'date-fns';

// This is required for cron jobs on Vercel
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        // Authenticate the cron request if needed (e.g., using a secret token in headers)
        const authHeader = request.headers.get('authorization');
        const cronSecret = process.env.CRON_SECRET;

        // If CRON_SECRET is set, require it (useful for security so random people don't trigger emails)
        if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        // Initialize Supabase admin client to bypass RLS and get all profiles/exams
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

        if (!supabaseUrl || !supabaseServiceKey) {
            console.error('Missing Supabase credentials for cron job');
            return new NextResponse('Server Configuration Error', { status: 500 });
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // 1. Fetch all published exams
        const { data: exams, error: examsError } = await supabase
            .from('exam_schedules')
            .select('*')
            .eq('is_published', true);

        if (examsError) throw examsError;
        if (!exams || exams.length === 0) {
            return NextResponse.json({ message: 'No published exams found' });
        }

        // 2. Identify exams that are EXACTLY 10 days away
        const now = startOfDay(new Date());

        const examsToRemind = exams.filter(exam => {
            const examDate = startOfDay(new Date(exam.exam_date));
            const daysLeft = differenceInDays(examDate, now);
            return daysLeft === 10;
        });

        if (examsToRemind.length === 0) {
            return NextResponse.json({ message: 'No exams are exactly 10 days away', count: 0 });
        }

        // 3. Fetch all users from profiles
        const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('email, full_name, role');

        if (profilesError) throw profilesError;
        if (!profiles || profiles.length === 0) {
            return NextResponse.json({ message: 'No users found to email' });
        }

        // Filter out admins if we only want to email students, or keep everyone.
        // The prompt says "platformda daha kaç kişi olursa hepsine mail yoluyla" (to everyone on the platform)
        const recipients = profiles.filter(p => p.email);

        let emailsSent = 0;

        // Group by exam type to avoid duplicate generic emails if multiple exams are 10 days away
        const examTypesToRemind = Array.from(new Set(examsToRemind.map(e => e.exam_type)));

        // 4. Send emails for each upcoming exam type
        for (const type of examTypesToRemind) {
            const examTypeName = type === 'vize' ? 'Vize' : type === 'final' ? 'Final' : 'Bütünleme';
            const subject = `Hatırlatma: ${examTypeName} Sınavlarına 10 Gün Kaldı!`;

            const htmlContent = `
                <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; color: #333;">
                    <h2 style="color: #4F46E5;">Sınav Hatırlatması ⏰</h2>
                    <p>Merhaba,</p>
                    <p><strong>${examTypeName}</strong> sınavlarına tam <strong>10 gün</strong> kaldı.</p>
                    <p>Sınavlarında başarılar dileriz!<br>KafaRahat Ekibi</p>
                </div>
            `;

            // Since Resend has rate limits, we should batch them or send individually.
            // For a platform scale, we might want to use Resend's batch API or BCC if it's identical.
            // But Resend allows sending to up to 50 recipients per request.

            // To be safe and personalize (if we want to use names later), we can map over recipients.
            // Since we don't have personal names in this specific template, we can send to an array of emails (up to 50 at a time).

            const chunkSize = 50;
            for (let i = 0; i < recipients.length; i += chunkSize) {
                const chunk = recipients.slice(i, i + chunkSize);
                const chunkEmails = chunk.map(r => r.email).filter(Boolean) as string[];

                if (chunkEmails.length > 0) {
                    await sendEmail({
                        to: chunkEmails, // Resend handles array of emails (up to 50)
                        subject: subject,
                        html: htmlContent,
                    });
                    emailsSent += chunkEmails.length;
                }
            }
        }

        return NextResponse.json({
            success: true,
            message: `Sent ${emailsSent} reminders for ${examsToRemind.length} exams.`
        });

    } catch (error: any) {
        console.error('Cron job error:', error);
        return new NextResponse(`Error: ${error.message}`, { status: 500 });
    }
}
