/**
 * Test Strategy for Crash Course Paid Plan Users
 * 
 * NEET Pattern: 4 sets per cycle
 * - Base [20,40,100] → 180
 * 
 * Individual Subject Pattern: 2 sets per cycle
 * - Base [20,40]
 * 
 * Question Distribution (Individual Subjects):
 * - 20Q: 10 from 11th, 10 from 12th
 * - 40Q: 20 from 11th, 20 from 12th
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
        maxQuestionsPerSet: 180,
        allowedDifficulty: ['1', '2', '3'],
        hasTimeLimit: true,
        canSkipQuestions: false,
        showExplanations: true,
        allowRetry: true,
        focusOnHighYield: true,
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

        const response = await axiosInstance.post('/authentication/questions/crash', {
            subject,
            std,
            type,
            offset,
            usedIds,
            difficulty: ['1', '2', '3'],
            planType: 'paid',
            isCrash: true,
            highYieldOnly: true,
            timebound: true,
            cycle,
            set,
        });

        return response.data;
    } catch (error) {
        console.error('[Crash Paid] Error fetching questions:', error);
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

    // Crash Paid: Different patterns for NEET vs Individual Subjects
    const isNeet = totalQuestions === 100 || totalQuestions === 180;

    if (isNeet) {
        // NEET pattern: 4 sets
        const basePattern = [20, 40, 100];
        const nextSetIndex = (setIndexInCycle + 1) % 4;
        const isNewCycle = nextSetIndex === 0;
        const nextCycleIndex = isNewCycle ? cycleIndex + 1 : cycleIndex;

        let nextSetSize: number;
        if (nextSetIndex < 3) {
            nextSetSize = basePattern[nextSetIndex];
        } else {
            nextSetSize = 180;
        }

        return {
            nextSetSize,
            nextCycleIndex,
            nextSetIndexInCycle: nextSetIndex,
            message: percentage >= 80 ? 'Excellent performance!' : 'Keep reviewing high-yield areas.',
            canProgress: true,
            isNewCycle,
        };
    } else {
        // Individual subject pattern: 2 sets
        const basePattern = [20, 40];
        const nextSetIndex = (setIndexInCycle + 1) % 2;
        const isNewCycle = nextSetIndex === 0;
        const nextCycleIndex = isNewCycle ? cycleIndex + 1 : cycleIndex;

        const nextSetSize = basePattern[nextSetIndex];

        return {
            nextSetSize,
            nextCycleIndex,
            nextSetIndexInCycle: nextSetIndex,
            message: percentage >= 80 ? 'Excellent performance!' : 'Keep reviewing high-yield areas.',
            canProgress: true,
            isNewCycle,
        };
    }
};
