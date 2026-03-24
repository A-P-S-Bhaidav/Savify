// Badge rank utility — determines user's rank based on app opens + expenses added

const RANKS = [
    { id: 'omega', name: 'OMEGA', image: '/ranks/omega.png', minOpens: 0, minExpenses: 0 },
    { id: 'gamma', name: 'GAMMA', image: '/ranks/gamma.png', minOpens: 50, minExpenses: 10 },
    { id: 'delta', name: 'DELTA', image: '/ranks/delta.png', minOpens: 100, minExpenses: 20 },
    { id: 'beta', name: 'BETA', image: '/ranks/beta.png', minOpens: 300, minExpenses: 60 },
    { id: 'alpha', name: 'ALPHA', image: '/ranks/alpha.png', minOpens: 800, minExpenses: 160 },
    { id: 'sigma', name: 'SIGMA', image: '/ranks/sigma.png', minOpens: 800, minExpenses: 160 },
];

// Alpha and Sigma share the same threshold — user gets to choose between them
export function getRank(appOpens, expenseCount, chosenTopRank = null) {
    // Check if user qualifies for top tier
    const alphaRank = RANKS.find(r => r.id === 'alpha');
    if (appOpens >= alphaRank.minOpens && expenseCount >= alphaRank.minExpenses) {
        if (chosenTopRank === 'sigma') return RANKS.find(r => r.id === 'sigma');
        return alphaRank; // default to alpha
    }

    // Find current rank (highest qualifying)
    let current = RANKS[0];
    for (const rank of RANKS) {
        if (rank.id === 'sigma') continue; // sigma is a choice, not auto
        if (appOpens >= rank.minOpens && expenseCount >= rank.minExpenses) {
            current = rank;
        }
    }
    return current;
}

export function getNextRank(appOpens, expenseCount) {
    for (const rank of RANKS) {
        if (rank.id === 'sigma') continue;
        if (appOpens < rank.minOpens || expenseCount < rank.minExpenses) {
            return rank;
        }
    }
    return null; // At top — no next rank
}

export function getRankProgress(appOpens, expenseCount) {
    const next = getNextRank(appOpens, expenseCount);
    if (!next) return { opensNeeded: 0, expensesNeeded: 0, atTop: true };

    return {
        opensNeeded: Math.max(0, next.minOpens - appOpens),
        expensesNeeded: Math.max(0, next.minExpenses - expenseCount),
        nextRank: next,
        atTop: false,
    };
}

export function getAppOpens() {
    return parseInt(localStorage.getItem('savify_app_opens') || '0', 10);
}

export function getChosenTopRank() {
    return localStorage.getItem('savify_chosen_top_rank') || null;
}

export function setChosenTopRank(choice) {
    localStorage.setItem('savify_chosen_top_rank', choice);
}

export { RANKS };
