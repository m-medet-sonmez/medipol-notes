import { Resend } from 'resend';

const resend = new Resend('re_cD5MpMwk_CCsqDzHPogVYTPFB5xPh9Ezg');

async function test() {
    console.log('Sending test email to random unverified address...');
    const response = await resend.emails.send({
        from: 'KafaRahat Destek <noreply@kafarahat.xyz>',
        to: 'test123notreal9999@yahoo.com', // Random email
        subject: 'Test email with Domain',
        html: '<p>Test.</p>'
    });
    console.log('Response:', response);
}
test();
