/**
 * Test Strategy for Repeater Paid Plan Users
 * 
 * NEET Pattern: 7 sets per cycle
 * - Base [20,40,100] → Shuffled [20,40,100] → 180
 * 
 * Individual Subject Pattern: 4 sets per cycle
 * - Base [20,40] → Shuffled [20,40]
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
    focusOnWeakAreas: boolean;
}

export const getTestConfig = (): TestConfig => {
    return {
        maxQuestionsPerSet: 180,
        allowedDifficulty: ['1', '2', '3'],
        hasTimeLimit: false,
        canSkipQuestions: true,
        showExplanations: true,
        allowRetry: true,
        focusOnWeakAreas: true };
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

        const response = await axiosInstance.post('/authentication/questions/repeater', {
            subject,
            std,
            type,
            offset,
            usedIds,
            difficulty: ['1', '2', '3'],
            planType: 'paid',
            isRepeater: true,
            mixBothYears: true,
            cycle,
            set } );

        return response.data;
    } catch (error) {
        console.error('[Repeater Paid] Error fetching questions:', error);
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

    // Repeater Paid: Different patterns for NEET vs Individual Subjects
    const isNeet = totalQuestions === 100 || totalQuestions === 180;

    if (isNeet) {
        // NEET pattern: 7 sets
        const basePattern = [20, 40, 100];
        const nextSetIndex = (setIndexInCycle + 1) % 7;
        const isNewCycle = nextSetIndex === 0;
        const nextCycleIndex = isNewCycle ? cycleIndex + 1 : cycleIndex;

        let nextSetSize: number;
        if (nextSetIndex < 3) {
            nextSetSize = basePattern[nextSetIndex];
        } else if (nextSetIndex < 6) {
            const shuffled = shuffleArray([...basePattern]);
            nextSetSize = shuffled[nextSetIndex - 3];
        } else {
            nextSetSize = 180;
        }

        return {
            nextSetSize,
            nextCycleIndex,
            nextSetIndexInCycle: nextSetIndex,
            message: percentage >= 60 ? 'Good improvement. Focus on weak topics.' : 'Review fundamentals. Check personalized plan.',
            canProgress: true,
            isNewCycle };
    } else {
        // Individual subject pattern: 4 sets
        const basePattern = [20, 40];
        const nextSetIndex = (setIndexInCycle + 1) % 4;
        const isNewCycle = nextSetIndex === 0;
        const nextCycleIndex = isNewCycle ? cycleIndex + 1 : cycleIndex;

        let nextSetSize: number;
        if (nextSetIndex < 2) {
            nextSetSize = basePattern[nextSetIndex];
        } else {
            const shuffled = shuffleArray([...basePattern]);
            nextSetSize = shuffled[nextSetIndex - 2];
        }

        return {
            nextSetSize,
            nextCycleIndex,
            nextSetIndexInCycle: nextSetIndex,
            message: percentage >= 60 ? 'Good improvement. Focus on weak topics.' : 'Review fundamentals. Check personalized plan.',
            canProgress: true,
            isNewCycle };
    }
};

const shuffleArray = (array: number[]): number[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};
