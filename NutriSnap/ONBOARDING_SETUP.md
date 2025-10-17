# NutriSnap Onboarding Setup Guide

## 📋 Database Setup

### Step 1: Run the SQL Script

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your NutriSnap project
3. Navigate to **SQL Editor** (left sidebar)
4. Click **New Query**
5. Copy and paste the contents of `database/users-table.sql`
6. Click **Run** or press `Ctrl+Enter`

This will create:
- ✅ The `users` table with all required columns
- ✅ Row Level Security (RLS) policies
- ✅ Database indexes for performance

### Step 2: Verify the Table

1. Go to **Table Editor** in Supabase
2. You should see a new table called `users`
3. Check that all columns are present:
   - id (uuid, primary key)
   - email
   - age, height, weight, sex
   - activity_level, goal, target_weight
   - daily_calorie_target, daily_protein_target, daily_carbs_target, daily_fat_target
   - current_streak, total_logs
   - onboarding_completed (boolean)
   - created_at (timestamp)

---

## 🚀 How the Onboarding Flow Works

### User Journey:

1. **Login** → User signs in with Google
2. **Onboarding Check** → App checks if `onboarding_completed === true`
3. **If false** → Navigate to onboarding flow
4. **If true** → Navigate to main app (tabs)

### Onboarding Steps:

#### Step 1: Welcome Screen
- Welcome message and app introduction
- "Get Started" button

#### Step 2: Basic Information
- Age (number input)
- Height (with metric/imperial toggle)
- Weight (with metric/imperial toggle)
- Biological Sex (radio buttons)
- **Validation**: Age (13-120), Height (100-250cm), Weight (30-300kg)

#### Step 3: Activity Level
- 5 options with descriptions:
  - Sedentary (1.2x multiplier)
  - Light (1.375x)
  - Moderate (1.55x)
  - Active (1.725x)
  - Very Active (1.9x)

#### Step 4: Goals
- Lose Weight (-500 cal/day)
- Maintain Weight (no change)
- Gain Weight (+500 cal/day)
- Target weight input (if not maintaining)

#### Step 5: Summary & Calculate
- Shows all entered information
- **TDEE Calculation** using Mifflin-St Jeor equation:
  - Men: `(10 × weight_kg) + (6.25 × height_cm) - (5 × age) + 5`
  - Women: `(10 × weight_kg) + (6.25 × height_cm) - (5 × age) - 161`
  - Multiply by activity level multiplier
- **Macro Calculation**:
  - Protein: 30% of calories (÷ 4 cal/g)
  - Carbs: 40% of calories (÷ 4 cal/g)
  - Fat: 30% of calories (÷ 9 cal/g)
- Saves all data to Supabase
- Sets `onboarding_completed = true`
- Navigates to main app

---

## 🔧 Technical Implementation

### Files Created:

1. **`database/users-table.sql`**
   - SQL script to create users table and RLS policies

2. **`lib/tdee-calculator.ts`**
   - TDEE calculation functions
   - Unit conversion utilities (kg/lbs, cm/ft)
   - Input validation
   - Activity multipliers
   - Macro calculations

3. **`app/onboarding.tsx`**
   - 5-step onboarding form
   - Form validation
   - Loading states
   - Supabase integration
   - Navigation logic

4. **Updated Files:**
   - `hooks/use-auth-context.tsx` - Added userData and hasCompletedOnboarding
   - `provider/auth-provider.tsx` - Fetches user data and onboarding status
   - `app/_layout.tsx` - Routes based on authentication and onboarding status

---

## 🎨 Features

- ✅ **Multi-step form** with progress indicator
- ✅ **Unit toggle** (metric/imperial)
- ✅ **Input validation** with helpful error messages
- ✅ **Real-time TDEE calculation** using Mifflin-St Jeor equation
- ✅ **Macro distribution** (30/40/30 protein/carbs/fat)
- ✅ **Beautiful UI** with gradient background
- ✅ **Loading states** during save
- ✅ **Error handling** with user-friendly alerts
- ✅ **Automatic routing** after completion
- ✅ **Can't skip** onboarding flow

---

## 🧪 Testing the Flow

1. **Clear your user data** (if you've already completed onboarding):
   ```sql
   DELETE FROM users WHERE id = 'your-user-id';
   ```

2. **Sign out and sign back in**

3. You should be redirected to the onboarding flow

4. Complete all 5 steps

5. You'll be redirected to the main app

6. Your data will be saved in the `users` table

---

## 📱 Navigation Flow

```
Login Screen
    ↓
[Is user logged in?]
    ↓ No → Stay on Login
    ↓ Yes
[Has completed onboarding?]
    ↓ No → Onboarding Flow
    ↓ Yes → Main App (Tabs)
```

---

## 🔐 Security

- **Row Level Security (RLS)** enabled on users table
- Users can only:
  - View their own data
  - Insert their own data
  - Update their own data
- No access to other users' data

---

## 📊 Data Storage

All measurements are stored in **metric units**:
- Height: cm
- Weight: kg
- Target Weight: kg

The app handles conversion from imperial units automatically.

---

## 🎯 Next Steps

After onboarding is complete, you can:
1. Access user data via `useAuthContext().userData`
2. Display daily targets in the dashboard
3. Use the data for nutrition tracking
4. Update goals/targets in settings

Example:
```tsx
const { userData } = useAuthContext();
console.log(userData.daily_calorie_target); // e.g., 2000
console.log(userData.daily_protein_target); // e.g., 150
```

---

## 🐛 Troubleshooting

**Q: Onboarding doesn't show after login**
- Check that the `users` table exists in Supabase
- Verify RLS policies are enabled
- Check console for errors

**Q: "Table 'users' does not exist" error**
- Run the SQL script in `database/users-table.sql`

**Q: Can't save onboarding data**
- Check Supabase connection
- Verify RLS policies allow INSERT
- Check that user is authenticated

**Q: Stuck in onboarding loop**
- Verify `onboarding_completed` was set to `true`
- Check the users table in Supabase
- Clear app cache and restart

---

## ✅ Setup Complete!

Your NutriSnap app now has a complete onboarding flow with TDEE calculation! 🎉
