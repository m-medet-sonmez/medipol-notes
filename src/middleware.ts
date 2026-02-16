import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        request.cookies.set(name, value);
                    });
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    });
                    cookiesToSet.forEach(({ name, value, options }) => {
                        response.cookies.set(name, value, options);
                    });
                },
            },
        }
    );

    const { data: { user } } = await supabase.auth.getUser();

    // Protected routes check
    const isProtectedRoute =
        request.nextUrl.pathname.startsWith('/dashboard') ||
        request.nextUrl.pathname.startsWith('/admin');

    if (isProtectedRoute && !user) {
        return NextResponse.redirect(new URL('/giris', request.url));
    }

    // Admin routes check
    if (request.nextUrl.pathname.startsWith('/admin') && user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profile?.role !== 'admin' && profile?.role !== 'super_admin') {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
    }

    // Subscription check for Dashboard
    if (request.nextUrl.pathname.startsWith('/dashboard') && user) {
        // Skip check for subscription/profile pages to avoid loop
        if (
            request.nextUrl.pathname.includes('/dashboard/abonelik') ||
            request.nextUrl.pathname.includes('/dashboard/profil')
        ) {
            return response;
        }

        const { data: subscription } = await supabase
            .from('subscriptions')
            .select('subscription_end_date, is_active')
            .eq('user_id', user.id)
            .eq('is_active', true)
            .single();

        const isExpired = !subscription ||
            new Date(subscription.subscription_end_date) < new Date();

        if (isExpired) {
            return NextResponse.redirect(new URL('/checkout', request.url));
        }
    }

    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public (public folder)
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
