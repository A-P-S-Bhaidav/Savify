import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useExpenses } from '../hooks/useExpenses';
import { useRealtime } from '../hooks/useRealtime';
import { useFriends } from '../hooks/useFriends';
import { useAds } from '../hooks/useAds';
import { useAchievements, incrementAppOpens } from '../hooks/useAchievements';
import { useFocusSchedule } from '../hooks/useFocusSchedule';
import { useTeams } from '../hooks/useTeams';
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
import TeamTab from '../components/dashboard/TeamTab';
import FocusSection from '../components/dashboard/FocusSection';
import FocusBlockScreen from '../components/dashboard/FocusBlockScreen';
import ExpenseModal from '../components/modals/ExpenseModal';
import ConfirmModal from '../components/modals/ConfirmModal';
import InviteModal from '../components/modals/InviteModal';
import EditProfileModal from '../components/modals/EditProfileModal';
import SupportModal from '../components/modals/SupportModal';
import ContactModal from '../components/modals/ContactModal';
import FeedbackModal from '../components/modals/FeedbackModal';
import HowItWorksModal from '../components/modals/HowItWorksModal';
import TrustLogicModal from '../components/modals/TrustLogicModal';
import ForceBudgetModal from '../components/modals/ForceBudgetModal';

import OnboardingForm from '../components/onboarding/OnboardingForm';
import QuestionnaireOverlay from '../components/onboarding/QuestionnaireOverlay';
import QuickAddWidget from '../components/widget/QuickAddWidget';
import TutorialOverlay from '../components/tutorial/TutorialOverlay';
import '../styles/dashboard.css';

export default function DashboardPage() {
    const { user, signOut } = useAuth();
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
    const [showQuestionnaire, setShowQuestionnaire] = useState(false);
    const [widgetEnabled, setWidgetEnabled] = useState(() => {
        const saved = localStorage.getItem('savify_widget_enabled');
        return saved === null ? true : saved === 'true';
    });
    const [showTutorial, setShowTutorial] = useState(false);
    const [showSwipeHint, setShowSwipeHint] = useState(false);

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
        trustLogic: false,
        focusSchedule: false,
    });

    const [pendingExpense, setPendingExpense] = useState(null);

    // Hooks
    const { expenses, history, fetchExpenses, fetchHistory, addExpense, calculateStreak } = useExpenses(user?.id);
    const { friends, loading: friendsLoading, hasMore, fetchFriends } = useFriends(user?.id);
    const { ads, handleAdClick } = useAds();
    const { schedule: focusSchedule, isActive: focusIsActive, showBlockScreen, permissions: focusPermissions, availableApps, startSchedule, stopSchedule, grantPermission: grantFocusPermission, triggerBlock, dismissBlock } = useFocusSchedule();
    const { teams, loading: teamsLoading, pendingRequests, selectedTeam, teamExpenses, teamMembers, fetchTeams, fetchPendingRequests, createTeam, joinByCode, approveRequest, rejectRequest, fetchTeamDetail, addTeamExpense, removeMember, setSelectedTeam } = useTeams(user?.id);
    const { achieved: achievedMilestones, locked: lockedMilestones } = useAchievements({
        balanceScore,
        expenses,
        streak,
        teamCount: teams.length,
    });

    // Swipe navigation
    const touchStartRef = useRef({ x: 0, y: 0 });
    const swipeBlocked = useRef(false);

    const openModal = (name) => setModals(prev => ({ ...prev, [name]: true }));
    const closeModal = (name) => setModals(prev => ({ ...prev, [name]: false }));

    const fetchScoreAndRank = useCallback(async () => {
        if (!user) return;
        try {
            const { data, error } = await supabase
                .from('leaderboard_view')
                .select('current_score, rank_number')
                .eq('user_id', user.id)
                .maybeSingle();
            if (!error && data) {
                const score = Math.round(data.current_score ?? 0);
                setBalanceScore(score === 0 && data.current_score == null ? 50 : score);
                setCurrentRank(data.rank_number || 0);
            }
        } catch (e) { console.error('Score fetch error:', e); }
    }, [user]);

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

    useEffect(() => {
        if (!user) return;

        // Track app opens for milestone
        incrementAppOpens();

        const initDashboard = async () => {
            try {
                const { data: app } = await supabase
                    .from('user_applications')
                    .select('*')
                    .eq('user_id', user.id)
                    .maybeSingle();
                setLoading(false);
                if (!app) { setShowOnboarding(true); return; }

                setAppData(app);
                setCurrentBudget(parseCurrency(app.weekly_spending));
                setCurrentSpending(parseCurrency(app.current_weekly_spent));

                // Gate: show questionnaire if not completed
                if (!app.onboarding_q_completed) {
                    setShowQuestionnaire(true);
                    return;
                }

                // Parallelize independent fetches for faster init
                const [allExpenses, , , streakCount] = await Promise.all([
                    fetchExpenses(),
                    fetchScoreAndRank(),
                    fetchHistory(),
                    calculateStreak(),
                ]);
                setStreak(streakCount);
                if (app.college) fetchFriends(app.college);

                // Fetch teams & invites
                fetchTeams();
                fetchPendingRequests();

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

                if (searchParams.get('action') === 'add') setTimeout(() => openModal('expense'), 1000);
                const tutorialDone = localStorage.getItem('savify_tutorial_done');
                if (!tutorialDone) setTimeout(() => setShowTutorial(true), 1500);
                if (window.innerWidth <= 768) {
                    setShowSwipeHint(true);
                    setTimeout(() => setShowSwipeHint(false), 4000);
                }
            } catch (e) {
                console.error('Init Error:', e);
                setLoading(false);
            }
        };
        initDashboard();
    }, [user]);

    const handleExpenseChange = useCallback(() => {
        fetchScoreAndRank(); fetchExpenses(); fetchHistory();
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
            const newSpending = currentSpending + amount;
            setCurrentSpending(newSpending);
            let projectedScore = 1000 - Math.round((newSpending / Math.max(currentBudget, 1)) * 1000);
            projectedScore = Math.max(0, Math.min(1000, projectedScore));
            await supabase.from('user_applications')
                .update({ current_weekly_spent: newSpending, current_score: projectedScore })
                .eq('user_id', user.id);
            const comment = await fetchAiComment(category, amount, newSpending, currentBudget);
            setAiComment(comment);
            closeModal('confirm');
            setPendingExpense(null);
            await fetchHistory();
            await fetchScoreAndRank();
            const streakCount = await calculateStreak();
            setStreak(streakCount);
            if (typeof window.confetti === 'function') {
                window.confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#FF5722', '#D4AF37', '#000000'] });
            }
        } catch (e) {
            console.error('Expense Error:', e);
            alert('Failed to save expense: ' + (e.message || 'Unknown error'));
        }
    };

    const switchTab = (tab) => {
        if (tab === 'support') { openModal('support'); return; }
        setActiveTab(tab);
        // If switching to teams, clear selected team
        if (tab === 'teams') {
            setSelectedTeam(null);
            fetchTeams();
        }
    };

    // Swipe handlers — block when touching widget, friends-grid or scrollable areas
    const handleTouchStart = (e) => {
        const blockedSelectors = [
            '.friends-grid', '.campus-mates-card', '.transactions-list',
            '.widget-fab', '.widget-cat-btn-wrapper', '.widget-backdrop',
            '.widget-popup-overlay', '.inline-focus-section',
            '.team-action-btn', '.team-tab-container', '.milestones-list',
            '.focus-modal'
        ];
        swipeBlocked.current = blockedSelectors.some(sel => e.target.closest(sel));
        touchStartRef.current = { x: e.changedTouches[0].screenX, y: e.changedTouches[0].screenY };
    };

    const handleTouchEnd = (e) => {
        if (swipeBlocked.current) { swipeBlocked.current = false; return; }
        const endX = e.changedTouches[0].screenX;
        const endY = e.changedTouches[0].screenY;
        const xDiff = touchStartRef.current.x - endX;
        const yDiff = touchStartRef.current.y - endY;
        if (Math.abs(xDiff) > Math.abs(yDiff) && Math.abs(xDiff) > 80) {
            const swipeTabs = ['overview', 'analysis', 'focus', 'teams', 'profile'];
            const currentIdx = swipeTabs.indexOf(activeTab);
            if (currentIdx === -1) return;
            if (xDiff > 0 && currentIdx < swipeTabs.length - 1) switchTab(swipeTabs[currentIdx + 1]);
            else if (xDiff < 0 && currentIdx > 0) switchTab(swipeTabs[currentIdx - 1]);
        }
    };

    const handleOnboardingComplete = () => { setShowOnboarding(false); window.location.reload(); };
    const handleReplayTutorial = () => { setShowTutorial(true); };

    if (loading) return <div className="dashboard-loader"><div className="spinner"></div></div>;
    if (showOnboarding) return <OnboardingForm user={user} onComplete={handleOnboardingComplete} />;
    if (showQuestionnaire) return <QuestionnaireOverlay user={user} onComplete={() => { setShowQuestionnaire(false); window.location.reload(); }} />;
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
                    onOpenSupport={() => openModal('support')}
                    avatarUrl={avatarUrl}
                />

                <main className="main-content">
                    <Header onHelp={() => openModal('howItWorks')} />

                    {/* Overview Tab */}
                    <div className={`dashboard-section ${activeTab === 'overview' ? 'active' : ''}`}>
                        <OverviewTab
                            balanceScore={balanceScore} currentRank={currentRank} tier={tier}
                            currentBudget={currentBudget} currentSpending={currentSpending}
                            remaining={remaining} budgetPct={budgetPct} streak={streak}
                            aiComment={aiComment} history={history} friends={friends}
                            friendsLoading={friendsLoading} hasMoreFriends={hasMore} appData={appData}
                            onAddExpense={() => openModal('expense')}
                            onOpenInvite={() => openModal('invite')}
                            onOpenEdit={() => openModal('edit')}
                            onLoadMoreFriends={() => appData?.college && fetchFriends(appData.college, true)}
                            widgetEnabled={widgetEnabled}
                            onToggleWidget={(val) => { setWidgetEnabled(val); localStorage.setItem('savify_widget_enabled', val ? 'true' : 'false'); }}
                            onOpenTrustLogic={() => openModal('trustLogic')}
                            onReplayTutorial={handleReplayTutorial}
                            // Ads
                            ad1={ads.ad1}
                            onAdClick={handleAdClick}
                            // Milestones
                            achievedMilestones={achievedMilestones}
                            lockedMilestones={lockedMilestones}
                        />
                    </div>

                    {/* Analysis Tab */}
                    <div className={`dashboard-section ${activeTab === 'analysis' ? 'active' : ''}`}>
                        <AnalysisTab
                            expenses={expenses} currentBudget={currentBudget} appData={appData}
                            ad2={ads.ad2} onAdClick={handleAdClick}
                        />
                    </div>

                    {/* Focus Tab */}
                    <div className={`dashboard-section ${activeTab === 'focus' ? 'active' : ''}`}>
                        <div className="tab-greeting">
                            <h1>Focus Mode</h1>
                            <p>Block spending apps to save more</p>
                        </div>
                        <FocusSection
                            schedule={focusSchedule}
                            isActive={focusIsActive}
                            availableApps={availableApps}
                            permissions={focusPermissions}
                            onStartSchedule={startSchedule}
                            onStop={stopSchedule}
                            onGrantPermission={grantFocusPermission}
                            onTriggerBlock={triggerBlock}
                        />
                    </div>

                    {/* Teams Tab */}
                    <div className={`dashboard-section ${activeTab === 'teams' ? 'active' : ''}`}>
                        <TeamTab
                            teams={teams} loading={teamsLoading}
                            pendingRequests={pendingRequests}
                            selectedTeam={selectedTeam} teamExpenses={teamExpenses} teamMembers={teamMembers}
                            onCreateTeam={createTeam}
                            onJoinByCode={joinByCode}
                            onApproveRequest={approveRequest}
                            onRejectRequest={rejectRequest}
                            onSelectTeam={(id) => fetchTeamDetail(id)}
                            onBack={() => setSelectedTeam(null)}
                            onAddTeamExpense={addTeamExpense}
                            onRemoveMember={removeMember}
                            userId={user?.id}
                        />
                    </div>

                    {/* Profile Tab */}
                    <div className={`dashboard-section ${activeTab === 'profile' ? 'active' : ''}`}>
                        <ProfileTab
                            appData={appData} user={user} balanceScore={balanceScore}
                            currentRank={currentRank} tier={tier} currentBudget={currentBudget}
                            currentSpending={currentSpending} avatarUrl={avatarUrl}
                            expenses={expenses}
                            onEdit={() => openModal('edit')}
                            onLogout={async () => { await signOut(); window.location.href = "/login"; }}
                            ad3={ads.ad3} onAdClick={handleAdClick}
                        />
                    </div>

                    <footer className="app-footer">
                        <p>&copy; 2026 Savify. All rights reserved.</p>
                        <p><i className="fas fa-code"></i> Made with <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Beating%20Heart.png" alt="❤️" className="emoji-3d" style={{ width: 18, height: 18, display: 'inline' }} /> by IIT KGP Students</p>
                        <p style={{ fontSize: '0.65rem', opacity: 0.7, marginTop: 5 }}>* Comments are AI generated</p>
                    </footer>
                </main>
            </div>

            <MobileBottomNav activeTab={activeTab} onTabChange={switchTab} />

            <button className="mobile-fab" onClick={() => openModal('expense')}>
                <i className="fas fa-plus"></i>
                <span>Add Expense</span>
            </button>

            {widgetEnabled && (
                <QuickAddWidget
                    user={user} addExpense={addExpense}
                    currentBudget={currentBudget} currentSpending={currentSpending}
                    fetchScoreAndRank={fetchScoreAndRank} fetchHistory={fetchHistory} fetchExpenses={fetchExpenses}
                />
            )}

            <div className="swipe-dots">
                {['overview', 'analysis', 'focus', 'teams', 'profile'].map((tab) => (
                    <div key={tab} className={`dot ${activeTab === tab ? 'active' : ''}`}></div>
                ))}
            </div>

            {showSwipeHint && <div className="swipe-hint-pill">Swipe <span>↔</span> to navigate</div>}

            {/* Focus Block Screen */}
            {showBlockScreen && (
                <FocusBlockScreen
                    onContinue={() => dismissBlock('continue')}
                    onBlock={() => dismissBlock('block')}
                />
            )}

            {showTutorial && (
                <TutorialOverlay
                    onComplete={() => setShowTutorial(false)}
                    onOpenExpense={() => openModal('expense')}
                    onSwitchTab={switchTab}
                />
            )}

            <ExpenseModal isOpen={modals.expense} onClose={() => closeModal('expense')} onSubmit={handleExpenseSubmit} />
            <ConfirmModal isOpen={modals.confirm} onClose={() => closeModal('confirm')} onConfirm={handleConfirmExpense} expense={pendingExpense} />
            <InviteModal isOpen={modals.invite} onClose={() => closeModal('invite')} user={user} appData={appData} />
            <EditProfileModal isOpen={modals.edit} onClose={() => closeModal('edit')} user={user} appData={appData} />
            <SupportModal isOpen={modals.support} onClose={() => closeModal('support')} onContact={() => { closeModal('support'); openModal('contact'); }} onFeedback={() => { closeModal('support'); openModal('feedback'); }} />
            <ContactModal isOpen={modals.contact} onClose={() => closeModal('contact')} user={user} />
            <FeedbackModal isOpen={modals.feedback} onClose={() => closeModal('feedback')} user={user} />
            <HowItWorksModal isOpen={modals.howItWorks} onClose={() => closeModal('howItWorks')} />
            <TrustLogicModal isOpen={modals.trustLogic} onClose={() => closeModal('trustLogic')} />


            {/* Force Budget Reset Modal for existing users */}
            <ForceBudgetModal
                isOpen={appData && appData.budget_reset_done !== true}
                user={user}
                appData={appData}
                onComplete={(updates) => {
                    setAppData(prev => ({ ...prev, ...updates }));
                    setCurrentBudget(updates.weekly_spending);
                    if (updates.current_score !== undefined) {
                        setBalanceScore(updates.current_score);
                    }
                }}
            />
        </div>
    );
}
