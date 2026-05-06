/**
 * Test Strategy for Repeater Free Plan Users
 * - Focus on revision and weak areas
 * - Limited advanced features
 * - Covers both 11th and 12th
 */

import { axiosInstance } from '../../config/indeceptor';

export interface TestConfig {
    maxQuestionsPerSet: number;
    allowedDifficulty: string[];
    hasTimeLimit: boolean;
    canSkipQuestions: boolean;
    showExplanations: boolean;
    allowRetry: boolean;
    focusOnWeakAreas: boolean;
}

export const getTestConfig = (): TestConfig => {
    return {
        maxQuestionsPerSet: 20,
        allowedDifficulty: ['1', '2'],
        hasTimeLimit: false,
        canSkipQuestions: true,
        showExplanations: false,
        allowRetry: true,
        focusOnWeakAreas: true, // Repeaters need targeted practice
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
            type, // Removed Math.min(type, 20)
            offset,
            usedIds,
            difficulty: ['1', '2'],
            planType: 'free',
            isRepeater: true,
            mixBothYears: true,
            cycle,
            set } );

        return response.data;
    } catch (error) {
        console.error('[Repeater Free] Error fetching questions:', error);
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

    // Repeater: 7 sets per cycle
    // Sets 0,1,2: Base [20,40,100] in order
    // Sets 3,4,5: Shuffled [20,40,100]
    // Set 6: 180

    const basePattern = [20, 40];
    const nextSetIndex = (setIndexInCycle + 1) % 4; // 2 base + 2 shuffled
    const isNewCycle = nextSetIndex === 0;
    const nextCycleIndex = isNewCycle ? cycleIndex + 1 : cycleIndex;

    let nextSetSize: number;
    if (nextSetIndex < 2) {
        // Base set in order
        nextSetSize = basePattern[nextSetIndex];
    } else {
        // Shuffled set
        const shuffled = shuffleArray([...basePattern]);
        nextSetSize = shuffled[nextSetIndex - 2];
    }

    return {
        nextSetSize,
        nextCycleIndex,
        nextSetIndexInCycle: nextSetIndex,
        message: percentage >= 50 ? 'Good progress. Focus on weak topics.' : 'Identify and strengthen weak areas.',
        canProgress: true,
        isNewCycle };
};

const shuffleArray = (array: number[]): number[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

