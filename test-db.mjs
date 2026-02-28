import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
    console.log('Fetching super_admin and admin emails...');
    const { data: admins, error } = await supabase
        .from('profiles')
        .select('email, role, full_name')
        .in('role', ['admin', 'super_admin']);

    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Admins:', admins);
    }
}

test();
