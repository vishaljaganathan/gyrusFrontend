# 11th Free User - Visual Flow Diagram

## 🔄 Complete Cycle Visualization

```
┌─────────────────────────────────────────────────────────────────┐
│                         CYCLE 0                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  PHASE 1: BASE SET (Ascending Order)                           │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐                 │
│  │   20Q    │ →  │   40Q    │ →  │  100Q    │                 │
│  └──────────┘    └──────────┘    └──────────┘                 │
│                                                                  │
│  PHASE 2: SHUFFLED SET (Random Order)                          │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐                 │
│  │  100Q    │ →  │   20Q    │ →  │   40Q    │  (Example)      │
│  └──────────┘    └──────────┘    └──────────┘                 │
│                                                                  │
│  PHASE 3: RE-SHUFFLED SET (Shuffled Again)                     │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐                 │
│  │   40Q    │ →  │  100Q    │ →  │   20Q    │  (Example)      │
│  └──────────┘    └──────────┘    └──────────┘                 │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                         CYCLE 1                                  │
│                    (Repeat same pattern)                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 Question Distribution for 20Q Set

```
┌────────────────────────────────────────────────────────────┐
│                    20 QUESTIONS TOTAL                       │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  PHYSICS (5Q)          CHEMISTRY (5Q)                      │
│  ┌─────────┐          ┌─────────┐                         │
│  │ 11th: 3 │          │ 11th: 3 │                         │
│  │ 12th: 2 │          │ 12th: 2 │                         │
│  └─────────┘          └─────────┘                         │
│                                                             │
│  BOTANY (5Q)           ZOOLOGY (5Q)                        │
│  ┌─────────┐          ┌─────────┐                         │
│  │ 11th: 3 │          │ 11th: 3 │                         │
│  │ 12th: 2 │          │ 12th: 2 │                         │
│  └─────────┘          └─────────┘                         │
│                                                             │
│  TOTAL: 12 from 11th + 8 from 12th = 20                   │
└────────────────────────────────────────────────────────────┘
```

---

## 🎯 Every 25th Question Selection

```
DATABASE: physics_questions-11
┌───┬───┬───┬───┬───┬───┬───┬───┬───┬───┬───┬───┬───┐
│ 1 │ 2 │ 3 │...│24 │25 │26 │...│49 │50 │51 │...│75 │
└───┴───┴───┴───┴───┴───┴───┴───┴───┴───┴───┴───┴───┘
                    ↑           ↑           ↑
                    │           │           │
                 SELECT      SELECT      SELECT
                    │           │           │
                    └───────────┴───────────┘
                              ↓
                    SELECTED: [Q25, Q50, Q75]
```

---

## 🔁 No Repeat Logic

```
┌─────────────────────────────────────────────────────────────┐
│                    QUESTION POOL                             │
│  Total Questions in DB: 1000 (example)                      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  CYCLE 0: Use Q1-Q160                                       │
│  ├─ Phase 1: Q1-Q60   (20+40+100 = 160)                   │
│  ├─ Phase 2: Q61-Q120                                       │
│  └─ Phase 3: Q121-Q160                                      │
│                                                              │
│  Used IDs: [Q1, Q2, ..., Q160]  ← Track these             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  CYCLE 1: Use Q161-Q320                                     │
│  ├─ Phase 1: Q161-Q220                                      │
│  ├─ Phase 2: Q221-Q280                                      │
│  └─ Phase 3: Q281-Q320                                      │
│                                                              │
│  Used IDs: [Q1, Q2, ..., Q320]  ← Accumulate               │
└─────────────────────────────────────────────────────────────┘
                            ↓
                         Continue...
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  When ALL 1000 questions used:                              │
│  ├─ Reset usedIds = []                                      │
│  └─ Start fresh from Q1                                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔒 Subject Lock Flow

```
User clicks on "Physics"
        ↓
┌─────────────────┐
│ Check Plan Type │
└─────────────────┘
        ↓
   ┌────────┴────────┐
   │                 │
   ↓                 ↓
[FREE]           [PAID]
   │                 │
   ↓                 ↓
┌──────────┐    ┌──────────┐
│  LOCKED  │    │ UNLOCKED │
│  Show    │    │  Allow   │
│ Payment  │    │  Access  │
│  Page    │    │          │
└──────────┘    └──────────┘
```

---

## 📱 User Journey Example

```
START: User opens app (11th Free Plan)
  ↓
┌─────────────────────────────────────────┐
│ Home Screen                              │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│ │  NEET   │ │ Physics │ │Chemistry│   │
│ │   ✅    │ │   🔒    │ │   🔒    │   │
│ └─────────┘ └─────────┘ └─────────┘   │
└─────────────────────────────────────────┘
  ↓
User clicks "NEET" ✅
  ↓
┌─────────────────────────────────────────┐
│ Fetch Questions                          │
│ Cycle: 0, Set: 0                        │
│ Size: 20 questions                       │
│                                          │
│ Physics:   3(11th) + 2(12th) = 5       │
│ Chemistry: 3(11th) + 2(12th) = 5       │
│ Botany:    3(11th) + 2(12th) = 5       │
│ Zoology:   3(11th) + 2(12th) = 5       │
│                                          │
│ Total: 20 questions                      │
└─────────────────────────────────────────┘
  ↓
User completes test (15/20 correct)
  ↓
┌─────────────────────────────────────────┐
│ Progression Logic                        │
│ ├─ Percentage: 75%                      │
│ ├─ Next Set: 40 questions               │
│ ├─ Same Cycle (0)                       │
│ └─ Next Set Index: 1                    │
└─────────────────────────────────────────┘
  ↓
Continue to next set...
```

---

## 🎨 Data Structure

```typescript
// User Progress Tracking
{
  userId: "user123",
  std: "XI",
  planValid: false,
  
  neetProgress: {
    currentCycle: 0,
    currentSetIndex: 0,
    usedQuestionIds: [
      "q1", "q2", "q3", ..., "q160"
    ],
    totalQuestionsInDB: 1000,
    questionsShownCount: 160
  }
}
```

---

## ⚡ Quick Reference

| Metric | Value |
|--------|-------|
| **Allowed Subjects** | NEET only |
| **Locked Subjects** | Physics, Chemistry, Botany, Zoology |
| **Set Sizes** | 20, 40, 100 |
| **Cycle Phases** | 3 (Base, Shuffled, Re-shuffled) |
| **Sets per Phase** | 3 |
| **Total Sets per Cycle** | 9 |
| **Selection Pattern** | Every 25th question |
| **Repeat Rule** | No repeats until ALL shown |
| **Difficulty Levels** | 1, 2 only |
| **Explanations** | ❌ Not available |

---

## 🚀 Implementation Checklist

- [ ] Create backend endpoint `/authentication/questions/pattern`
- [ ] Implement "every 25th" selection logic in backend
- [ ] Add subject lock check in frontend
- [ ] Implement payment page redirect
- [ ] Track usedIds in user profile
- [ ] Implement cycle tracking
- [ ] Test all 3 phases of cycle
- [ ] Test question distribution (11th/12th)
- [ ] Test no-repeat logic
- [ ] Test reset when all questions shown
