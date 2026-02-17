# Admin Panel Access Guide

## Overview
This document explains how authentication and authorization work for accessing the admin panel in the Tech Cafe application.

## Authentication & Authorization Flow

### 1. **Authentication (Who are you?)**
- Users authenticate via Supabase Auth
- Two methods available:
  - **Email/Password**: Traditional login at `/auth/login`
  - **Google OAuth**: Social login via Google

### 2. **Authorization (What can you do?)**
- After authentication, the system checks the user's **role** in the `profiles` table
- Only users with `role = 'admin'` or `role = 'superadmin'` can access admin routes

## The Authorization Formula

The admin panel uses a **two-step authorization check**:

### Step 1: Authentication Check
```typescript
// Location: app/(admin)/layout.tsx (lines 10-14)
const supabase = await createClient();
const { data: { user } } = await supabase.auth.getUser();
if (!user) redirect("/auth/login?redirectTo=/admin");
```
**Result**: If not authenticated → Redirect to login page

### Step 2: Role-Based Authorization Check
```typescript
// Location: app/(admin)/layout.tsx (lines 16-24)
const { data: profile } = await supabase
  .from("profiles")
  .select("role, cafe_id")
  .eq("id", user.id)
  .single();

if (!profile || !["admin", "superadmin"].includes(profile.role)) {
  redirect("/");
}
```
**Result**: If role is not `admin` or `superadmin` → Redirect to home page

## User Roles

The system supports three roles (defined in `types/index.ts`):
- `customer` - Default role for regular users
- `admin` - Can access admin panel
- `superadmin` - Can access admin panel (may have additional privileges in future)

## How to Access Admin Panel

### Current Situation
**By default, all new users are assigned the `customer` role** when they:
- Sign up via `/auth/sign-up`
- Login via Google OAuth

This means **there is currently no UI to grant admin access**. You must manually update the database.

### Method 1: Direct Database Update (Recommended)

1. **Access your Supabase Dashboard**
   - Go to your Supabase project
   - Navigate to Table Editor → `profiles` table

2. **Find the user you want to make admin**
   - Look for the user's record in the `profiles` table
   - Note their `id` (this matches their auth.users.id)

3. **Update the role**
   - Edit the `role` field
   - Change from `customer` to either `admin` or `superadmin`
   - Save the changes

4. **Access the admin panel**
   - Log in with that user's credentials
   - Navigate to `/admin` or any admin route
   - You should now have access!

### Method 2: SQL Query (Alternative)

Run this SQL in Supabase SQL Editor:

```sql
-- Make a specific user an admin (replace USER_ID with actual user ID)
UPDATE profiles 
SET role = 'admin' 
WHERE id = 'USER_ID';

-- Or make a user superadmin
UPDATE profiles 
SET role = 'superadmin' 
WHERE id = 'USER_ID';
```

### Method 3: Find User ID First

If you don't know the user ID, you can find it:

```sql
-- Find user by email
SELECT id, full_name, email, role 
FROM profiles 
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'user@example.com'
);
```

## Protected Routes

The following routes are protected by the admin layout:
- `/admin` - Admin dashboard
- `/admin/menu` - Menu management
- `/admin/coupons` - Coupon management
- `/admin/reports` - Reports

All these routes are wrapped by `app/(admin)/layout.tsx`, which enforces the authorization check.

## Middleware Protection

Additionally, the middleware (`lib/supabase/middleware.ts`) protects `/admin` routes:
- Unauthenticated users are redirected to `/auth/login?redirectTo=/admin`
- After login, they're redirected back to `/admin` (if they have the right role)

## Security Notes

⚠️ **Important Security Considerations:**

1. **No Self-Service Admin Creation**: Users cannot grant themselves admin access
2. **Database-Level Security**: Ensure Row Level Security (RLS) policies are set up in Supabase
3. **Role Verification**: Always verify roles server-side (as done in the layout)
4. **Never Trust Client-Side**: The authorization check happens server-side in the layout component

## Future Improvements

Consider adding:
- An admin user management page (only accessible to superadmins)
- A way to assign admin roles through the UI
- Role-based permissions for different admin functions
- Audit logging for role changes

## Testing Admin Access

1. Create a test user account
2. Update their role in the database to `admin`
3. Log in with that account
4. Navigate to `/admin`
5. You should see the admin dashboard with sidebar

## Troubleshooting

**Issue**: "Redirected to home page after login"
- **Cause**: User's role is `customer`, not `admin` or `superadmin`
- **Solution**: Update the user's role in the `profiles` table

**Issue**: "Redirected to login page"
- **Cause**: User is not authenticated
- **Solution**: Log in first, then access admin routes

**Issue**: "Profile not found"
- **Cause**: User exists in `auth.users` but not in `profiles` table
- **Solution**: The profile should be created automatically, but you can manually insert one

---

**Last Updated**: Based on current codebase structure
**Admin Layout File**: `app/(admin)/layout.tsx`
**Auth Files**: `app/auth/login/page.tsx`, `app/auth/sign-up/page.tsx`
