export default function ProfileTab({
    appData, user, balanceScore, currentRank, tier,
    currentBudget, currentSpending, avatarUrl,
    onEdit, onLogout
}) {
    return (
        <div className="profile-container">
            {/* Profile Card */}
            <div className="profile-header-card">
                <div className="profile-avatar-wrapper">
                    <img src={avatarUrl} alt="Profile" className="profile-avatar" />
                </div>
                <h2 id="profileName">{appData?.full_name || 'User'}</h2>
                <p className="profile-email" id="profileEmail">{user?.email || ''}</p>
                <span className="profile-tier-badge">{tier || 'Bronze'} Tier</span>
            </div>

            {/* Verified Student Build Card */}
            <div className="verified-build-card">
                <div className="verified-build-left">
                    <div className="verified-shield">
                        <i className="fas fa-shield-alt"></i>
                    </div>
                    <div className="verified-build-info">
                        <h3>Verified Student Build</h3>
                        <p>Developed by students of <strong>IIT Kharagpur</strong>.</p>
                        <div className="verified-badges">
                            <span className="verified-badge green">
                                <i className="fas fa-check-circle"></i> Malware Free
                            </span>
                            <span className="verified-badge blue">
                                <i className="fas fa-code"></i> Verified Source
                            </span>
                        </div>
                    </div>
                </div>
                <button className="verified-institute-btn" title="Institute Verified">
                    <i className="fas fa-university"></i>
                </button>
            </div>

            {/* Stats Grid */}
            <div className="profile-stats-grid">
                <div className="profile-stat-item">
                    <div className="profile-stat-value" id="profileScore">{balanceScore}</div>
                    <div className="profile-stat-label">BALANCE SCORE</div>
                </div>
                <div className="profile-stat-item">
                    <div className="profile-stat-value" id="profileRank">
                        {currentRank > 0 ? `#${currentRank}` : '#--'}
                    </div>
                    <div className="profile-stat-label">GLOBAL RANK</div>
                </div>
                <div className="profile-stat-item">
                    <div className="profile-stat-value" id="profileBudget">₹{currentBudget.toLocaleString()}</div>
                    <div className="profile-stat-label">WEEKLY BUDGET</div>
                </div>
                <div className="profile-stat-item">
                    <div className="profile-stat-value" id="profileSpent">₹{currentSpending.toLocaleString()}</div>
                    <div className="profile-stat-label">SPENT</div>
                </div>
            </div>

            {/* Info Cards */}
            <div className="profile-info-cards">
                <div className="profile-info-item">
                    <h4><i className="fas fa-university"></i> College</h4>
                    <p id="profileCollege">{appData?.college || 'N/A'}</p>
                </div>
                <div className="profile-info-item">
                    <h4><i className="fas fa-map-marker-alt"></i> Native Place</h4>
                    <p id="profileNativePlace">{appData?.native_place || 'N/A'}</p>
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
                    <i className="fas fa-sign-out-alt"></i> Sign Out
                </button>
            </div>
        </div>
    );
}
