import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailParams {
    to: string;
    subject: string;
    html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
    try {
        // Resend Sandbox Restriction Handling
        // in dev mode, we can only send to the verified email
        let recipient = to;
        if (process.env.NODE_ENV === 'development') {
            const verifiedEmail = 'kadarasopain9999@gmail.com';
            console.log(`[Dev Mode] Overriding recipient ${to} with verified email ${verifiedEmail}`);
            recipient = verifiedEmail;
        }

        const data = await resend.emails.send({
            from: 'Medipol Notları <onboarding@resend.dev>', // Default Resend testing domain
            to: [recipient],
            subject: subject,
            html: html,
        });

        return { success: true, data };
    } catch (error) {
        console.error('Email sending failed:', error);
        return { success: false, error };
    }
}
