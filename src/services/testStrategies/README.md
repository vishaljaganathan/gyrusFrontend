# Test Strategy System

This directory contains the test strategy system that handles different question fetching and display logic based on user profiles.

## 📁 File Structure

```
testStrategies/
├── index.ts              # Factory that selects the right strategy
├── examples.ts           # Usage examples
├── class11Free.ts        # 11th Standard Free Plan
├── class11Paid.ts        # 11th Standard Paid Plan
├── class12Free.ts        # 12th Standard Free Plan
├── class12Paid.ts        # 12th Standard Paid Plan
├── repeaterFree.ts       # Repeater Free Plan
├── repeaterPaid.ts       # Repeater Paid Plan
├── crashFree.ts          # Crash Course Free Plan
└── crashPaid.ts          # Crash Course Paid Plan
```

## 🎯 User Types

### 1. **11th Standard Free**
- Max 20 questions per set
- Difficulty levels: 1-2 only
- No explanations
- Basic progression

### 2. **11th Standard Paid**
- Up to 180 questions (full NEET)
- All difficulty levels (1-3)
- Full explanations
- Advanced analytics

### 3. **12th Standard Free**
- Max 20 questions per set
- Focus on 12th syllabus
- Difficulty levels: 1-2
- No explanations

### 4. **12th Standard Paid**
- Up to 180 questions
- Mix of 11th + 12th for revision
- All difficulty levels
- Full explanations + analytics

### 5. **Repeater Free**
- Max 20 questions per set
- Mix of 11th + 12th
- Focus on weak areas
- Basic features

### 6. **Repeater Paid**
- Up to 180 questions
- AI-driven weak area targeting
- Personalized study plan
- Advanced analytics

### 7. **Crash Course Free**
- Max 20 questions per set
- High-yield topics only
- Time-bound practice
- Limited features

### 8. **Crash Course Paid**
- Up to 180 questions
- All high-yield questions
- Time management features
- Full analytics

## 🚀 Usage

### Basic Usage

```typescript
import { getTestStrategy } from './services/testStrategies';

// In your component
const strategy = getTestStrategy({
  std: userData.std,        // 'XI', 'XII', 'repeater', 'crash'
  planValid: userData.planValid  // true/false
});

// Get configuration
const config = strategy.getTestConfig();

// Fetch questions
const questions = await strategy.fetchQuestions({
  subject: 'physics',
  std: userData.std,
  type: 20,
  offset: 0,
  usedIds: []
});

// Filter questions based on strategy
const filtered = strategy.filterQuestions(questions);

// Check progression
const progression = strategy.getProgressionLogic(15, 20);
```

### Feature Access Check

```typescript
import { canAccessFeature } from './services/testStrategies';

const userProfile = {
  std: userData.std,
  planValid: userData.planValid
};

const hasExplanations = canAccessFeature(userProfile, 'explanations');
const hasAnalytics = canAccessFeature(userProfile, 'analytics');
const hasUnlimited = canAccessFeature(userProfile, 'unlimited');
```

### Get Strategy Description

```typescript
import { getStrategyDescription } from './services/testStrategies';

const description = getStrategyDescription({
  std: userData.std,
  planValid: userData.planValid
});

console.log(description);
// Output: "11th Standard Premium - Full access with explanations"
```

## 🔧 Integration with Test.tsx

Replace the current `fetchQuestions` function in Test.tsx:

```typescript
// Old way
const fetchQuestions = (offsetValue = 0, usedIdsArr: string[] = []) => {
  axiosInstance.post('/authentication/questions/repeater', {
    subject,
    std,
    type,
    offset: offsetValue,
    usedIds: effectiveUsedIds,
  });
};

// New way
import { getTestStrategy } from '../services/testStrategies';

const strategy = getTestStrategy({
  std: userData.std,
  planValid: userData.planValid
});

const fetchQuestions = async (offsetValue = 0, usedIdsArr: string[] = []) => {
  const questions = await strategy.fetchQuestions({
    subject,
    std,
    type,
    offset: offsetValue,
    usedIds: effectiveUsedIds,
  });
  
  return strategy.filterQuestions(questions);
};
```

## 📊 Strategy Methods

Each strategy file exports:

### `getTestConfig()`
Returns configuration object with:
- `maxQuestionsPerSet`: Maximum questions allowed
- `allowedDifficulty`: Array of allowed difficulty levels
- `hasTimeLimit`: Boolean for time restrictions
- `canSkipQuestions`: Boolean for skip functionality
- `showExplanations`: Boolean for explanation access
- `allowRetry`: Boolean for retry functionality
- Additional features based on plan type

### `fetchQuestions(params)`
Fetches questions from backend with strategy-specific parameters:
- `subject`: Subject name
- `std`: Standard/class
- `type`: Question count
- `offset`: Pagination offset
- `usedIds`: Array of already used question IDs

### `filterQuestions(questions)`
Filters questions based on strategy rules:
- Free plans: Filter by difficulty
- Paid plans: No filtering or smart sorting
- Crash: Filter for high-yield only

### `getProgressionLogic(correctAnswers, totalQuestions)`
Returns progression information:
- `nextSetSize`: Size of next question set
- `message`: Feedback message for user
- `canProgress`: Boolean to allow progression
- Additional flags based on performance

## 🎨 Customization

To add a new user type:

1. Create a new file (e.g., `customType.ts`)
2. Implement the 4 required methods
3. Import and add to `index.ts` factory
4. Update the `getTestStrategy` logic

## 📝 Notes

- All strategies use the same interface for consistency
- Backend endpoints may need to be updated to match strategy requirements
- Free plans are limited to encourage upgrades
- Paid plans have full feature access
