import { useState, useEffect } from 'react';

const TUTORIAL_SECTIONS = [
    // ===== WELCOME =====
    {
        section: 'Welcome',
        target: '.tab-greeting',
        title: 'Welcome to Savify!',
        message: "I'm Savio, your AI financial companion. I'll walk you through every feature so you can become a money master. This tour takes about 2 minutes — let's dive in!",
        tip: 'You can replay this tutorial anytime from the Overview tab.',
        tab: 'overview',
        scrollTo: true,
        emoji: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Hand%20gestures/Waving%20Hand.png',
    },
    // ===== OVERVIEW TAB =====
    {
        section: 'Overview',
        target: '.widget-toggle-card',
        title: 'Quick Add Widget',
        message: "This toggle activates the Quick Add Widget — a floating golden button that lets you log expenses in just 2 taps. It stays on your screen and can be dragged anywhere. Spin through categories like Food, Transport, Shopping & more!",
        tip: 'Tap the golden button, then spin through categories. Select one, enter the amount, done!',
        tab: 'overview',
        scrollTo: true,
        emoji: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/High%20Voltage.png',
    },
    {
        section: 'Overview',
        target: '.savio-note-banner',
        title: 'Savio\'s Notes',
        message: "I live here! After each expense, I'll give you a witty (sometimes judgmental) comment about your spending. I analyze your top categories and spending ratio to craft personalized roasts and encouragements.",
        tip: 'The "Replay" button next to me restarts this tutorial.',
        tab: 'overview',
        scrollTo: true,
        emoji: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Robot.png',
    },
    {
        section: 'Overview',
        target: '.stat-card-dark',
        title: 'Balance Score',
        message: "Your Balance Score (0–1000) reflects how well you manage your budget. It updates in real-time whenever you add an expense. A higher score means you're spending wisely relative to your budget. Tap the info button to see exactly how it's calculated.",
        tip: 'Score = 1000 - (spending / budget × 1000). Stay under budget to keep it high!',
        tab: 'overview',
        scrollTo: true,
        emoji: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Travel%20and%20places/Glowing%20Star.png',
    },
    {
        section: 'Overview',
        target: '.stat-card-rank',
        title: 'Global Rank',
        message: "You're competing with every Savify user worldwide! Your rank is determined by your Balance Score — the better you manage money, the higher you climb. Tap this card to see the full leaderboard.",
        tip: 'Consistent budgeting beats occasional big saves. Stay steady!',
        tab: 'overview',
        scrollTo: true,
        emoji: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Activities/Trophy.png',
    },
    {
        section: 'Overview',
        target: '.streak-ring-container',
        title: 'Daily Streak',
        message: "This ring tracks your consecutive days of expense logging. Every day you log at least one expense, your streak grows! Longer streaks show discipline and help build the habit of financial awareness.",
        tip: 'Log at least one expense every day to keep your streak alive.',
        tab: 'overview',
        scrollTo: true,
        emoji: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Travel%20and%20places/Fire.png',
    },
    {
        section: 'Overview',
        target: '.campus-mates-card',
        title: 'Campus Mates',
        message: "See friends from your college or institution! Scroll horizontally to browse. Tap the + button to invite friends — you can add Campus Mates (same college) or Outsiders (anyone with an email). It's more fun to save together!",
        tip: 'Inviting friends creates healthy accountability for spending.',
        tab: 'overview',
        scrollTo: true,
        emoji: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People/Busts%20in%20Silhouette.png',
    },
    {
        section: 'Overview',
        target: '.weekly-budget-card',
        title: 'Weekly Budget',
        message: "Your weekly budget is shown here with a progress bar. Green means you're on track, red means you've overspent. Tap the pencil icon to edit your budget anytime. It's the foundation of everything — your score, rank, and insights all depend on it.",
        tip: 'Be honest with your budget. Too high = no challenge. Too low = frustration.',
        tab: 'overview',
        scrollTo: true,
        emoji: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Purse.png',
    },
    {
        section: 'Overview',
        target: '.transactions-card',
        title: 'Recent Transactions',
        message: "Every expense you log appears here with the category icon, amount, and date. This is your spending diary — review it regularly to spot patterns. On desktop, there's an 'Add Expense' button here too for quick entries.",
        tip: 'Review your last 10 transactions weekly to catch unnecessary spending.',
        tab: 'overview',
        scrollTo: true,
        emoji: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Ledger.png',
    },
    // ===== ANALYSIS TAB =====
    {
        section: 'Analysis',
        target: '.report-header',
        title: 'Spending Analysis',
        message: "Welcome to the Analytics hub! Here you'll find detailed breakdowns of where your money goes. The pie chart shows category distribution, and the trend line tracks your daily spending velocity over the past week.",
        tip: 'Check this weekly to understand your spending personality.',
        tab: 'analysis',
        scrollTo: true,
        emoji: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Bar%20Chart.png',
    },
    {
        section: 'Analysis',
        target: '.analysis-card-dark',
        title: 'Visual Breakdown',
        message: "The donut chart highlights your top spending categories with exact percentages. Below it, the spending velocity chart shows how fast you're burning through your budget day by day.",
        tip: 'If one category dominates, that\'s your biggest savings opportunity.',
        tab: 'analysis',
        scrollTo: true,
        emoji: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Magnifying%20Glass%20Tilted%20Left.png',
    },
    {
        section: 'Analysis',
        target: '.detailed-analysis-btn',
        title: 'Deep Dive Analytics',
        message: "Tap 'Detailed Analysis' for advanced insights: budget runway predictions (how many days until you run out), best & worst spending days, weekly spending comparisons, and velocity charts with trend analysis.",
        tip: 'The runway prediction is your most powerful tool — use it to pace yourself.',
        tab: 'analysis',
        scrollTo: false,
        emoji: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Gem%20Stone.png',
    },
    // ===== PROFILE TAB =====
    {
        section: 'Profile',
        target: '.profile-header-card',
        title: 'Your Profile',
        message: "Your identity on Savify! See your avatar, display name, tier badge (Bronze → Silver → Gold → Platinum), and your verified institution. Everything updates automatically as your performance improves.",
        tip: 'Reach 900+ Balance Score to unlock Platinum tier!',
        tab: 'profile',
        scrollTo: true,
        emoji: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Smiling%20Face%20with%20Sunglasses.png',
    },
    {
        section: 'Profile',
        target: '.profile-stats-grid',
        title: 'Quick Stats Overview',
        message: "Four key metrics at a glance: Balance Score, Global Rank, Current Tier, and Weekly Budget. This is your financial health dashboard — green means healthy, and each metric links to deeper insights.",
        tip: 'Screenshot your stats weekly to track your progress over time!',
        tab: 'profile',
        scrollTo: true,
        emoji: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Chart%20Increasing.png',
    },
    // ===== FINAL STEP =====
    {
        section: 'Get Started',
        target: '.mobile-fab',
        title: 'Start Tracking!',
        message: "You're all set! The most important action is logging your expenses consistently. Tap the 'Add Expense' button below to record your first spending. Remember: awareness is the first step to smarter spending.",
        tip: 'Start by logging today\'s expenses — even small ones count!',
        tab: 'overview',
        scrollTo: false,
        emoji: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Money%20Bag.png',
    },
];

export default function TutorialOverlay({ onComplete, onOpenExpense, onSwitchTab }) {
    const [step, setStep] = useState(0);
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const currentStep = TUTORIAL_SECTIONS[step];
        if (!currentStep) return;

        // Switch tab if needed
        if (onSwitchTab && currentStep.tab) {
            onSwitchTab(currentStep.tab);
        }

        // Wait for DOM to update after tab switch
        const timer = setTimeout(() => {
            const targetEl = document.querySelector(currentStep.target);
            if (targetEl) {
                targetEl.classList.add('tutorial-spotlight');
                if (currentStep.scrollTo) {
                    targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        }, 300);

        return () => {
            clearTimeout(timer);
            const targetEl = document.querySelector(currentStep.target);
            if (targetEl) targetEl.classList.remove('tutorial-spotlight');
        };
    }, [step, onSwitchTab]);

    const handleNext = () => {
        const currentTarget = document.querySelector(TUTORIAL_SECTIONS[step]?.target);
        if (currentTarget) currentTarget.classList.remove('tutorial-spotlight');

        if (step < TUTORIAL_SECTIONS.length - 1) {
            setStep(step + 1);
        } else {
            handleFinish();
            if (onOpenExpense) onOpenExpense();
        }
    };

    const handleFinish = () => {
        const currentTarget = document.querySelector(TUTORIAL_SECTIONS[step]?.target);
        if (currentTarget) currentTarget.classList.remove('tutorial-spotlight');
        localStorage.setItem('savify_tutorial_done', 'true');
        if (onSwitchTab) onSwitchTab('overview');
        setVisible(false);
        onComplete?.();
    };

    if (!visible) return null;

    const currentStep = TUTORIAL_SECTIONS[step];
    const progress = ((step + 1) / TUTORIAL_SECTIONS.length) * 100;

    // Section detection for badge
    const sectionColors = {
        'Welcome': '#D4AF37',
        'Overview': '#10B981',
        'Analysis': '#3B82F6',
        'Profile': '#8B5CF6',
        'Get Started': '#EF4444',
    };

    return (
        <>
            <div className="tutorial-overlay active" onClick={(e) => e.stopPropagation()} />
            <div className="tutorial-agent active">
                {/* Section badge */}
                <div className="tutorial-section-badge" style={{ background: sectionColors[currentStep.section] || '#10B981' }}>
                    {currentStep.section}
                </div>

                {/* Emoji avatar */}
                <div className="tutorial-avatar-wrapper">
                    <img
                        src={currentStep.emoji}
                        alt=""
                        className="tutorial-emoji-avatar"
                        loading="lazy"
                    />
                </div>

                <h3 className="tutorial-heading">{currentStep.title}</h3>

                {/* Progress bar */}
                <div className="tutorial-progress-bar">
                    <div className="tutorial-progress-fill" style={{ width: `${progress}%` }}></div>
                </div>
                <div className="tutorial-step-count">Step {step + 1} of {TUTORIAL_SECTIONS.length}</div>

                <p className="tutorial-message">{currentStep.message}</p>

                {/* Pro Tip */}
                {currentStep.tip && (
                    <div className="tutorial-tip">
                        <span className="tutorial-tip-icon">
                            <img
                                src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Light%20Bulb.png"
                                alt="tip"
                                style={{ width: 18, height: 18 }}
                                loading="lazy"
                            />
                        </span>
                        <span className="tutorial-tip-text">{currentStep.tip}</span>
                    </div>
                )}

                <div className="tutorial-actions">
                    <button className="tutorial-skip" onClick={handleFinish}>
                        Skip
                    </button>
                    <button className="tutorial-next" onClick={handleNext}>
                        {step < TUTORIAL_SECTIONS.length - 1 ? 'Next' : 'Finish'} <i className="fas fa-arrow-right" style={{ marginLeft: 6 }}></i>
                    </button>
                </div>
            </div>
        </>
    );
}
