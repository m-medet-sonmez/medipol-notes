import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const supabase = await createClient();

    // Check if user is logged in
    const {
        data: { session },
    } = await supabase.auth.getSession();

    if (session) {
        await supabase.auth.signOut();
    }

    return NextResponse.json({ success: true }, {
        status: 200,
    });
}
