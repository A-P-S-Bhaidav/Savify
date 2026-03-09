import { getCategoryIcon } from '../../utils/helpers';

export default function OverviewTab({
    balanceScore, currentRank, currentBudget,
    remaining, budgetPct, streak, aiComment, history, friends,
    friendsLoading, hasMoreFriends, appData,
    onOpenInvite, onOpenEdit, onLoadMoreFriends,
    widgetEnabled, onToggleWidget
}) {
    const isOverBudget = budgetPct > 100;

    return (
        <>
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

            <div className="grid">
                {/* Balance Score Card */}
                <div className="card">
                    <div className="card-icon"><i className="fas fa-chart-line"></i></div>
                    <h3>Balance Score</h3>
                    <div className="value" id="balanceScore">{balanceScore}</div>
                </div>

                {/* Rank Card */}
                <div className="card" id="rankCard">
                    <div className="card-icon"><i className="fas fa-trophy"></i></div>
                    <h3>Campus Rank</h3>
                    <div className="value" id="currentRank">
                        {currentRank > 0 ? `#${currentRank}` : '#--'}
                    </div>
                </div>

                {/* Budget Card */}
                <div className="card">
                    <div className="card-icon"><i className="fas fa-wallet"></i></div>
                    <h3>
                        Weekly Budget
                        <span
                            id="overviewEditBudgetBtn"
                            onClick={() => onOpenEdit && onOpenEdit('weekly_spending')}
                            style={{ float: 'right', cursor: 'pointer', color: appData?.edit_req_status === false ? 'var(--color-stone)' : 'var(--color-emerald)', opacity: appData?.edit_req_status === false ? 0.5 : 1, transition: '0.2s' }}
                        >
                            <i className="fas fa-pen"></i>
                        </span>
                    </h3>
                    <div className="value" id="displayBudget">₹{currentBudget.toLocaleString()}</div>
                    <div className="progress-bar">
                        <div className={`progress-fill ${isOverBudget ? 'over-100' : ''}`} style={{ width: `${Math.min(budgetPct, 100)}%` }}></div>
                    </div>
                    <div className={`budget-remaining ${isOverBudget ? 'over' : ''}`}>
                        <i className={`fas ${isOverBudget ? 'fa-exclamation-triangle' : 'fa-piggy-bank'}`}></i>
                        <span>
                            {isOverBudget
                                ? `Over by ₹${Math.abs(remaining).toLocaleString()}`
                                : `₹${remaining.toLocaleString()} remaining`}
                        </span>
                    </div>
                </div>

                {/* Streak Card */}
                <div className="card">
                    <div className="card-icon"><i className="fas fa-fire"></i></div>
                    <h3>Streak</h3>
                    <div className="value" id="streakValue">{streak} Days</div>
                </div>

                {/* AI Agent Card */}
                <div className="card agent-note-card">
                    <i className="fas fa-robot"></i>
                    <div>
                        <h3 style={{ color: '#047857', textTransform: 'none' }}>Agent Comment</h3>
                        <p id="aiCommentText">"{aiComment || 'Loading...'}"</p>
                    </div>
                </div>

                {/* Friends Card */}
                <div className="card friends-card">
                    <h3>
                        <i className="fas fa-users" style={{ marginRight: 8 }}></i>
                        Campus Mates
                        <span style={{ float: 'right', fontSize: '0.75rem', color: 'var(--color-stone)', fontWeight: 400 }}>
                            {appData?.college || 'IIT KGP'}
                        </span>
                    </h3>
                    <div className="friends-grid" id="friendsList">
                        {/* Add Friend button */}
                        <div className="friend-item" onClick={onOpenInvite}>
                            <button className="add-friend-btn" title="Invite Friend">+</button>
                            <span className="friend-name">Invite</span>
                        </div>

                        {friends.map((friend, idx) => {
                            const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(friend.full_name)}&background=0D9488&color=fff&size=100`;
                            return (
                                <div className="friend-item" key={idx}>
                                    <img src={avatarUrl} alt={friend.full_name} className="friend-avatar" />
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
            </div>

            {/* History Section */}
            <div className="card" style={{ marginTop: '1.5rem' }}>
                <h3><i className="fas fa-history" style={{ marginRight: 8 }}></i> Recent Transactions</h3>
                <div className="history-list" id="historyList">
                    {history.length === 0 ? (
                        <div style={{ padding: '2rem', textAlign: 'center', color: '#999' }}>No transactions.</div>
                    ) : (
                        history.map((exp, idx) => (
                            <div className="history-item" key={idx}>
                                <div className="h-left">
                                    <div className="h-icon"><i className={`fas ${getCategoryIcon(exp.category)}`}></i></div>
                                    <div className="h-info-container">
                                        <div className="h-cat">
                                            {exp.category}
                                            <span className="h-date">
                                                {new Date(exp.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                            </span>
                                        </div>
                                        <div className="h-desc">{exp.description || ''}</div>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div className="h-amount">-₹{exp.amount}</div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </>
    );
}
