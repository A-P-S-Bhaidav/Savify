import { useState, useEffect } from 'react';

const TUTORIAL_STEPS = [
    {
        target: '.savio-note-banner',
        message: "I live here! I'll give you spicy (and sometimes judging) comments based on your spending habits.",
        scrollTo: true,
    },
    {
        target: '.stat-card-dark',
        message: "This is your Balance Score — it tracks how well you manage your budget. Higher is better!",
        scrollTo: true,
    },
    {
        target: '.analysis-swipe-area',
        message: "Scroll down here to see visual breakdowns of where your money goes.",
        scrollTo: false,
    },
    {
        target: '.mobile-fab',
        message: "This is the most important button. Click Add Expense to log your spending. I'll open it for you now to see!",
        scrollTo: false,
    },
];

export default function TutorialOverlay({ onComplete, onOpenExpense }) {
    const [step, setStep] = useState(0);
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        // Add spotlight to current target
        const targetEl = document.querySelector(TUTORIAL_STEPS[step]?.target);
        if (targetEl) {
            targetEl.classList.add('tutorial-spotlight');
            if (TUTORIAL_STEPS[step].scrollTo) {
                targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
        return () => {
            if (targetEl) targetEl.classList.remove('tutorial-spotlight');
        };
    }, [step]);

    const handleNext = () => {
        // Remove spotlight from current
        const currentTarget = document.querySelector(TUTORIAL_STEPS[step]?.target);
        if (currentTarget) currentTarget.classList.remove('tutorial-spotlight');

        if (step < TUTORIAL_STEPS.length - 1) {
            setStep(step + 1);
        } else {
            // Last step — open expense modal
            handleFinish();
            if (onOpenExpense) onOpenExpense();
        }
    };

    const handleFinish = () => {
        const currentTarget = document.querySelector(TUTORIAL_STEPS[step]?.target);
        if (currentTarget) currentTarget.classList.remove('tutorial-spotlight');
        localStorage.setItem('savify_tutorial_done', 'true');
        setVisible(false);
        onComplete?.();
    };

    if (!visible) return null;

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
                <p className="tutorial-message">{TUTORIAL_STEPS[step].message}</p>
                <div className="tutorial-actions">
                    <button className="tutorial-skip" onClick={handleFinish}>
                        Skip Tutorial
                    </button>
                    <button className="tutorial-next" onClick={handleNext}>
                        Next <i className="fas fa-arrow-right" style={{ marginLeft: 6 }}></i>
                    </button>
                </div>
            </div>
        </>
    );
}
