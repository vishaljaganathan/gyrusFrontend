/**
 * Base Test Strategy (Scratch Rebuild)
 * Unified logic for all users and subjects
 */

import { axiosInstance } from '../../config/indeceptor';

export const getTestConfig = (planValid: boolean) => {
    return {
        maxQuestionsPerSet: 180,
        allowedDifficulty: planValid ? ['1', '2', '3'] : ['1', '2'],
        hasTimeLimit: false,
        canSkipQuestions: true,
        showExplanations: planValid,
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

        const response = await axiosInstance.post('/authentication/questions/repeater', {
            subject,
            std,
            type,
            offset,
            usedIds,
            cycle,
            set,
        });

        return response.data;
    } catch (error) {
        console.error('[Strategy] Error fetching questions:', error);
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

const isNeetSubject = (subject: string = ''): boolean => {
    const s = String(subject || '').trim().toLowerCase();
    return s === 'neet';
};

const getIndividualPattern = (std: string = ''): number[] => {
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

export const getCyclePattern = (std: string = '', subject: string = ''): number[] => {
    if (!isNeetSubject(subject)) {
        return getIndividualPattern(std);
    }

    // NEET pattern requirements (combined 4 subjects):
    // - XI/XII: [20,40,100] x3 then 180
    // - Repeater: [20,40,100] x2 then 180
    // - Crash: [20,40,100] x1 then 180
    const category = normalizeStdCategory(std);
    const repeats = category === 'regular' ? 3 : category === 'repeater' ? 2 : 1;
    const pattern: number[] = [];
    for (let i = 0; i < repeats; i += 1) pattern.push(20, 40, 100);
    pattern.push(180);
    return pattern;
};

export const getProgressionLogic = (
    correctAnswers: number,
    totalQuestions: number,
    currentCycle: number = 0,
    currentSetIndex: number = 0,
    subject: string = '',
    std: string = ''
) => {
    const percentage = (correctAnswers / totalQuestions) * 100;

    // NEET is a *combined mode* in the product. In some flows the subject string
    // may not be exactly 'neet' even though the set size is clearly NEET (100/180).
    // When that happens, force NEET progression so 100 correctly rolls back to 20.
    const forceNeetBySize = Number(totalQuestions) === 100 || Number(totalQuestions) === 180;
    const effectiveSubject = forceNeetBySize ? 'neet' : subject;

    const pattern = getCyclePattern(std, effectiveSubject);
    const nextSetIndex = (currentSetIndex + 1) % pattern.length;
    const isNewCycle = nextSetIndex === 0;
    const nextCycleIndex = isNewCycle ? currentCycle + 1 : currentCycle;
    const nextSetSize = pattern[nextSetIndex];

    console.log('[baseStrategy] getProgressionLogic:', {
        subject,
        effectiveSubject,
        std,
        pattern,
        currentCycle,
        currentSetIndex,
        totalQuestions,
        correctAnswers,
        percentage,
        nextSetIndex,
        nextSetSize,
        nextCycleIndex,
        isNewCycle,
    });

    return {
        nextSetSize,
        nextCycleIndex,
        nextSetIndexInCycle: nextSetIndex,
        message: percentage >= 50 ? 'Good work!' : 'Keep practicing!',
        canProgress: true,
        isNewCycle,
    };
};

export const getSetLabel = (setIndex: number) => {
    return `Set ${setIndex + 1}`;
};
