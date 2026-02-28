import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_123'); // Fallback for build time

interface SendEmailParams {
    to: string | string[];
    subject: string;
    html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
    try {
        const recipients = Array.isArray(to) ? to : [to];

        const data = await resend.emails.send({
            from: 'KafaRahat Destek <noreply@kafarahat.xyz>',
            to: recipients,
            subject: subject,
            html: html,
        });

        return { success: true, data };
    } catch (error) {
        console.error('Email sending failed:', error);
        return { success: false, error };
    }
}
