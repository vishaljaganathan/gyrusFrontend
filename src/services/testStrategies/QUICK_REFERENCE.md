# Test Strategy System - Quick Reference

## ✅ Created Files (11 total)

### Core Strategy Files (8)
1. ✅ `class11Free.ts` - 11th Standard Free Plan
2. ✅ `class11Paid.ts` - 11th Standard Paid Plan  
3. ✅ `class12Free.ts` - 12th Standard Free Plan
4. ✅ `class12Paid.ts` - 12th Standard Paid Plan
5. ✅ `repeaterFree.ts` - Repeater Free Plan
6. ✅ `repeaterPaid.ts` - Repeater Paid Plan
7. ✅ `crashFree.ts` - Crash Course Free Plan
8. ✅ `crashPaid.ts` - Crash Course Paid Plan

### Support Files (3)
9. ✅ `index.ts` - Strategy Factory (selects right strategy)
10. ✅ `examples.ts` - Usage examples
11. ✅ `README.md` - Complete documentation

---

## 📊 Feature Comparison Table

| Feature | Free Plans | Paid Plans |
|---------|-----------|-----------|
| Max Questions/Set | 20 | 180 (Full NEET) |
| Difficulty Levels | 1-2 (Basic) | 1-3 (All) |
| Explanations | ❌ No | ✅ Yes |
| Analytics | ❌ No | ✅ Yes |
| Time Management | ❌ No | ✅ Yes (Crash) |
| Retry | ✅ Yes | ✅ Yes |
| Skip Questions | ✅ Yes | ✅ Yes |

---

## 🎯 Strategy Selection Logic

```
User Profile → Factory → Strategy
     ↓            ↓         ↓
  std + plan → index.ts → Specific File
```

### Examples:
- `std: "XI"` + `planValid: false` → **class11Free.ts**
- `std: "XII"` + `planValid: true` → **class12Paid.ts**
- `std: "repeater"` + `planValid: false` → **repeaterFree.ts**
- `std: "crash"` + `planValid: true` → **crashPaid.ts**

---

## 🔧 Quick Integration Guide

### Step 1: Import the factory
```typescript
import { getTestStrategy } from '../services/testStrategies';
```

### Step 2: Get strategy based on user
```typescript
const strategy = getTestStrategy({
  std: userData.std,
  planValid: userData.planValid
});
```

### Step 3: Use strategy methods
```typescript
// Get config
const config = strategy.getTestConfig();

// Fetch questions
const questions = await strategy.fetchQuestions({...});

// Filter questions
const filtered = strategy.filterQuestions(questions);

// Check progression
const progression = strategy.getProgressionLogic(correct, total);
```

---

## 🚀 Next Steps

1. **Update Backend Endpoints** (if needed)
   - `/authentication/questions/basic` (Free users)
   - `/authentication/questions/premium` (Paid users)
   - `/authentication/questions/repeater` (Repeater)
   - `/authentication/questions/repeater-premium` (Repeater Paid)
   - `/authentication/questions/crash` (Crash Free)
   - `/authentication/questions/crash-premium` (Crash Paid)

2. **Integrate with Test.tsx**
   - Replace current fetchQuestions logic
   - Use strategy-based filtering
   - Implement progression logic

3. **Update UI Components**
   - Show/hide features based on config
   - Display strategy description
   - Handle progression messages

4. **Test Each Strategy**
   - Test with different user profiles
   - Verify question filtering
   - Check progression logic

---

## 📝 Example: Complete Test.tsx Integration

```typescript
import { getTestStrategy } from '../services/testStrategies';

const Test = (props: any) => {
  const { userData } = useContext(ThemeContext);
  
  // Get strategy for current user
  const strategy = getTestStrategy({
    std: userData.std,
    planValid: userData.planValid
  });
  
  const config = strategy.getTestConfig();
  
  const fetchQuestions = async () => {
    const questions = await strategy.fetchQuestions({
      subject: props.route.params?.params?.subject,
      std: userData.std,
      type: config.maxQuestionsPerSet,
      offset: 0,
      usedIds: []
    });
    
    const filtered = strategy.filterQuestions(questions);
    setMCQs(filtered);
  };
  
  const handleTestComplete = () => {
    const progression = strategy.getProgressionLogic(
      correctQtsIds.length,
      MCQs.length
    );
    
    Alert.alert('Test Complete', progression.message);
    
    if (progression.canProgress) {
      // Load next set
      fetchQuestions();
    }
  };
  
  return (
    // Your component JSX
  );
};
```

---

## 🎨 Customization Tips

### Add New User Type
1. Create new file: `newType.ts`
2. Copy structure from existing strategy
3. Implement 4 methods: `getTestConfig`, `fetchQuestions`, `filterQuestions`, `getProgressionLogic`
4. Add to factory in `index.ts`

### Modify Existing Strategy
1. Open strategy file (e.g., `class11Free.ts`)
2. Update `getTestConfig()` for feature changes
3. Update `fetchQuestions()` for API changes
4. Update `filterQuestions()` for filtering logic
5. Update `getProgressionLogic()` for progression rules

---

## ✨ Benefits

✅ **Separation of Concerns** - Each user type has its own logic
✅ **Easy Maintenance** - Update one file without affecting others
✅ **Scalability** - Easy to add new user types
✅ **Type Safety** - TypeScript interfaces ensure consistency
✅ **Testability** - Each strategy can be tested independently
✅ **Flexibility** - Easy to customize per user type

---

**Location:** `d:\gyrus\N-app\src\services\testStrategies\`
**Created:** 2026-02-16
**Total Files:** 11
