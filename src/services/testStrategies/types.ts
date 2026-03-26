/**
 * TypeScript Type Definitions for Test Strategy System
 */

// User Profile Types
export type UserStandard = 'XI' | 'XII' | '11' | '12' | '11th' | '12th' | 'repeater' | 'crash';

export interface UserProfile {
    std: UserStandard | string;
    planValid: boolean;
    plan?: string;
}

// Test Configuration
export interface TestConfig {
    maxQuestionsPerSet: number;
    allowedDifficulty: string[];
    hasTimeLimit: boolean;
    canSkipQuestions: boolean;
    showExplanations: boolean;
    allowRetry: boolean;
    hasAnalytics?: boolean;
    focusOnWeakAreas?: boolean;
    hasPersonalizedPlan?: boolean;
    focusOnHighYield?: boolean;
    hasTimeManagement?: boolean;
    includesPreviousYear?: boolean;
}

// Question Fetch Parameters
export interface FetchQuestionsParams {
    subject: string;
    std: string;
    type: number;
    offset: number;
    usedIds: string[];
    cycle?: number;
    set?: number;
}

// Question Object
export interface Question {
    _id: string;
    mcqId?: string;
    question: any;
    '1': any;
    '2': any;
    '3': any;
    '4': any;
    answer: string;
    explanation?: any;
    level?: string;
    standard?: string;
    subjectId?: string;
    topicsId?: string;
    isImportant?: boolean;
    yearOfQues?: string[];
    approved?: boolean;
    visibility?: boolean;
    createdAt?: string;
    updatedAt?: string;
    __set?: number;
}

// Progression Result
export interface ProgressionResult {
    nextSetSize: number;
    message: string;
    canProgress: boolean;
    nextCycleIndex?: number;
    nextSetIndexInCycle?: number;
    isNewCycle?: boolean;
    unlockBonus?: boolean;
    suggestReview?: boolean;
    suggestWeakAreaAnalysis?: boolean;
    suggestPriority?: boolean;
    suggestTimeManagement?: boolean;
    showStrengthReport?: boolean;
    showWeakAreaReport?: boolean;
    showTimeAnalysis?: boolean;
}

// Test Strategy Interface
export interface TestStrategy {
    getTestConfig: () => TestConfig;
    fetchQuestions: (params: FetchQuestionsParams) => Promise<Question[]>;
    filterQuestions: (questions: Question[]) => Question[];
    getProgressionLogic: (correctAnswers: number, totalQuestions: number, currentCycle?: number, currentSetIndex?: number, subject?: string, std?: string) => ProgressionResult;
    getSetLabel?: (setIndex: number) => string;
}


// Feature Types
export type FeatureType = 'explanations' | 'analytics' | 'unlimited' | 'timeManagement';

// Strategy Type
export type StrategyType =
    | 'class11Free'
    | 'class11Paid'
    | 'class12Free'
    | 'class12Paid'
    | 'repeaterFree'
    | 'repeaterPaid'
    | 'crashFree'
    | 'crashPaid';

// API Response Types
export interface QuestionAPIResponse {
    data: Question[];
    message?: string;
    success?: boolean;
}

// Test State
export interface TestState {
    questions: Question[];
    currentQuestionIndex: number;
    correctAnswers: number;
    wrongAnswers: number;
    usedIds: string[];
    offset: number;
    isLoading: boolean;
    error: string | null;
}

// Test Result
export interface TestResult {
    totalQuestions: number;
    correctAnswers: number;
    wrongAnswers: number;
    skippedQuestions: number;
    timeTaken?: number;
    percentage: number;
    passed: boolean;
}

// User Data (from context)
export interface UserData {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
    gender: string;
    phoneNo: string;
    std: string;
    targetYear: string;
    plan: string;
    planValid: boolean;
    examDate: string;
    // Subject-specific data
    neet?: any;
    physics?: any;
    chemistry?: any;
    botany?: any;
    zoology?: any;
}


