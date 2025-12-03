# Enabling Budget Reset Feature

The **Monthly Budget Reset** feature has been implemented but is currently **disabled** until you run the database migration.

## Steps to Enable:

### 1. Run Database Migration
Execute the SQL file in your Supabase dashboard:
```sql
-- File: add_budget_reset.sql
```

This will add these columns to your `profiles` table:
- `reset_day` - Day of month for reset (1-31)
- `reset_enabled` - Toggle for automatic reset
- `last_reset_date` - Tracks when last reset occurred
- `current_period_start` - Start date of current period

### 2. Uncomment Code in Dashboard.jsx

After running the migration, you need to:

1. **Add budgetService import** (line 4):
```javascript
import { expenseService, recurringService, currencyService, budgetService } from '../services';
```

2. **Uncomment the checkBudgetReset call** (line 39):
```javascript
checkBudgetReset(); // Uncomment this line
```

### 3. Verify Feature Works
1. Go to Profile page
2. Enable "Monthly Budget Reset"
3. Select your salary day
4. Save changes
5. The budget will automatically reset on that day each month

## Why It's Disabled
The feature is temporarily disabled to prevent the app from crashing when the database columns don't exist. Once you run the migration, you can safely enable it by following the steps above.
