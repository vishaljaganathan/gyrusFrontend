# 11th Free User - NEET Question Selection Logic

## 🔒 **Subject Access**
- ✅ **NEET Only** - Full access
- ❌ **Individual Subjects Locked** - Physics, Chemistry, Botany, Zoology (redirect to payment)

---

## 🔄 **Cycle Pattern**

Each cycle consists of 3 phases with 3 sets each (total 9 sets per cycle):

### **Phase 1: Base Set (Ascending Order)**
```
Set 1: 20 questions
Set 2: 40 questions  
Set 3: 100 questions
```

### **Phase 2: Shuffled Base Set**
```
Randomly shuffle [20, 40, 100]
Example: [40, 100, 20] or [100, 20, 40]
```

### **Phase 3: Re-shuffled Set**
```
Shuffle again the already shuffled set
Example: [20, 100, 40] or [40, 20, 100]
```

After completing all 3 phases → **Start new cycle**

---

## 📊 **Question Distribution**

### **For 20 Questions:**
| Subject | Total | From 11th | From 12th |
|---------|-------|-----------|-----------|
| Physics | 5 | 3 | 2 |
| Chemistry | 5 | 3 | 2 |
| Botany | 5 | 3 | 2 |
| Zoology | 5 | 3 | 2 |
| **TOTAL** | **20** | **12** | **8** |

### **For 40 Questions:**
| Subject | Total | From 11th | From 12th |
|---------|-------|-----------|-----------|
| Physics | 10 | 7 | 3 |
| Chemistry | 10 | 7 | 3 |
| Botany | 10 | 7 | 3 |
| Zoology | 10 | 7 | 3 |
| **TOTAL** | **40** | **28** | **12** |

### **For 100 Questions:**
| Subject | Total | From 11th | From 12th |
|---------|-------|-----------|-----------|
| Physics | 25 | 18 | 7 |
| Chemistry | 25 | 18 | 7 |
| Botany | 25 | 18 | 7 |
| Zoology | 25 | 18 | 7 |
| **TOTAL** | **100** | **72** | **28** |

### **For 180 Questions (Paid Only):**
| Subject | Total | From 11th | From 12th |
|---------|-------|-----------|-----------|
| Physics | 45 | 30 | 15 |
| Chemistry | 45 | 30 | 15 |
| Botany | 45 | 30 | 15 |
| Zoology | 45 | 30 | 15 |
| **TOTAL** | **180** | **120** | **60** |

---

## 🎯 **Question Selection Pattern**

### **Every 25th Question Rule**
From each collection (e.g., `physics_questions-11`), select **every 25th question**:

```
DB Questions: [Q1, Q2, Q3, ..., Q25, Q26, ..., Q50, Q51, ..., Q75, ...]
Selected:     [Q25, Q50, Q75, Q100, Q125, ...]
```

### **Example for Physics (20Q set):**
1. From `physics_questions-11`: Select 3 questions (every 25th)
   - Q25, Q50, Q75
2. From `physics_questions-12`: Select 2 questions (every 25th)
   - Q25, Q50

---

## 🔁 **Cycle Tracking & No Repeats**

### **Rule:** 
A question shown in one cycle **MUST NOT** appear in the next cycle until **ALL questions** from the database have been displayed.

### **Implementation:**
```typescript
// Track used question IDs
const usedIds = ['id1', 'id2', 'id3', ...];

// When fetching new questions
fetchQuestions({
  usedIds: usedIds, // Exclude these IDs
  // ... other params
});

// Reset usedIds only when ALL questions exhausted
if (allQuestionsShown) {
  usedIds = [];
}
```

### **Example Flow:**

**Cycle 1:**
- Phase 1: Base Set [20, 40, 100] → Questions: Q1-Q120
- Phase 2: Shuffled [40, 100, 20] → Questions: Q121-Q240
- Phase 3: Re-shuffled [100, 20, 40] → Questions: Q241-Q360

**Cycle 2:**
- Phase 1: Base Set [20, 40, 100] → Questions: Q361-Q480
- (Continue until all questions used)

**Cycle 3:**
- Reset usedIds
- Start fresh from Q1 again

---

## 💾 **Database Collections**

Questions are stored in separate collections:

```
physics_questions-11    (11th standard physics)
physics_questions-12    (12th standard physics)
chemistry_questions-11  (11th standard chemistry)
chemistry_questions-12  (12th standard chemistry)
botany_questions-11     (11th standard botany)
botany_questions-12     (12th standard botany)
zoology_questions-11    (11th standard zoology)
zoology_questions-12    (12th standard zoology)
```

---

## 🔧 **Backend API Requirements**

### **New Endpoint Needed:**
```
POST /authentication/questions/pattern
```

**Request Body:**
```json
{
  "collection": "physics_questions-11",
  "count": 3,
  "usedIds": ["id1", "id2", "id3"],
  "skipPattern": 25,
  "offset": 0,
  "difficulty": ["1", "2"]
}
```

**Response:**
```json
[
  { "_id": "...", "question": "...", "level": "1", ... },
  { "_id": "...", "question": "...", "level": "2", ... },
  { "_id": "...", "question": "...", "level": "1", ... }
]
```

**Logic:**
1. Exclude questions with IDs in `usedIds`
2. Select every `skipPattern`th question (e.g., every 25th)
3. Return `count` number of questions
4. Filter by `difficulty` levels

---

## 📱 **Frontend Implementation**

### **1. Check Subject Lock:**
```typescript
import { isSubjectLocked } from './services/testStrategies/class11Free';

if (isSubjectLocked('physics')) {
  // Redirect to payment page
  navigation.navigate('Payment');
}
```

### **2. Fetch Questions:**
```typescript
import { fetchQuestions } from './services/testStrategies/class11Free';

const questions = await fetchQuestions({
  subject: 'neet',
  std: 'XI',
  type: 20,
  offset: 0,
  usedIds: usedQuestionIds,
  cycleIndex: 0,
  setIndexInCycle: 0
});
```

### **3. Track Progression:**
```typescript
import { getProgressionLogic } from './services/testStrategies/class11Free';

const progression = getProgressionLogic(
  correctAnswers,
  totalQuestions,
  currentCycleIndex,
  currentSetIndexInCycle
);

console.log('Next set size:', progression.nextSetSize);
console.log('Is new cycle:', progression.isNewCycle);
```

---

## 📈 **Example Complete Flow**

### **User Journey:**

**Cycle 0, Set 0 (Base Set):**
- Size: 20 questions
- Fetch: 5 from each subject (3 from 11th, 2 from 12th)
- Display to user
- User completes → 15/20 correct (75%)

**Cycle 0, Set 1 (Base Set):**
- Size: 40 questions
- Fetch: 10 from each subject (7 from 11th, 3 from 12th)
- Exclude previously used IDs
- Display to user

**Cycle 0, Set 2 (Base Set):**
- Size: 100 questions
- Fetch: 25 from each subject (18 from 11th, 7 from 12th)
- Exclude previously used IDs
- Display to user

**Cycle 1, Set 0 (Shuffled Set):**
- Shuffle [20, 40, 100] → e.g., [40, 100, 20]
- Size: 40 questions (first in shuffled order)
- Continue...

---

## ⚠️ **Important Notes**

1. **Free users can only access NEET** - Individual subjects locked
2. **Maximum set size for free: 100** (not 180)
3. **Every 25th question** selection is critical
4. **No repeats** until all questions shown
5. **Cycle tracking** must persist across sessions
6. **Subject locking** must redirect to payment page

---

## 🎯 **Success Criteria**

✅ Only NEET accessible for free users
✅ Individual subjects show payment prompt
✅ Questions selected every 25th from DB
✅ Correct 11th/12th distribution
✅ Cycle pattern followed correctly
✅ No question repeats within cycle
✅ All questions shown before reset
