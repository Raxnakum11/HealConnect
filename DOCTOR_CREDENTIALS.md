# Single Doctor Account Setup

## Doctor Credentials

The system is now configured for a **single doctor** account. Use these credentials to login:

### Email & Password Login
- **Name:** Dr. Himanshu Sonagara
- **Email:** drhimanshusonagara@gmail.com
- **Mobile:** 9723996594
- **Password:** pass@1234

## Access Points

### 1. Doctor Registration (First Time Only)
- Navigate to the **Doctor** tab in the Login/Signup dialog
- Click **"Don't have an account? Register here"**
- Enter the credentials above
- Click **"Create Doctor Account"**
- Only one doctor account is allowed in the system

### 2. Doctor Login (After Registration)
- Navigate to the **Doctor** tab in the Login/Signup dialog
- Enter email: `drhimanshusonagara@gmail.com`
- Enter password: `pass@1234`
- Click **"Sign In as Doctor"**

## Changes Made

✅ **Removed Features:**
- Specialization/Doctor Type selector (homeopathy vs allopathy)
- Multiple doctor support - only ONE doctor can register
- Specialization field from User model

✅ **Simplified:**
- Doctor registration form - no specialization option
- Authentication controllers - removed specialization handling
- Frontend components - no specialization UI elements

✅ **Backend:**
- User model no longer has specialization field
- Auth controller enforces single doctor limit
- All responses no longer include specialization data

## Testing the Setup

1. **Start Backend Server:**
   ```bash
   cd backend
   npm start
   ```

2. **Start Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Doctor Registration:**
   - Open the app and go to Doctor tab
   - Register with the above credentials
   - You should see "A doctor account already exists" message on second attempt

4. **Doctor Login:**
   - Use the same credentials to login
   - Access doctor dashboard

## Database Note

If you need to reset and register a new doctor:
1. Delete the doctor user from MongoDB (if already registered)
2. Re-register using the credentials above

```javascript
// MongoDB command to remove existing doctor
db.users.deleteOne({ role: 'doctor' })
```

---

**System:** HealConnect by Shree Hari Clinic  
**Configuration:** Single Doctor Mode  
**Last Updated:** February 2026
