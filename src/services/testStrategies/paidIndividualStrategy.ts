/**
 * Paid Individual Subject Strategy (Scratch Rebuild)
 * Specialized logic for 20/40 questions and customized progression.
 */

import { axiosInstance } from '../../config/indeceptor';

export const getTestConfig = (planValid: boolean) => {
    return {
        maxQuestionsPerSet: 40,
        allowedDifficulty: ['1', '2', '3'],
        hasTimeLimit: false,
        canSkipQuestions: true,
        showExplanations: true,
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
            cycle,
            set } );

        return response.data;
    } catch (error) {
        console.error('[PaidIndividualStrategy] Error:', error);
        throw error;
    }
};

export const filterQuestions = (questions: any[]) => questions;

const normalizeStdCategory = (std: string = ''): 'regular' | 'repeater' | 'crash' => {
    const s = String(std || '').trim().toUpperCase();
    if (s === 'R' || s === 'REPEATER') return 'repeater';
    if (s === 'C' || s === 'CRASH') return 'crash';
    return 'regular';
};

export const getCyclePattern = (std: string = ''): number[] => {
    // Individual subjects pattern requirements:
    // - XI/XII: [20, 40, 20, 40, 20, 40]
    // - Repeater: [20, 40, 20, 40]
    // - Crash: [20, 40]
    const category = normalizeStdCategory(std);
    const repeats = category === 'regular' ? 3 : category === 'repeater' ? 2 : 1;
    const pattern: number[] = [];
    for (let i = 0; i < repeats; i += 1) pattern.push(20, 40);
    return pattern;
};

export const getProgressionLogic = (
    correctAnswers: number,
    totalQuestions: number,
    cycleIndex: number = 0,
    setIndexInCycle: number = 0,
    subject: string = '',
    std: string = ''
) => {
    const percentage = (correctAnswers / totalQuestions) * 100;
    const pattern = getCyclePattern(std);
    const cycleLength = pattern.length;
    const nextSetIndex = (setIndexInCycle + 1) % cycleLength;
    const isNewCycle = nextSetIndex === 0;
    const nextCycleIndex = isNewCycle ? cycleIndex + 1 : cycleIndex;
    const nextSetSize = pattern[nextSetIndex] || 20;

        console.log('[paidIndividualStrategy] getProgressionLogic:', {
      currentSetIndex: setIndexInCycle,
      currentCycle: cycleIndex,
      currentTotalQuestions: totalQuestions,
      correctAnswers,
      percentage,
      std,
      cycleLength,
      pattern,
      nextSetIndex,
      nextSetSize,
      nextCycleIndex,
      isNewCycle
    });

    return {
        nextSetSize,
        nextCycleIndex,
        nextSetIndexInCycle: nextSetIndex,
        message: percentage >= 50 ? 'Great job!' : 'Keep trying!',
        canProgress: true,
        isNewCycle };
};

export const getSetLabel = (setIndex: number) => {
    const labels = [
        "Base Set",
        "Shuffled Base Set",
        "Shuffled Set"
    ];
    return labels[setIndex % 3] || "Practice Set";
};
