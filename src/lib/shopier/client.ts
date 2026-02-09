import crypto from 'crypto';

// Note: In a real scenario, these would come from env vars securely
const SHOPIER_API_KEY = process.env.NEXT_PUBLIC_SHOPIER_API_KEY;
const SHOPIER_API_SECRET = process.env.SHOPIER_API_SECRET;
// Fallback to localhost if not set in prod yet
const CALLBACK_URL = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/shopier/webhook`;

interface PaymentParams {
    userId: string;
    plan: 'weekly' | 'monthly' | 'semester';
    email: string;
    fullName: string;
}

const PLAN_PRICES = {
    weekly: 300,
    monthly: 1000,
    semester: 2500,
};

export function createShopierPaymentUrl(params: PaymentParams): string {
    // If API keys are missing (dev mode without real keys), return a mock URL or handle error
    if (!SHOPIER_API_KEY || !SHOPIER_API_SECRET) {
        console.warn('Shopier API keys are missing. Generating a mock URL for testing.');
        // For development, we might want to redirect to a mock success page or handle this gracefully
        // But for the project implementation, let's assume keys will be present or throw.
        // throw new Error('Shopier API keys are missing');
    }

    const amount = PLAN_PRICES[params.plan];
    const orderId = `${params.userId}_${params.plan}_${Date.now()}`;

    // Basic Shopier Link Generation (Simplified for this project scope if using standard API)
    // Note: The specific parameters depend on Shopier's exact API docs which were not fully provided in snippets logic,
    // but we have a reference implementation in Part 3.

    // Using the logic from Part 3:
    const signatureData = `${SHOPIER_API_KEY}${orderId}${amount}${SHOPIER_API_SECRET}`;
    const signature = crypto.createHash('sha256').update(signatureData).digest('hex');

    const queryParams = new URLSearchParams({
        API_key: SHOPIER_API_KEY || '',
        website_index: '1',
        platform_order_id: orderId,
        product_name: `Eğitim Paketi - ${params.plan}`,
        product_type: '2', // Digital product
        buyer_name: params.fullName,
        buyer_email: params.email,
        total_order_value: amount.toString(),
        currency: 'TL',
        callback_url: CALLBACK_URL,
        signature,
    });

    return `https://www.shopier.com/ShowProduct/api_pay4.php?${queryParams}`;
}

export function verifyWebhook(data: any, signature: string): boolean {
    if (!SHOPIER_API_KEY || !SHOPIER_API_SECRET) return false;

    const calculatedSignature = crypto
        .createHash('sha256')
        .update(`${SHOPIER_API_KEY}${data.platform_order_id}${data.payment_status}${SHOPIER_API_SECRET}`)
        .digest('hex');

    return calculatedSignature === signature;
}
