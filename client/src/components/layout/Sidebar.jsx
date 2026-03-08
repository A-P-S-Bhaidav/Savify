export default function Sidebar({ appData, activeTab, onTabChange, avatarUrl }) {
    return (
        <aside className="sidebar">
            <div className="logo">
                <img src="https://i.ibb.co/v441FQJ1/gemini-2-5-flash-image-Refine-this-Savify-S-logo-to-be-flatter-more-geometric-and-ultra-premium.png" alt="Savify" className="logo-img" />
                Savify
            </div>

            <div className="kgp-badge">
                <i className="fas fa-university kgp-icon"></i>
                <div>
                    <div style={{ fontWeight: 700, marginBottom: 2, color: '#D4AF37' }}>IIT KHARAGPUR</div>
                    <div style={{ fontSize: '0.65rem', opacity: 0.7 }}>Exclusive Campus Access</div>
                </div>
            </div>

            <nav>
                <a className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => onTabChange('overview')}>
                    <i className="fas fa-th-large"></i> Overview
                </a>
                <a className={`nav-link ${activeTab === 'analysis' ? 'active' : ''}`} onClick={() => onTabChange('analysis')}>
                    <i className="fas fa-chart-pie"></i> Analysis
                </a>
                <a className={`nav-link ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => onTabChange('profile')}>
                    <i className="fas fa-user"></i> Profile
                </a>
            </nav>

            <div className="user-profile">
                <img src={avatarUrl} alt="" className="avatar" />
                <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }} id="sidebarName">{appData?.full_name || 'User'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-stone)' }}>Member</div>
                </div>
            </div>
        </aside>
    );
}
