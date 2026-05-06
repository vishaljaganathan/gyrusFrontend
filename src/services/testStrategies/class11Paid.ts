/**
 * Test Strategy for 11th Standard Paid Plan Users
 * 
 * NEET Pattern: 10 sets per cycle
 * - Base [20,40,100] → Shuffled [20,40,100] → Shuffled [20,40,100] → 180
 * 
 * Individual Subject Pattern: 6 sets per cycle
 * - Base [20,40] → Shuffled [20,40] → Shuffled [20,40]
 * 
 * Question Distribution (Individual Subjects):
 * - 20Q: 15 from 11th, 5 from 12th
 * - 40Q: 30 from 11th, 10 from 12th
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
        maxQuestionsPerSet: 180, // Paid users get full access
        allowedDifficulty: ['1', '2', '3'], // All difficulty levels
        hasTimeLimit: false,
        canSkipQuestions: true,
        showExplanations: true, // Paid users get explanations
        allowRetry: true };
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
            cycle,
            set } );

        return response.data;
    } catch (error) {
        console.error('[11th Paid] Error fetching questions:', error);
        throw error;
    }
};

export const filterQuestions = (questions: any[]) => {
    // No filtering for paid users
    return questions;
};

export const getProgressionLogic = (
    correctAnswers: number,
    totalQuestions: number,
    cycleIndex: number = 0,
    setIndexInCycle: number = 0
) => {
    const percentage = (correctAnswers / totalQuestions) * 100;

    // Unified Progression (Scratch Rebuild)
    const pattern = totalQuestions >= 180 ? [20, 40, 100, 180] : [20, 40, 100];
    const nextSetIndex = (setIndexInCycle + 1) % pattern.length;
    const isNewCycle = nextSetIndex === 0;
    const nextCycleIndex = isNewCycle ? cycleIndex + 1 : cycleIndex;
    const nextSetSize = pattern[nextSetIndex];

    return {
        nextSetSize,
        nextCycleIndex,
        nextSetIndexInCycle: nextSetIndex,
        message: percentage >= 50 ? 'Good work!' : 'Keep practicing!',
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
