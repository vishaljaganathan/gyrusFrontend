/**
 * Test Strategy for Crash Course Free Plan Users
 * - Intensive, time-bound preparation
 * - Focus on high-yield topics
 * - Limited features
 */

import { axiosInstance } from '../../config/indeceptor';

export interface TestConfig {
    maxQuestionsPerSet: number;
    allowedDifficulty: string[];
    hasTimeLimit: boolean;
    canSkipQuestions: boolean;
    showExplanations: boolean;
    allowRetry: boolean;
    focusOnHighYield: boolean;
}

export const getTestConfig = (): TestConfig => {
    return {
        maxQuestionsPerSet: 20,
        allowedDifficulty: ['1', '2'],
        hasTimeLimit: true, // Crash course always has time limits
        canSkipQuestions: false, // Must attempt all in crash mode
        showExplanations: false,
        allowRetry: true,
        focusOnHighYield: true, // Only important topics
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

        const response = await axiosInstance.post('/authentication/questions/crash', {
            subject,
            std,
            type,
            offset,
            usedIds,
            difficulty: ['1', '2'],
            planType: 'free',
            isCrash: true,
            highYieldOnly: true,
            timebound: true,
            cycle,
            set,
        });

        return response.data;
    } catch (error) {
        console.error('[Crash Free] Error fetching questions:', error);
        throw error;
    }
};

// Filter for high-yield questions only
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

    // Crash: 4 sets per cycle
    // Sets 0,1,2: Base [20,40,100] in order
    // Set 3: 180

    const basePattern = [20, 40, 100];
    const nextSetIndex = (setIndexInCycle + 1) % 4;
    const isNewCycle = nextSetIndex === 0;
    const nextCycleIndex = isNewCycle ? cycleIndex + 1 : cycleIndex;

    let nextSetSize: number;
    if (nextSetIndex < 3) {
        // Base set in ascending order
        nextSetSize = basePattern[nextSetIndex];
    } else {
        // Set 3: 180 questions
        nextSetSize = 180;
    }

    return {
        nextSetSize,
        nextCycleIndex,
        nextSetIndexInCycle: nextSetIndex,
        message: percentage >= 80 ? 'Excellent! Moving to next topic.' : 'Focus on high-yield topics first.',
        canProgress: true,
        isNewCycle,
    };
};

