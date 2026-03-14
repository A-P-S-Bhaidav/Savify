import { getCategoryIcon } from '../../utils/helpers';

export default function OverviewTab({
    balanceScore, currentRank, tier, currentBudget,
    currentSpending, remaining, budgetPct, streak, aiComment, history, friends,
    friendsLoading, hasMoreFriends, appData,
    onAddExpense, onOpenInvite, onOpenEdit, onLoadMoreFriends,
    widgetEnabled, onToggleWidget
}) {
    const isOverBudget = budgetPct > 100;

    return (
        <>
            {/* Savio Note Banner */}
            <div className="savio-note-banner">
                <div className="savio-note-left">
                    <div className="savio-note-icon">
                        <i className="fas fa-landmark"></i>
                    </div>
                    <div className="savio-note-content">
                        <span className="savio-note-label">Savio note</span>
                        <p className="savio-note-text">"{aiComment || 'Loading...'}"</p>
                    </div>
                </div>
                <button className="savio-replay-btn" title="Replay">
                    Replay <i className="fas fa-play-circle"></i>
                </button>
            </div>

            {/* Stats Cards Row */}
            <div className="stats-row">
                {/* Balance Score Card - Dark */}
                <div className="stat-card stat-card-dark">
                    <div className="stat-card-header">
                        <span className="stat-card-label">BALANCE SCORE</span>
                        <div className="stat-card-icon-circle">
                            <i className="fas fa-chart-line"></i>
                        </div>
                    </div>
                    <div className="stat-card-value-large">{balanceScore}</div>
                    <div className="stat-card-footer">
                        <i className="fas fa-sync-alt"></i> Live Sync
                    </div>
                </div>

                {/* Current Tier Card */}
                <div className="stat-card stat-card-white">
                    <div className="stat-card-icon-top">
                        <i className="fas fa-trophy" style={{ color: '#D4AF37' }}></i>
                    </div>
                    <span className="stat-card-label">CURRENT TIER</span>
                    <div className="stat-card-value-large" style={{ color: 'var(--color-obsidian)' }}>{tier || 'Bronze'}</div>
                </div>

                {/* Global Rank Card - Orange border */}
                <div className="stat-card stat-card-rank">
                    <div className="stat-card-icon-top">
                        <i className="fas fa-award" style={{ color: '#D4AF37' }}></i>
                    </div>
                    <span className="stat-card-label">GLOBAL RANK</span>
                    <div className="stat-card-value-large" style={{ color: 'var(--color-obsidian)' }}>
                        {currentRank > 0 ? `#${currentRank}` : '#--'}
                    </div>
                </div>
            </div>

            {/* Campus Mates & Budget Row */}
            <div className="overview-bottom-row">
                {/* Campus Mates Card */}
                <div className="campus-mates-card">
                    <div className="campus-mates-header">
                        <h3>CAMPUS MATES ({appData?.college?.toUpperCase() || 'IIT KHARAGPUR'})</h3>
                        <button className="campus-manage-btn" onClick={onOpenInvite} title="Manage">
                            <i className="fas fa-trash-alt"></i>
                        </button>
                    </div>
                    <div className="friends-grid" id="friendsList">
                        {/* Add Friend button */}
                        <div className="friend-item" onClick={onOpenInvite}>
                            <button className="add-friend-btn" title="Invite Friend">+</button>
                            <span className="friend-name">Invite</span>
                        </div>

                        {friends.map((friend, idx) => {
                            const friendAvatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(friend.full_name)}&background=0D9488&color=fff&size=100`;
                            const initials = friend.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                            return (
                                <div className="friend-item" key={idx}>
                                    <img src={friendAvatarUrl} alt={friend.full_name} className="friend-avatar" />
                                    <span className="friend-name">{friend.full_name.split(' ')[0]}</span>
                                </div>
                            );
                        })}

                        {friendsLoading && (
                            <div className="friend-item">
                                <div className="add-friend-btn" style={{ background: 'transparent', border: '2px solid #eee' }}>
                                    <i className="fas fa-spinner fa-spin" style={{ fontSize: '1rem', color: '#999' }}></i>
                                </div>
                                <span className="friend-name">Loading...</span>
                            </div>
                        )}

                        {hasMoreFriends && !friendsLoading && (
                            <div className="friend-item" onClick={onLoadMoreFriends} style={{ cursor: 'pointer' }}>
                                <div className="add-friend-btn" style={{ background: '#e5e7eb', color: '#333', fontSize: '0.7rem' }}>
                                    <i className="fas fa-chevron-right"></i>
                                </div>
                                <span className="friend-name">More</span>
                            </div>
                        )}

                        {!friendsLoading && friends.length === 0 && (
                            <div style={{ padding: '1rem', color: 'var(--color-stone)', fontSize: '0.85rem' }}>
                                No friends found at your college yet. Be the first to invite!
                            </div>
                        )}
                    </div>
                </div>

                {/* Weekly Budget Card */}
                <div className="weekly-budget-card">
                    <div className="budget-icon-top">
                        <i className="fas fa-wallet"></i>
                    </div>
                    <span className="stat-card-label">WEEKLY BUDGET</span>
                    <div className="budget-value-display">₹{currentBudget.toLocaleString()}</div>
                    <div className="budget-bar-section">
                        <div className="budget-bar-labels">
                            <span>Usage</span>
                            <span>{Math.min(budgetPct, 999).toFixed(1)}%</span>
                        </div>
                        <div className="progress-bar">
                            <div className={`progress-fill ${isOverBudget ? 'over-100' : ''}`} style={{ width: `${Math.min(budgetPct, 100)}%` }}></div>
                        </div>
                    </div>
                    <div className={`budget-status-pill ${isOverBudget ? 'over' : ''}`}>
                        <i className={`fas ${isOverBudget ? 'fa-exclamation-triangle' : 'fa-piggy-bank'}`}></i>
                        <span>
                            {isOverBudget
                                ? `Overspent by ₹${Math.abs(remaining).toLocaleString()}`
                                : `₹${remaining.toLocaleString()} remaining`}
                        </span>
                    </div>
                </div>
            </div>

            {/* Widget Toggle */}
            <div className="widget-toggle-card">
                <div className="widget-toggle-info">
                    <div className="widget-toggle-icon">
                        <i className="fas fa-bolt"></i>
                    </div>
                    <div className="widget-toggle-text">
                        <h4>Quick Add Widget</h4>
                        <p>Floating shortcut to add expenses fast</p>
                    </div>
                </div>
                <label className="widget-toggle-switch">
                    <input
                        type="checkbox"
                        checked={!!widgetEnabled}
                        onChange={(e) => onToggleWidget?.(e.target.checked)}
                    />
                    <span className="widget-toggle-slider"></span>
                </label>
            </div>

            {/* Recent Transactions */}
            <div className="transactions-card">
                <div className="transactions-header">
                    <h2 className="transactions-title">Recent Transactions</h2>
                    <button className="add-expense-btn" onClick={onAddExpense}>
                        <i className="fas fa-plus"></i> Add Expense
                    </button>
                </div>
                <div className="transactions-list" id="historyList">
                    {history.length === 0 ? (
                        <div style={{ padding: '2rem', textAlign: 'center', color: '#999' }}>No transactions yet.</div>
                    ) : (
                        history.map((exp, idx) => (
                            <div className="transaction-item" key={idx}>
                                <div className="transaction-left">
                                    <div className="transaction-icon">
                                        <i className={`fas ${getCategoryIcon(exp.category)}`}></i>
                                    </div>
                                    <div className="transaction-info">
                                        <span className="transaction-category">{exp.category}</span>
                                        <span className="transaction-date">
                                            {new Date(exp.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                        </span>
                                    </div>
                                </div>
                                <div className="transaction-amount">-₹{exp.amount.toLocaleString()}</div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </>
    );
}
