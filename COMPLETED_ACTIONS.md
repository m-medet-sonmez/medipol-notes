# User Profile Dropdown System Implementation

I have implemented the complete user profile and group system as requested. Since the project uses Supabase directly and not Prisma, I have provided the SQL migration file instead of running `prisma migrate`.

## 1. Database Migration (⚠️ ACTION REQUIRED)
You must apply the changes to your Supabase database.
1.  Open your Supabase Dashboard -> SQL Editor.
2.  Run the contents of the file `add_user_group.sql`.
    -   This adds `department` and `student_group` columns to `profiles`.
    -   Updates the `handle_new_user` trigger to automatically save these fields on registration.

## 2. Code Changes
-   **Validation**: Updated `src/lib/validations/auth.ts` to require group selection.
-   **Registration**: Updated `RegisterForm` to include a styled Radio Group for "Grup 1 / Grup 1".
-   **Backend Logic**: Updated `useAuth` hook to pass group and department data to Supabase Auth metadata.
-   **UserProfileDropdown**: Created a new component showing user details, group, and subscription status (with color-coded days remaining).
-   **Sidebar**: Integrated the dropdown at the top (below Logo) and removed bottom logout button.
-   **Dashboard**: Removed the duplicate profile header box for a cleaner look.
-   **Logout API**: Created `/api/auth/logout`, though client-side logout handles redirection smoothly.

## 3. Design Details
-   **Dropdown**: "Yönetim Bilişim Sistemleri" is static as requested.
-   **Remaining Days**: Red (<7), Yellow (8-14), Green (15+).
-   **Avatar**: Shows initials on purple background.
-   **Dark Mode**: Fully compatible.

Please reload the application and verify the Registration and Dashboard flows.
