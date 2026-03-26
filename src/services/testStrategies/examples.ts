/**
 * Example Usage of Test Strategies
 * This file demonstrates how to use the test strategy system in your components
 */

import { getTestStrategy, getStrategyDescription } from './index';

const canAccessFeature = (userProfile: { planValid: boolean }, feature: string) => {
    switch (String(feature || '').toLowerCase()) {
        case 'explanations':
        case 'analytics':
        case 'unlimited':
            return !!userProfile.planValid;
        default:
            return false;
    }
};

// Example 1: Basic usage in Test.tsx
export const exampleBasicUsage = (userData: any) => {
    // Get the appropriate strategy based on user profile
    const strategy = getTestStrategy({
        std: userData.std,
        planValid: userData.planValid,
    }, 'physics');

    // Get configuration
    const config = strategy.getTestConfig();
    // console.log('Max questions per set:', config.maxQuestionsPerSet);
    // console.log('Can show explanations:', config.showExplanations);

    // Fetch questions using the strategy
    const fetchQuestions = async () => {
        try {
            const questions = await strategy.fetchQuestions({
                subject: 'physics',
                std: userData.std,
                type: 20,
                offset: 0,
                usedIds: [],
            });

            // Filter questions based on strategy
            const filteredQuestions = strategy.filterQuestions(questions);

            return filteredQuestions;
        } catch (error) {
            console.error('Error fetching questions:', error);
            return [];
        }
    };

    return { config, fetchQuestions };
};

// Example 2: Check progression logic
export const exampleProgressionCheck = (userData: any, correctAnswers: number, totalQuestions: number) => {
    const strategy = getTestStrategy({
        std: userData.std,
        planValid: userData.planValid,
    }, 'physics');

    const progression = strategy.getProgressionLogic(correctAnswers, totalQuestions);

    // console.log('Next set size:', progression.nextSetSize);
    // console.log('Message:', progression.message);
    // console.log('Can progress:', progression.canProgress);

    return progression;
};

// Example 3: Feature access check
export const exampleFeatureCheck = (userData: any) => {
    const userProfile = {
        std: userData.std,
        planValid: userData.planValid,
    };

    const hasExplanations = canAccessFeature(userProfile, 'explanations');
    const hasAnalytics = canAccessFeature(userProfile, 'analytics');
    const hasUnlimited = canAccessFeature(userProfile, 'unlimited');

    // console.log('Has explanations:', hasExplanations);
    // console.log('Has analytics:', hasAnalytics);
    // console.log('Has unlimited questions:', hasUnlimited);

    return { hasExplanations, hasAnalytics, hasUnlimited };
};

// Example 4: Get strategy description for UI
export const exampleGetDescription = (userData: any) => {
    const description = getStrategyDescription({
        std: userData.std,
        planValid: userData.planValid,
    });

    // console.log('Strategy:', description);
    return description;
};

// Example 5: Complete integration in a component
export const exampleCompleteIntegration = (userData: any) => {
    // 1. Get strategy
    const strategy = getTestStrategy({
        std: userData.std,
        planValid: userData.planValid,
    }, 'physics');

    // 2. Get config
    const config = strategy.getTestConfig();

    // 3. Setup fetch function
    const fetchQuestions = async (params: {
        subject: string;
        type: number;
        offset: number;
        usedIds: string[];
    }) => {
        const questions = await strategy.fetchQuestions({
            ...params,
            std: userData.std,
        });

        return strategy.filterQuestions(questions);
    };

    // 4. Setup progression handler
    const handleTestComplete = (correctAnswers: number, totalQuestions: number) => {
        const progression = strategy.getProgressionLogic(correctAnswers, totalQuestions);

        // Show message to user
        alert(progression.message);

        // Handle progression
        if (progression.canProgress) {
            // Load next set with progression.nextSetSize
            fetchQuestions({
                subject: 'physics',
                type: progression.nextSetSize,
                offset: 0,
                usedIds: [],
            });
        }
    };

    return {
        config,
        fetchQuestions,
        handleTestComplete,
    };
};
