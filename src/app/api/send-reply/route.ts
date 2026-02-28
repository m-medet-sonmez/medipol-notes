import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/mail';

export async function POST(req: NextRequest) {
    try {
        const { to, subject, reply, studentName } = await req.json();

        if (!to || !subject || !reply) {
            return NextResponse.json(
                { success: false, error: 'Eksik parametreler' },
                { status: 400 }
            );
        }

        const htmlContent = `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #7c3aed, #6d28d9); padding: 24px 32px; border-radius: 12px 12px 0 0;">
                    <h1 style="color: white; margin: 0; font-size: 20px;">KafaRahat Destek</h1>
                </div>
                <div style="background: #f9fafb; padding: 32px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
                    <p style="color: #374151; font-size: 15px; line-height: 1.6;">
                        Merhaba${studentName ? ` ${studentName}` : ''},
                    </p>
                    <p style="color: #374151; font-size: 15px; line-height: 1.6;">
                        <strong>"${subject}"</strong> konulu destek talebinize yanıt verildi:
                    </p>
                    <div style="background: white; border-left: 4px solid #7c3aed; padding: 16px 20px; margin: 20px 0; border-radius: 0 8px 8px 0; color: #1f2937; font-size: 14px; line-height: 1.7; white-space: pre-wrap;">
${reply}
                    </div>
                    <p style="color: #6b7280; font-size: 13px; margin-top: 24px;">
                        Ek sorunuz varsa destek sayfamızdan yeni talep oluşturabilirsiniz.
                    </p>
                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
                    <p style="color: #9ca3af; font-size: 12px; text-align: center;">
                        Bu e-posta KafaRahat destek sistemi tarafından otomatik olarak gönderilmiştir.
                    </p>
                </div>
            </div>
        `;

        const result = await sendEmail({
            to,
            subject: `YNT: ${subject}`,
            html: htmlContent,
        });

        if (result.success) {
            return NextResponse.json({ success: true, data: result.data });
        } else {
            return NextResponse.json(
                { success: false, error: result.error },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('Send reply email error:', error);
        return NextResponse.json(
            { success: false, error: String(error) },
            { status: 500 }
        );
    }
}
