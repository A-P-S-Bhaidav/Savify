import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useExpenses } from '../hooks/useExpenses';
import { useRealtime } from '../hooks/useRealtime';
import { useFriends } from '../hooks/useFriends';
import { supabase } from '../config/supabase';
import { parseCurrency, getTierFromScore, getFlirtyComment, APP_START_DATE } from '../utils/helpers';
import { flirtDb } from '../utils/flirtDb';
import { hallIdentities } from '../utils/hallIdentities';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import MobileBottomNav from '../components/layout/MobileBottomNav';
import OverviewTab from '../components/dashboard/OverviewTab';
import AnalysisTab from '../components/dashboard/AnalysisTab';
import ProfileTab from '../components/dashboard/ProfileTab';
import ExpenseModal from '../components/modals/ExpenseModal';
import ConfirmModal from '../components/modals/ConfirmModal';
import InviteModal from '../components/modals/InviteModal';
import EditProfileModal from '../components/modals/EditProfileModal';
import SupportModal from '../components/modals/SupportModal';
import ContactModal from '../components/modals/ContactModal';
import FeedbackModal from '../components/modals/FeedbackModal';
import HowItWorksModal from '../components/modals/HowItWorksModal';
import OnboardingForm from '../components/onboarding/OnboardingForm';
import QuickAddWidget from '../components/widget/QuickAddWidget';
import '../styles/dashboard.css';

export default function DashboardPage() {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // App state
    const [loading, setLoading] = useState(true);
    const [appData, setAppData] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [balanceScore, setBalanceScore] = useState(0);
    const [currentRank, setCurrentRank] = useState(0);
    const [currentBudget, setCurrentBudget] = useState(0);
    const [currentSpending, setCurrentSpending] = useState(0);
    const [streak, setStreak] = useState(0);
    const [aiComment, setAiComment] = useState('');
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [widgetEnabled, setWidgetEnabled] = useState(() => {
        const saved = localStorage.getItem('savify_widget_enabled');
        return saved === null ? true : saved === 'true'; // default ON
    });

    // Modal states
    const [modals, setModals] = useState({
        expense: false,
        confirm: false,
        invite: false,
        edit: false,
        support: false,
        contact: false,
        feedback: false,
        howItWorks: false,
    });

    // Pending expense for confirm modal
    const [pendingExpense, setPendingExpense] = useState(null);

    // Hooks
    const { expenses, history, fetchExpenses, fetchHistory, addExpense, calculateStreak } = useExpenses(user?.id);
    const { friends, loading: friendsLoading, hasMore, fetchFriends } = useFriends(user?.id);

    // Swipe navigation
    const tabs = ['overview', 'analysis', 'profile'];
    const touchStartRef = useRef({ x: 0, y: 0 });

    // Open/close modals
    const openModal = (name) => setModals(prev => ({ ...prev, [name]: true }));
    const closeModal = (name) => setModals(prev => ({ ...prev, [name]: false }));

    // Fetch score and rank from leaderboard view
    const fetchScoreAndRank = useCallback(async () => {
        if (!user) return;
        try {
            const { data, error } = await supabase
                .from('leaderboard_view')
                .select('current_score, rank_number')
                .eq('user_id', user.id)
                .maybeSingle();

            if (!error && data) {
                const score = Math.round(data.current_score || 0);
                setBalanceScore(score === 0 ? 50 : score);
                setCurrentRank(data.rank_number || 0);
            }
        } catch (e) {
            console.error('Score fetch error:', e);
        }
    }, [user]);

    // Fetch AI comment
    const fetchAiComment = useCallback(async (category, amount, totalSpent, budget) => {
        try {
            const { data, error } = await supabase.functions.invoke('generate-comment', {
                body: { category, amount, totalSpent, budget }
            });
            if (error) throw error;
            return data.comment || "Spicy comment loaded.";
        } catch {
            const ratio = budget > 0 ? (totalSpent / budget) : 0;
            return getFlirtyComment(category, amount, ratio, flirtDb);
        }
    }, []);

    // Initialize dashboard
    useEffect(() => {
        if (!user) return;

        const initDashboard = async () => {
            try {
                const { data: app } = await supabase
                    .from('user_applications')
                    .select('*')
                    .eq('user_id', user.id)
                    .maybeSingle();

                setLoading(false);

                if (!app) {
                    setShowOnboarding(true);
                    return;
                }

                setAppData(app);
                setCurrentBudget(parseCurrency(app.weekly_spending));
                setCurrentSpending(parseCurrency(app.current_weekly_spent));

                // Fetch data
                await fetchScoreAndRank();
                await fetchExpenses();
                await fetchHistory();
                const streakCount = await calculateStreak();
                setStreak(streakCount);

                // Fetch friends
                if (app.college) {
                    fetchFriends(app.college);
                }

                // Generate AI comment
                const allExpenses = await fetchExpenses();
                const filtered = allExpenses.filter(exp => new Date(exp.created_at) >= APP_START_DATE);
                const total = filtered.reduce((sum, exp) => sum + exp.amount, 0);
                if (total > 0) {
                    const catTotals = {};
                    filtered.forEach(exp => { catTotals[exp.category] = (catTotals[exp.category] || 0) + exp.amount; });
                    const topCat = Object.keys(catTotals).reduce((a, b) => catTotals[a] > catTotals[b] ? a : b, 'Food');
                    const comment = await fetchAiComment(topCat, 0, total, parseCurrency(app.weekly_spending));
                    setAiComment(comment);
                } else {
                    setAiComment("Start spending... I'm getting bored.");
                }

                // Check action param
                if (searchParams.get('action') === 'add') {
                    setTimeout(() => openModal('expense'), 1000);
                }
            } catch (e) {
                console.error('Init Error:', e);
                setLoading(false);
            }
        };

        initDashboard();
    }, [user]);

    // Realtime updates
    const handleExpenseChange = useCallback(() => {
        fetchScoreAndRank();
        fetchExpenses();
        fetchHistory();
    }, [fetchScoreAndRank, fetchExpenses, fetchHistory]);

    const handleProfileChange = useCallback((payload) => {
        if (payload.new) {
            setAppData(payload.new);
            setCurrentBudget(parseCurrency(payload.new.weekly_spending));
            setCurrentSpending(parseCurrency(payload.new.current_weekly_spent));
        }
        fetchScoreAndRank();
    }, [fetchScoreAndRank]);

    useRealtime(user?.id, handleExpenseChange, handleProfileChange);

    // Submit expense flow
    const handleExpenseSubmit = (amount, category, description) => {
        setPendingExpense({ amount, category, description });
        closeModal('expense');
        openModal('confirm');
    };

    const handleConfirmExpense = async () => {
        if (!pendingExpense) return;
        const { amount, category, description } = pendingExpense;

        try {
            await addExpense(amount, category, description);

            // Update local state
            const newSpending = currentSpending + amount;
            setCurrentSpending(newSpending);

            // Update user_applications
            let projectedScore = 1000 - Math.round((newSpending / Math.max(currentBudget, 1)) * 1000);
            projectedScore = Math.max(0, Math.min(1000, projectedScore));

            await supabase.from('user_applications')
                .update({ current_weekly_spent: newSpending, current_score: projectedScore })
                .eq('user_id', user.id);

            // AI comment
            const comment = await fetchAiComment(category, amount, newSpending, currentBudget);
            setAiComment(comment);

            closeModal('confirm');
            setPendingExpense(null);

            // Refresh data
            await fetchHistory();
            await fetchScoreAndRank();

            // Confetti
            if (typeof window.confetti === 'function') {
                window.confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#FF5722', '#D4AF37', '#000000'] });
            }
        } catch (e) {
            console.error('Expense Error:', e);
            alert('Failed to save expense: ' + (e.message || 'Unknown error'));
        }
    };

    // Tab switching
    const switchTab = (tab) => setActiveTab(tab);

    // Swipe handlers
    const handleTouchStart = (e) => {
        if (e.target.closest('.friends-grid')) return;
        touchStartRef.current = { x: e.changedTouches[0].screenX, y: e.changedTouches[0].screenY };
    };

    const handleTouchEnd = (e) => {
        const endX = e.changedTouches[0].screenX;
        const endY = e.changedTouches[0].screenY;
        const xDiff = touchStartRef.current.x - endX;
        const yDiff = touchStartRef.current.y - endY;
        if (Math.abs(xDiff) > Math.abs(yDiff) && Math.abs(xDiff) > 50) {
            const currentIdx = tabs.indexOf(activeTab);
            if (xDiff > 0 && currentIdx < tabs.length - 1) switchTab(tabs[currentIdx + 1]);
            else if (xDiff < 0 && currentIdx > 0) switchTab(tabs[currentIdx - 1]);
        }
    };

    // Onboarding complete
    const handleOnboardingComplete = () => {
        setShowOnboarding(false);
        window.location.reload();
    };

    if (loading) {
        return (
            <div className="dashboard-loader">
                <div className="spinner"></div>
            </div>
        );
    }

    if (showOnboarding) {
        return <OnboardingForm user={user} onComplete={handleOnboardingComplete} />;
    }

    if (!appData) return null;

    const tier = getTierFromScore(balanceScore);
    const avatarUrl = user?.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(appData.full_name)}&background=0D9488&color=fff`;
    const remaining = currentBudget - currentSpending;
    const budgetPct = currentBudget > 0 ? (currentSpending / currentBudget) * 100 : 0;

    return (
        <div className="dashboard-body" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
            <div className="app-layout">
                <Sidebar
                    appData={appData}
                    activeTab={activeTab}
                    onTabChange={switchTab}
                    avatarUrl={avatarUrl}
                />

                <main className="main-content">
                    <Header
                        appData={appData}
                        onInstall={() => { }}
                        onHelp={() => openModal('howItWorks')}
                        onAddExpense={() => openModal('expense')}
                    />

                    {/* Overview Tab */}
                    <div className={`dashboard-section ${activeTab === 'overview' ? 'active' : ''}`}>
                        <OverviewTab
                            balanceScore={balanceScore}
                            currentRank={currentRank}
                            tier={tier}
                            currentBudget={currentBudget}
                            currentSpending={currentSpending}
                            remaining={remaining}
                            budgetPct={budgetPct}
                            streak={streak}
                            aiComment={aiComment}
                            history={history}
                            friends={friends}
                            friendsLoading={friendsLoading}
                            hasMoreFriends={hasMore}
                            appData={appData}
                            hallIdentities={hallIdentities}
                            onAddExpense={() => openModal('expense')}
                            onOpenInvite={() => openModal('invite')}
                            onOpenEdit={() => openModal('edit')}
                            onOpenHowItWorks={() => openModal('howItWorks')}
                            onLoadMoreFriends={() => appData?.college && fetchFriends(appData.college, true)}
                            user={user}
                            widgetEnabled={widgetEnabled}
                            onToggleWidget={(val) => { setWidgetEnabled(val); localStorage.setItem('savify_widget_enabled', val ? 'true' : 'false'); }}
                        />
                    </div>

                    {/* Analysis Tab */}
                    <div className={`dashboard-section ${activeTab === 'analysis' ? 'active' : ''}`}>
                        <AnalysisTab
                            expenses={expenses}
                            currentBudget={currentBudget}
                        />
                    </div>

                    {/* Profile Tab */}
                    <div className={`dashboard-section ${activeTab === 'profile' ? 'active' : ''}`}>
                        <ProfileTab
                            appData={appData}
                            user={user}
                            balanceScore={balanceScore}
                            currentRank={currentRank}
                            tier={tier}
                            currentBudget={currentBudget}
                            currentSpending={currentSpending}
                            avatarUrl={avatarUrl}
                            onEdit={() => openModal('edit')}
                            onLogout={async () => { await signOut(); window.location.href="https://savifyappnewtrial.vercel.app"; }}
                        />
                    </div>

                    <footer className="app-footer">
                        <p>&copy; 2026 Savify. All rights reserved.</p>
                        <p><i className="fas fa-code"></i> Made with ❤️ by IIT KGP Students</p>
                        <p style={{ fontSize: '0.65rem', opacity: 0.7, marginTop: 5 }}>* Comments are AI generated</p>
                    </footer>
                </main>
            </div>

            <MobileBottomNav activeTab={activeTab} onTabChange={switchTab} />

            {/* FAB for mobile */}
            <button className="mobile-fab" onClick={() => openModal('expense')}>
                <i className="fas fa-plus"></i>
                <span>Add Expense</span>
            </button>

            {/* Quick Add Widget */}
            {widgetEnabled && (
                <QuickAddWidget
                    user={user}
                    addExpense={addExpense}
                    currentBudget={currentBudget}
                    currentSpending={currentSpending}
                    fetchScoreAndRank={fetchScoreAndRank}
                    fetchHistory={fetchHistory}
                    fetchExpenses={fetchExpenses}
                />
            )}

            {/* Swipe dots */}
            <div className="swipe-dots">
                {tabs.map((tab) => (
                    <div key={tab} className={`dot ${activeTab === tab ? 'active' : ''}`}></div>
                ))}
            </div>

            {/* Modals */}
            <ExpenseModal
                isOpen={modals.expense}
                onClose={() => closeModal('expense')}
                onSubmit={handleExpenseSubmit}
            />

            <ConfirmModal
                isOpen={modals.confirm}
                onClose={() => closeModal('confirm')}
                onConfirm={handleConfirmExpense}
                expense={pendingExpense}
            />

            <InviteModal
                isOpen={modals.invite}
                onClose={() => closeModal('invite')}
                user={user}
                appData={appData}
            />

            <EditProfileModal
                isOpen={modals.edit}
                onClose={() => closeModal('edit')}
                user={user}
            />

            <SupportModal
                isOpen={modals.support}
                onClose={() => closeModal('support')}
                onContact={() => { closeModal('support'); openModal('contact'); }}
                onFeedback={() => { closeModal('support'); openModal('feedback'); }}
            />

            <ContactModal
                isOpen={modals.contact}
                onClose={() => closeModal('contact')}
                user={user}
            />

            <FeedbackModal
                isOpen={modals.feedback}
                onClose={() => closeModal('feedback')}
                user={user}
            />

            <HowItWorksModal
                isOpen={modals.howItWorks}
                onClose={() => closeModal('howItWorks')}
            />
        </div>
    );
}
