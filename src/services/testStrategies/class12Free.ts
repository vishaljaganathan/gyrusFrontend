/**
 * Test Strategy for 12th Standard Free Plan Users
 * - Limited question sets
 * - Focus on 12th standard syllabus
 * - Basic features
 */

import { axiosInstance } from '../../config/indeceptor';

export interface TestConfig {
    maxQuestionsPerSet: number;
    allowedDifficulty: string[];
    hasTimeLimit: boolean;
    canSkipQuestions: boolean;
    showExplanations: boolean;
    allowRetry: boolean;
}

export const getTestConfig = (): TestConfig => {
    return {
        maxQuestionsPerSet: 20,
        allowedDifficulty: ['1', '2'],
        hasTimeLimit: false,
        canSkipQuestions: true,
        showExplanations: false,
        allowRetry: true,
    };
};

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
            difficulty: ['1', '2'],
            planType: 'free',
            cycle,
            set,
        });

        return response.data;
    } catch (error) {
        console.error('[12th Free] Error fetching questions:', error);
        throw error;
    }
};

export const filterQuestions = (questions: any[]) => {
    return questions;
};

export const getProgressionLogic = (
    correctAnswers: number,
    totalQuestions: number,
    cycleIndex: number = 0,
    setIndexInCycle: number = 0
) => {
    const percentage = (correctAnswers / totalQuestions) * 100;

    // 12th: 10 sets per cycle
    // Sets 0,1,2: Base [20,40,100] in order
    // Sets 3,4,5: Shuffled [20,40,100]
    // Sets 6,7,8: Shuffled [20,40,100] again
    // Set 9: 180

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
        message: percentage >= 70 ? 'Well done! Continue your preparation.' : 'Review 12th standard concepts.',
        canProgress: true,
        isNewCycle,
    };
};

const shuffleArray = (array: number[]): number[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

