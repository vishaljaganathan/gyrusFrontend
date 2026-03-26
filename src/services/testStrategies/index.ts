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

    // console.log('[TestStrategy] Selection:', { 
    //     subject, 
    //     subjectLower, 
    //     planValid: userProfile.planValid, 
    //     isPaidIndividual, 
    //     selectedStrategy: isPaidIndividual ? 'PaidIndividual (20↔40 repeating)' : 'Base (20/40/100 repeats →180)' 
    // });

    if (isPaidIndividual) {
        return {
            getTestConfig: () => PaidIndividualStrategy.getTestConfig(userProfile.planValid),
            fetchQuestions: PaidIndividualStrategy.fetchQuestions,
            filterQuestions: PaidIndividualStrategy.filterQuestions,
            getProgressionLogic: PaidIndividualStrategy.getProgressionLogic,
            getSetLabel: PaidIndividualStrategy.getSetLabel,
            getCyclePattern: PaidIndividualStrategy.getCyclePattern,
        };
    }

    return {
        getTestConfig: () => BaseStrategy.getTestConfig(userProfile.planValid),
        fetchQuestions: BaseStrategy.fetchQuestions,
        filterQuestions: BaseStrategy.filterQuestions,
        getProgressionLogic: BaseStrategy.getProgressionLogic,
        getSetLabel: BaseStrategy.getSetLabel,
        getCyclePattern: BaseStrategy.getCyclePattern,
    };
};

export const getStrategyDescription = (userProfile: UserProfile): string => {
    return userProfile.planValid ? 'Premium Practice Mode' : 'Standard Practice Mode';
};
