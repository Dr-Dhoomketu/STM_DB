# Quick Usage Guide

## Your Problem
You have multiple websites on Coolify, each with their own PostgreSQL database. Currently, you have to SSH into each server to view/edit databases. This is time-consuming and error-prone.

## The Solution
This Database Control Panel gives you **one secure web interface** to manage all your website databases.

## How It Works

### 1. Register Your Databases

For each website on Coolify:

1. **Find the database service name** in Coolify (e.g., `my-blog-db`)
2. **Get the connection details** from Coolify's database service
3. **Register in the dashboard**:
   - Go to "Databases" → "Register Database"
   - Enter the details
   - Use the **service name** as the host (Coolify handles networking)

### 2. View All Your Databases

- Go to "Databases" to see all registered databases
- Click "View Tables" to browse any database
- Click on a table to see its data
- Use search to find specific records

### 3. Make Safe Edits

**Before editing:**
- ✅ Check if it's a production database (red badge)
- ✅ Review recent audit logs
- ✅ Enable edit mode (yellow warning appears)

**Making an edit:**
1. Click "Edit" on a row
2. Change the values you need
3. Click "Preview Changes"
4. Review the diff (before → after)
5. Type **"YES"** to confirm (or **"YES UPDATE PROD"** for production)
6. Done! Change is saved and logged

**After editing:**
- ✅ Check audit logs to confirm the change
- ✅ Disable edit mode when done
- ✅ Edit mode auto-expires after 30 minutes

## Example Workflow

### Scenario: Update a user's email in your blog database

**Old way (SSH):**
```bash
ssh into server
psql -U postgres -d my_blog_db
UPDATE users SET email='new@email.com' WHERE id=123;
\q
exit
```

**New way (Dashboard):**
1. Open dashboard → Databases
2. Click "My Blog Production" → "View Tables"
3. Click "users" table
4. Search for user ID 123
5. Click "Edit"
6. Change email
7. Preview → Type "YES UPDATE PROD" → Confirm
8. Done! ✅

**Benefits:**
- ✅ No SSH needed
- ✅ Visual interface
- ✅ Full audit trail
- ✅ Safety confirmations
- ✅ Can't accidentally break things

## Safety Features

### Read-Only Mode
- Databases start as read-only
- Prevents accidental changes
- Enable editing only when needed

### Edit Mode Timeout
- Auto-disables after 30 minutes
- Prevents leaving edit mode on
- Must re-enable to continue editing

### Confirmation System
- Must type "YES" exactly
- Production requires "YES UPDATE PROD"
- Preview shows before/after diff
- Can't skip confirmation

### Audit Logs
- Every change is logged
- Shows who, what, when, where
- Before/after data captured
- Immutable (can't be deleted)

## Tips

1. **Create Projects**: Group databases by website
   - "My Blog" → production + staging databases
   - "My Shop" → production database

2. **Use Search**: Find records quickly across all columns

3. **Check Audit Logs**: Review what changed before/after

4. **Start Read-Only**: Register databases as read-only first, enable editing when needed

5. **Test on Staging**: Make changes on staging databases first

## Common Tasks

### View all users in a database
1. Databases → Select database → View Tables
2. Click "users" table
3. Browse or search

### Update a record
1. Find the record (search helps)
2. Enable edit mode
3. Click "Edit"
4. Make changes
5. Preview → Confirm

### Check what changed recently
1. Go to "Audit Logs"
2. Filter by database/action
3. Click "View Changes" to see before/after

### Add a new database
1. Go to "Databases" → "Register Database"
2. Enter connection details from Coolify
3. Start with read-only enabled
4. Test connection by viewing tables

## Security

- ✅ All database credentials encrypted
- ✅ Credentials never sent to browser
- ✅ All operations server-side only
- ✅ HTTPS required in production
- ✅ Session-based authentication
- ✅ Full audit trail

## Need Help?

- Check `COOLIFY_SETUP.md` for deployment instructions
- Check `SETUP.md` for local development
- Review audit logs if something looks wrong
- All changes are logged, so you can always see what happened

