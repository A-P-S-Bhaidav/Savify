export default function ProfileTab({
    appData, user, balanceScore, currentRank, tier,
    currentBudget, currentSpending, avatarUrl,
    onEdit, onLogout
}) {
    return (
        <div>
            {/* Profile Header */}
            <div className="profile-header-card">
                <img src={avatarUrl} alt="Profile" className="profile-avatar" />
                <h2 id="profileName">{appData?.full_name || 'User'}</h2>
                <p style={{ color: '#999', fontSize: '0.9rem' }} id="profileEmail">{user?.email || ''}</p>

                <div className="profile-stats">
                    <div className="stat-box">
                        <div className="stat-value" style={{ color: '#10B981' }} id="profileScore">{balanceScore}</div>
                        <div className="stat-label">Balance Score</div>
                    </div>
                    <div className="stat-box">
                        <div className="stat-value" style={{ color: '#D4AF37' }} id="profileRank">
                            {currentRank > 0 ? `#${currentRank}` : '#--'}
                        </div>
                        <div className="stat-label">Campus Rank</div>
                    </div>
                    <div className="stat-box">
                        <div className="stat-value" id="profileTier">{tier} Tier</div>
                        <div className="stat-label">Status Tier</div>
                    </div>
                    <div className="stat-box">
                        <div className="stat-value" id="profileBudget">₹{currentBudget}</div>
                        <div className="stat-label">Weekly Budget</div>
                    </div>
                </div>
            </div>

            {/* Profile Details */}
            <div className="profile-grid">
                <div className="profile-item">
                    <h4><i className="fas fa-university"></i> College</h4>
                    <p id="profileCollege">{appData?.college || 'N/A'}</p>
                </div>
                <div className="profile-item">
                    <h4><i className="fas fa-map-marker-alt"></i> From</h4>
                    <p id="profileNativePlace">{appData?.native_place || 'N/A'}</p>
                </div>
                <div className="profile-item">
                    <h4><i className="fas fa-money-bill-wave"></i> Spent This Week</h4>
                    <p id="profileSpent">₹{currentSpending}</p>
                </div>
                <div className="profile-item">
                    <h4><i className="fas fa-medal"></i> Tier Rating</h4>
                    <p id="tierRating">{tier}</p>
                </div>
            </div>

            {/* Actions */}
            <div className="profile-actions">
                <button
                    className="profile-btn primary"
                    id="editProfileBtn"
                    onClick={onEdit}
                    disabled={appData?.edit_req_status === false}
                >
                    <i className={`fas ${appData?.edit_req_status === false ? 'fa-clock' : 'fa-pen'}`}></i>
                    {appData?.edit_req_status === false ? 'Edit Pending' : 'Edit Profile'}
                </button>
                <button className="profile-btn logout-danger" onClick={onLogout}>
                    <i className="fas fa-sign-out-alt"></i> Logout
                </button>
            </div>
        </div>
    );
}
