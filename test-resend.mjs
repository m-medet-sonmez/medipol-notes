import { Resend } from 'resend';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const resend = new Resend(process.env.RESEND_API_KEY);

async function testMail() {
    try {
        console.log("Sending with key:", process.env.RESEND_API_KEY ? "EXISTS" : "MISSING");
        const data = await resend.emails.send({
            from: 'KafaRahat Destek <onboarding@resend.dev>', // Use onboarding in case domain is unverified
            to: ['kadarasopain9999@gmail.com'], // Using the admin's email as target
            subject: 'Test - Domain Verification Check',
            html: '<p>If this works, domain kafarahat.xyz is not fully verified yet on Resend.</p>',
        });

        console.log("Success! Data:", data);
    } catch (error) {
        console.error("Resend error:", error);
    }
}

testMail();
