/**
 * Test Strategy for 11th Standard Free Plan Users
 * 
 * NEET ONLY ACCESS - All other subjects locked
 * 
 * Question Selection Logic:
 * - Cycle: Base Set [20,40,100] → Shuffled [20,40,100] → Re-shuffled [20,40,100]
 * - Select every 25th question from DB
 * - Track used questions per cycle
 * - Don't repeat until ALL questions shown
 * 
 * Distribution per set size:
 * - 20Q: 5 per subject (3 from 11th, 2 from 12th)
 * - 40Q: 10 per subject (7 from 11th, 3 from 12th)
 * - 100Q: 25 per subject (18 from 11th, 7 from 12th)
 * - 180Q: 45 per subject (30 from 11th, 15 from 12th)
 */

import { axiosInstance } from '../../config/indeceptor';

export interface TestConfig {
    maxQuestionsPerSet: number;
    allowedDifficulty: string[];
    hasTimeLimit: boolean;
    canSkipQuestions: boolean;
    showExplanations: boolean;
    allowRetry: boolean;
    lockedSubjects: string[]; // Subjects that require payment
    allowedSubjects: string[]; // Only NEET allowed
}

export const getTestConfig = (): TestConfig => {
    return {
        maxQuestionsPerSet: 100, // Free users: 20, 40, 100 (not 180)
        allowedDifficulty: ['1', '2'], // Only level 1 and 2
        hasTimeLimit: false,
        canSkipQuestions: true,
        showExplanations: false, // No explanations for free users
        allowRetry: true,
        lockedSubjects: ['physics', 'chemistry', 'botany', 'zoology'], // Individual subjects locked
        allowedSubjects: ['neet'], // Only NEET allowed
    };
};

/**
 * Check if a subject is locked for free users
 */
export const isSubjectLocked = (subject: string): boolean => {
    const config = getTestConfig();
    return config.lockedSubjects.includes(subject.toLowerCase());
};

/**
 * Get question distribution based on set size
 */
const getQuestionDistribution = (setSize: number) => {
    switch (setSize) {
        case 20:
            return {
                perSubject: 5,
                from11th: 3,
                from12th: 2,
            };
        case 40:
            return {
                perSubject: 10,
                from11th: 7,
                from12th: 3,
            };
        case 100:
            return {
                perSubject: 25,
                from11th: 18,
                from12th: 7,
            };
        case 180:
            return {
                perSubject: 45,
                from11th: 30,
                from12th: 15,
            };
        default:
            // Default to 20
            return {
                perSubject: 5,
                from11th: 3,
                from12th: 2,
            };
    }
};

/**
 * Get the cycle pattern for free users
 * Base Set [20,40,100] → Shuffled → Re-shuffled
 */
export const getCyclePattern = (cycleIndex: number): number[] => {
    const baseSet = [20, 40, 100];

    // Determine which phase of the cycle we're in
    const phaseIndex = cycleIndex % 3;

    switch (phaseIndex) {
        case 0:
            // Base set in ascending order
            return [20, 40, 100];
        case 1:
            // Shuffled base set
            return shuffleArray([20, 40, 100]);
        case 2:
            // Re-shuffled set
            return shuffleArray([20, 40, 100]);
        default:
            return [20, 40, 100];
    }
};

/**
 * Shuffle array helper
 */
const shuffleArray = (array: number[]): number[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

/**
 * Fetch questions for NEET (combines 4 subjects)
 * Uses existing /authentication/questions/repeater endpoint
 */
export const fetchQuestions = async (params: {
    subject: string;
    std: string;
    type: number;
    offset: number;
    usedIds: string[];
    cycle?: number;
    set?: number;
}) => {
    try {
        const { subject, std, type, offset, usedIds, cycle, set } = params;

        // Check if subject is locked
        if (isSubjectLocked(subject)) {
            throw new Error('SUBJECT_LOCKED');
        }

        // Only NEET is allowed for free users
        if (subject.toLowerCase() !== 'neet') {
            throw new Error('SUBJECT_LOCKED');
        }

        const response = await axiosInstance.post('/authentication/questions/repeater', {
            subject,
            std,
            type,
            offset,
            usedIds,
            cycle,
            set,
        });

        if (response && response.data && Array.isArray(response.data)) {
            return response.data;
        }

        return [];
    } catch (error: any) {
        // ... (logging)
        throw error;
    }
};

/**
 * Filter questions for free users
 */
export const filterQuestions = (questions: any[]) => {
    return questions;
};

/**
 * Get progression logic for free users
 */
export const getProgressionLogic = (
    correctAnswers: number,
    totalQuestions: number,
    cycleIndex: number = 0,
    setIndexInCycle: number = 0
) => {
    const percentage = (correctAnswers / totalQuestions) * 100;

    // 11th: 5 sets per cycle
    // Sets 0,1,2: Base [20,40,100] in order
    // Sets 3,4,5: Shuffled [20,40,100]
    // Sets 6,7,8: Shuffled [20,40,100] again
    // Set 9: 180
    // Total: 10 sets per cycle

    const basePattern = [20, 40, 100];
    const nextSetIndex = (setIndexInCycle + 1) % 10;
    const isNewCycle = nextSetIndex === 0;
    const nextCycleIndex = isNewCycle ? cycleIndex + 1 : cycleIndex;

    let nextSetSize: number;
    if (nextSetIndex < 3) {
        // Base set in ascending order
        nextSetSize = basePattern[nextSetIndex];
    } else if (nextSetIndex < 6) {
        // First shuffled set
        const shuffled1 = shuffleArray([...basePattern]);
        nextSetSize = shuffled1[nextSetIndex - 3];
    } else if (nextSetIndex < 9) {
        // Second shuffled set
        const shuffled2 = shuffleArray([...basePattern]);
        nextSetSize = shuffled2[nextSetIndex - 6];
    } else {
        // Set 9: 180 questions
        nextSetSize = 180;
    }

    return {
        nextSetSize,
        nextCycleIndex,
        nextSetIndexInCycle: nextSetIndex,
        message: percentage >= 70 ? 'Good job! Continue practicing.' : 'Keep practicing to improve!',
        canProgress: true,
        isNewCycle,
    };
};




/**
 * Get current set info for display
 */
export const getCurrentSetInfo = (cycleIndex: number, setIndexInCycle: number) => {
    const cyclePattern = getCyclePattern(cycleIndex);
    const currentSetSize = cyclePattern[setIndexInCycle];

    const phaseIndex = cycleIndex % 3;
    const phaseName = ['Base Set', 'Shuffled Set', 'Re-shuffled Set'][phaseIndex];

    return {
        setSize: currentSetSize,
        cycleIndex,
        setIndexInCycle,
        phaseName,
        pattern: cyclePattern,
    };
};
