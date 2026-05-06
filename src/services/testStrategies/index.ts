/**
 * Test Strategy Factory (Scratch Rebuild)
 * Selects the appropriate test strategy based on user profile
 */

import * as BaseStrategy from './baseStrategy';
import * as PaidIndividualStrategy from './paidIndividualStrategy';

export type UserProfile = {
    std: string;
    planValid: boolean;
};

export type TestStrategy = {
    getTestConfig: (planValid: boolean) => any;
    fetchQuestions: (params: any) => Promise<any>;
    filterQuestions: (questions: any[]) => any[];
    getProgressionLogic: (correctAnswers: number, totalQuestions: number, cycle: number, set: number, subject: string) => any;
    getCyclePattern?: (std?: string, subject?: string) => number[];
};

export const getTestStrategy = (userProfile: UserProfile, subject: string): any => {
    const subjectLower = (subject || '').toLowerCase().trim();
    const isPaidIndividual = userProfile.planValid && subjectLower !== 'neet';
    const isPaid = userProfile.planValid;

    if (isPaidIndividual) {
        return {
            getTestConfig: () => PaidIndividualStrategy.getTestConfig(isPaid),
            fetchQuestions: PaidIndividualStrategy.fetchQuestions,
            filterQuestions: PaidIndividualStrategy.filterQuestions,
            // Wrap to ensure correct argument mapping
            getProgressionLogic: (c: number, t: number, cy: number, si: number, s: string, std: string) => 
                PaidIndividualStrategy.getProgressionLogic(c, t, cy, si, s, std),
            getSetLabel: PaidIndividualStrategy.getSetLabel,
            getCyclePattern: (std: string) => PaidIndividualStrategy.getCyclePattern(std) };
    }

    return {
        getTestConfig: () => BaseStrategy.getTestConfig(isPaid),
        fetchQuestions: BaseStrategy.fetchQuestions,
        filterQuestions: BaseStrategy.filterQuestions,
        // Bind isPaid to BaseStrategy functions
        getProgressionLogic: (c: number, t: number, cy: number, si: number, s: string, std: string) => 
            BaseStrategy.getProgressionLogic(c, t, cy, si, s, std, isPaid),
        getSetLabel: BaseStrategy.getSetLabel,
        getCyclePattern: (std: string, s: string) => 
            BaseStrategy.getCyclePattern(std, s, isPaid) };
};

export const getStrategyDescription = (userProfile: UserProfile): string => {
    return userProfile.planValid ? 'Premium Practice Mode' : 'Standard Practice Mode';
};
