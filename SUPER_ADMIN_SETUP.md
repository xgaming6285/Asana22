# Super Admin System Setup Guide

This project now includes a comprehensive Super Admin system that allows designated users to have full control over the entire application.

## Features

The Super Admin has access to:

### 🔐 **Complete Access Control**
- View, edit, and delete **ALL projects** (regardless of membership)
- View, edit, and delete **ALL tasks** (across all projects)
- View, edit, and delete **ALL goals** (personal, team, and company)
- Access **ALL user data** and profiles

### 👥 **User Management**
- View all users in the system with detailed information
- Create new users with any role
- Edit user profiles, passwords, and system roles
- Delete users (except themselves)
- Promote/demote users to/from Super Admin

### 📊 **Project Management**
- View all projects with complete details
- Create projects for any user
- Edit any project information
- Delete any project
- Manage project memberships

### 📈 **System Overview**
- Admin dashboard with system-wide statistics
- Analytics on tasks, goals, and projects
- Recent activity monitoring
- User growth metrics

## Setup Instructions

### 1. Database Migration
The system role has already been added to your database schema. If you need to apply it manually:

```bash
npx prisma db push
```

### 2. Promote Your First Super Admin

Use the provided script to promote an existing user to Super Admin:

```bash
node scripts/promote-super-admin.js your-email@example.com
```

**Example:**
```bash
node scripts/promote-super-admin.js admin@company.com
```

### 3. Access the Admin Panel

Once promoted, Super Admins will see:
- **Desktop**: "Admin Panel" option in the profile dropdown (top right)
- **Mobile**: "Admin Panel" option in the mobile menu
- **Direct URL**: `/admin` (only accessible to Super Admins)

## API Endpoints

### Admin Dashboard
- `GET /api/admin/dashboard` - System overview and statistics

### User Management
- `GET /api/admin/users` - List all users (with pagination and search)
- `GET /api/admin/users/[id]` - Get specific user details
- `POST /api/admin/users` - Create new user
- `PUT /api/admin/users/[id]` - Update user (including role changes)
- `DELETE /api/admin/users/[id]` - Delete user

### Project Management
- `GET /api/admin/projects` - List all projects (with pagination and search)
- `GET /api/admin/projects/[id]` - Get specific project details
- `POST /api/admin/projects` - Create new project
- `PUT /api/admin/projects/[id]` - Update project
- `DELETE /api/admin/projects/[id]` - Delete project

## Super Admin Capabilities

### Bypass All Permissions
Super Admins automatically bypass all permission checks:
- Can access any project without being a member
- Can edit/delete any task regardless of assignment
- Can manage any goal regardless of ownership
- Can view all encrypted data

### User Role Management
Super Admins can:
- Change any user's system role between `USER` and `SUPER_ADMIN`
- Reset user passwords
- Update user profiles
- View complete user activity

### System Monitoring
- Real-time system statistics
- User activity tracking
- Project and task analytics
- Goal progress monitoring

## Security Notes

⚠️ **Important Security Considerations:**

1. **Limited Super Admin Count**: Only promote trusted administrators
2. **Audit Trail**: Consider implementing logging for admin actions
3. **Self-Protection**: Super Admins cannot delete their own accounts
4. **Data Encryption**: All user data remains encrypted at rest

## Usage Examples

### Promote a User to Super Admin
```bash
# Promote an existing user
node scripts/promote-super-admin.js user@example.com
```

### Create a New Super Admin via API
```javascript
// POST /api/admin/users
{
  "email": "newadmin@company.com",
  "firstName": "Admin",
  "lastName": "User",
  "password": "securepassword",
  "systemRole": "SUPER_ADMIN"
}
```

### Check Super Admin Status
```javascript
// In your frontend code
import adminService from '@/app/services/adminService';

const isAdmin = await adminService.checkSuperAdminStatus();
```

## Troubleshooting

### Cannot Access Admin Panel
1. Verify your user has `systemRole: 'SUPER_ADMIN'` in the database
2. Check that you're logged in with the correct account
3. Clear browser cache and cookies
4. Verify the migration was applied correctly

### Script Errors
1. Ensure your `.env` file has the correct database connection
2. Check that the user email exists in the system
3. Verify encryption keys are properly configured

### Permission Issues
1. Super Admin permissions are checked server-side
2. Frontend navigation updates may require a page refresh
3. Verify JWT tokens include the latest user information

## Development Notes

The Super Admin system is built with:
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT-based with role checking
- **Encryption**: All sensitive data remains encrypted
- **Frontend**: React with Next.js App Router
- **Styling**: Tailwind CSS with modern design

All existing functionality remains unchanged for regular users. The Super Admin features are additive and don't affect normal user workflows. 