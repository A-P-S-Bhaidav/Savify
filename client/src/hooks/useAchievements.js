import { useMemo } from 'react';

// 25 Milestones: 5 balance score, 5 amount managed, 5 times added, 10 custom
const MILESTONES = [
    // Balance Score (5)
    { id: 'bs1', name: 'Spark', category: 'score', icon: 'fas fa-star', desc: 'Reach Balance Score 100', threshold: 100, field: 'score', hint: 'Raise your balance score to 100' },
    { id: 'bs2', name: 'Steady', category: 'score', icon: 'fas fa-gem', desc: 'Reach Balance Score 300', threshold: 300, field: 'score', hint: 'Raise your balance score to 300' },
    { id: 'bs3', name: 'Rising', category: 'score', icon: 'fas fa-meteor', desc: 'Reach Balance Score 500', threshold: 500, field: 'score', hint: 'Raise your balance score to 500' },
    { id: 'bs4', name: 'Blazing', category: 'score', icon: 'fas fa-fire', desc: 'Reach Balance Score 750', threshold: 750, field: 'score', hint: 'Raise your balance score to 750' },
    { id: 'bs5', name: 'Legendary', category: 'score', icon: 'fas fa-crown', desc: 'Reach Balance Score 950', threshold: 950, field: 'score', hint: 'Raise your balance score to 950' },

    // Amount Managed (5)
    { id: 'am1', name: 'Penny Wise', category: 'amount', icon: 'fas fa-coins', desc: 'Manage ₹1,000 on Savify', threshold: 1000, field: 'totalManaged', hint: 'Track ₹1,000 in expenses' },
    { id: 'am2', name: 'Money Maven', category: 'amount', icon: 'fas fa-money-bill-wave', desc: 'Manage ₹5,000 on Savify', threshold: 5000, field: 'totalManaged', hint: 'Track ₹5,000 in expenses' },
    { id: 'am3', name: 'Cash Commander', category: 'amount', icon: 'fas fa-money-check-alt', desc: 'Manage ₹25,000 on Savify', threshold: 25000, field: 'totalManaged', hint: 'Track ₹25,000 in expenses' },
    { id: 'am4', name: 'Wealth Warden', category: 'amount', icon: 'fas fa-building', desc: 'Manage ₹50,000 on Savify', threshold: 50000, field: 'totalManaged', hint: 'Track ₹50,000 in expenses' },
    { id: 'am5', name: 'Lakh Lord', category: 'amount', icon: 'fas fa-landmark', desc: 'Manage ₹1,00,000 on Savify', threshold: 100000, field: 'totalManaged', hint: 'Track ₹1,00,000 in expenses' },

    // Times Added (5)
    { id: 'ta1', name: 'First Steps', category: 'count', icon: 'fas fa-seedling', desc: 'Add 10 expenses', threshold: 10, field: 'expenseCount', hint: 'Add 10 expenses to Savify' },
    { id: 'ta2', name: 'Consistent', category: 'count', icon: 'fas fa-chart-bar', desc: 'Add 50 expenses', threshold: 50, field: 'expenseCount', hint: 'Add 50 expenses to Savify' },
    { id: 'ta3', name: 'Dedicated', category: 'count', icon: 'fas fa-bullseye', desc: 'Add 100 expenses', threshold: 100, field: 'expenseCount', hint: 'Add 100 expenses to Savify' },
    { id: 'ta4', name: 'Relentless', category: 'count', icon: 'fas fa-bolt', desc: 'Add 250 expenses', threshold: 250, field: 'expenseCount', hint: 'Add 250 expenses to Savify' },
    { id: 'ta5', name: 'Unstoppable', category: 'count', icon: 'fas fa-rocket', desc: 'Add 500 expenses', threshold: 500, field: 'expenseCount', hint: 'Add 500 expenses to Savify' },

    // Custom (10)
    { id: 'c1', name: 'Genesis', category: 'custom', icon: 'fas fa-magic', desc: 'Add your first expense', threshold: 1, field: 'expenseCount', hint: 'Add your very first expense' },
    { id: 'c2', name: 'Week Warrior', category: 'custom', icon: 'fas fa-shield-alt', desc: '7-day expense streak', threshold: 7, field: 'streak', hint: 'Maintain a 7-day streak' },
    { id: 'c3', name: 'Month Master', category: 'custom', icon: 'fas fa-trophy', desc: '30-day expense streak', threshold: 30, field: 'streak', hint: 'Maintain a 30-day streak' },
    { id: 'c4', name: 'Team Player', category: 'custom', icon: 'fas fa-users', desc: 'Join or create a team', threshold: 1, field: 'teamCount', hint: 'Join or create your first team' },
    { id: 'c5', name: 'Budget Boss', category: 'custom', icon: 'fas fa-shield-check', desc: 'Stay under budget for 4 weeks', threshold: 4, field: 'underBudgetWeeks', hint: 'Stay under budget for 4 consecutive weeks' },
    { id: 'c6', name: 'Explorer', category: 'custom', icon: 'fas fa-compass', desc: 'Use 5+ expense categories', threshold: 5, field: 'categoryCount', hint: 'Use 5 different expense categories' },
    { id: 'c7', name: 'Night Owl', category: 'custom', icon: 'fas fa-moon', desc: 'Add expense after midnight', threshold: 1, field: 'nightExpenses', hint: 'Add an expense between 12 AM - 5 AM' },
    { id: 'c8', name: 'Early Bird', category: 'custom', icon: 'fas fa-sun', desc: 'Add expense before 7 AM', threshold: 1, field: 'earlyExpenses', hint: 'Add an expense before 7 AM' },
    { id: 'c9', name: 'Social Butterfly', category: 'custom', icon: 'fas fa-user-plus', desc: 'Invite 3+ friends', threshold: 3, field: 'inviteCount', hint: 'Invite 3 friends to Savify' },
    { id: 'c10', name: 'Centurion', category: 'custom', icon: 'fas fa-medal', desc: 'Open Savify 100 times', threshold: 100, field: 'appOpens', hint: 'Open the Savify app 100 times' },
];

function getAppOpens() {
    const count = parseInt(localStorage.getItem('savify_app_opens') || '0', 10);
    return count;
}

export function incrementAppOpens() {
    const count = getAppOpens() + 1;
    localStorage.setItem('savify_app_opens', String(count));
    return count;
}

export function useAchievements({ balanceScore = 0, expenses = [], streak = 0, teamCount = 0 }) {
    const milestones = useMemo(() => {
        // Compute user stats from expenses
        const expenseCount = expenses.length;
        const totalManaged = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
        const categories = new Set(expenses.map(e => e.category));
        const categoryCount = categories.size;
        const nightExpenses = expenses.filter(e => {
            const h = new Date(e.created_at).getHours();
            return h >= 0 && h < 5;
        }).length;
        const earlyExpenses = expenses.filter(e => {
            const h = new Date(e.created_at).getHours();
            return h >= 5 && h < 7;
        }).length;
        const inviteCount = parseInt(localStorage.getItem('savify_invite_count') || '0', 10);
        const appOpens = getAppOpens();
        const underBudgetWeeks = parseInt(localStorage.getItem('savify_under_budget_weeks') || '0', 10);

        const stats = {
            score: balanceScore,
            totalManaged,
            expenseCount,
            streak,
            teamCount,
            underBudgetWeeks,
            categoryCount,
            nightExpenses,
            earlyExpenses,
            inviteCount,
            appOpens,
        };

        return MILESTONES.map(m => {
            const current = stats[m.field] || 0;
            const progress = Math.min(100, Math.round((current / m.threshold) * 100));
            const achieved = current >= m.threshold;
            return { ...m, current, progress, achieved };
        });
    }, [balanceScore, expenses, streak, teamCount]);

    const achieved = milestones.filter(m => m.achieved);
    const locked = milestones.filter(m => !m.achieved);

    return { milestones, achieved, locked };
}

export { MILESTONES };
