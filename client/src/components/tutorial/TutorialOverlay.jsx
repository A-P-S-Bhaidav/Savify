import { useState, useEffect } from 'react';

const TUTORIAL_STEPS = [
    // ===== OVERVIEW TAB =====
    {
        target: '.tab-greeting',
        message: "Welcome to Savify! I'm Savio, your financial companion. Let me show you around! 🎉",
        tab: 'overview',
        scrollTo: true,
    },
    {
        target: '.widget-toggle-card',
        message: "Toggle this to enable the Quick Add Widget — a floating button that lets you add expenses with one tap from anywhere!",
        tab: 'overview',
        scrollTo: true,
    },
    {
        target: '.savio-note-banner',
        message: "I live here! I'll give you spicy (sometimes judgmental) comments based on your spending. Hit 'Replay' to revisit this tour anytime.",
        tab: 'overview',
        scrollTo: true,
    },
    {
        target: '.stat-card-dark',
        message: "This is your Balance Score — it tracks how well you manage your budget (0–1000). Tap the ⓘ button for the scoring logic!",
        tab: 'overview',
        scrollTo: true,
    },
    {
        target: '.stat-card-rank',
        message: "Your Global Rank — compete with other Savify users! The better your allocation, the higher you climb. 🚀",
        tab: 'overview',
        scrollTo: true,
    },
    {
        target: '.campus-mates-card',
        message: "Your Campus Mates! Scroll horizontally to see friends. Invite more using the + button. You can invite Campus Mates or Outsiders.",
        tab: 'overview',
        scrollTo: true,
    },
    {
        target: '.weekly-budget-card',
        message: "Track your weekly budget here! The progress bar turns red when you're over budget. Tap 'Edit' to change your budget anytime.",
        tab: 'overview',
        scrollTo: true,
    },
    {
        target: '.transactions-card',
        message: "Your recent transactions appear here. Each entry shows the category icon, amount, and description.",
        tab: 'overview',
        scrollTo: true,
    },
    // ===== ANALYSIS TAB =====
    {
        target: '.report-header',
        message: "Welcome to Analysis! Here you'll see detailed spending breakdowns and trends.",
        tab: 'analysis',
        scrollTo: true,
    },
    {
        target: '.analysis-card-dark',
        message: "Pie chart shows where your money goes. The trend line tracks your daily spending velocity over the last 7 days.",
        tab: 'analysis',
        scrollTo: true,
    },
    {
        target: '.detailed-analysis-btn',
        message: "Tap 'Detailed Analysis' (or Deep Dive) for runway predictions, best/worst days, velocity charts, and weekly comparisons!",
        tab: 'analysis',
        scrollTo: false,
    },
    // ===== PROFILE TAB =====
    {
        target: '.profile-header-card',
        message: "Your profile! See your avatar, name, tier badge, and verified institution status.",
        tab: 'profile',
        scrollTo: true,
    },
    {
        target: '.profile-stats-grid',
        message: "Quick stats: Balance Score, Global Rank, Tier, and Weekly Budget — all at a glance.",
        tab: 'profile',
        scrollTo: true,
    },
    // ===== FINAL STEP =====
    {
        target: '.mobile-fab',
        message: "Last but most important — the 'Add Expense' button! Tap it to log your spending. I'll open it for you now. Happy tracking! 💰",
        tab: 'overview',
        scrollTo: false,
    },
];

export default function TutorialOverlay({ onComplete, onOpenExpense, onSwitchTab }) {
    const [step, setStep] = useState(0);
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const currentStep = TUTORIAL_STEPS[step];
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
        const currentTarget = document.querySelector(TUTORIAL_STEPS[step]?.target);
        if (currentTarget) currentTarget.classList.remove('tutorial-spotlight');

        if (step < TUTORIAL_STEPS.length - 1) {
            setStep(step + 1);
        } else {
            handleFinish();
            if (onOpenExpense) onOpenExpense();
        }
    };

    const handleFinish = () => {
        const currentTarget = document.querySelector(TUTORIAL_STEPS[step]?.target);
        if (currentTarget) currentTarget.classList.remove('tutorial-spotlight');
        localStorage.setItem('savify_tutorial_done', 'true');
        // Switch back to overview on finish
        if (onSwitchTab) onSwitchTab('overview');
        setVisible(false);
        onComplete?.();
    };

    if (!visible) return null;

    const currentStep = TUTORIAL_STEPS[step];
    const progress = ((step + 1) / TUTORIAL_STEPS.length) * 100;

    return (
        <>
            <div className="tutorial-overlay active" onClick={(e) => e.stopPropagation()} />
            <div className="tutorial-agent active">
                <div className="tutorial-avatar-wrapper">
                    <div className="tutorial-avatar">
                        <i className="fas fa-robot"></i>
                    </div>
                </div>
                <h3 className="tutorial-heading">Savio</h3>

                {/* Progress bar */}
                <div className="tutorial-progress-bar">
                    <div className="tutorial-progress-fill" style={{ width: `${progress}%` }}></div>
                </div>
                <div className="tutorial-step-count">Step {step + 1} of {TUTORIAL_STEPS.length}</div>

                <p className="tutorial-message">{currentStep.message}</p>
                <div className="tutorial-actions">
                    <button className="tutorial-skip" onClick={handleFinish}>
                        Skip Tutorial
                    </button>
                    <button className="tutorial-next" onClick={handleNext}>
                        {step < TUTORIAL_STEPS.length - 1 ? 'Next' : 'Finish'} <i className="fas fa-arrow-right" style={{ marginLeft: 6 }}></i>
                    </button>
                </div>
            </div>
        </>
    );
}
