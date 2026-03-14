export default function Sidebar({ appData, activeTab, onTabChange, onOpenSupport, avatarUrl }) {
    return (
        <aside className="sidebar">
            <div className="logo">
                <img src="https://i.ibb.co/v441FQJ1/gemini-2-5-flash-image-Refine-this-Savify-S-logo-to-be-flatter-more-geometric-and-ultra-premium.png" alt="Savify" className="logo-img" />
                Savify
            </div>

            <nav>
                <a className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => onTabChange('overview')}>
                    <i className="fas fa-home"></i> Overview
                </a>
                <a className={`nav-link ${activeTab === 'analysis' ? 'active' : ''}`} onClick={() => onTabChange('analysis')}>
                    <i className="fas fa-chart-pie"></i> Analysis
                </a>
                <a className={`nav-link ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => onTabChange('profile')}>
                    <i className="fas fa-user"></i> Profile
                </a>
                <a className="nav-link" onClick={onOpenSupport}>
                    <i className="fas fa-headset"></i> Support
                </a>
            </nav>

            <div className="kgp-badge">
                <i className="fas fa-university kgp-icon"></i>
                <div>
                    <div style={{ fontWeight: 700, marginBottom: 2, color: '#fff', fontSize: '0.8rem' }}>Built at</div>
                    <div style={{ fontSize: '0.75rem', color: '#fff', fontWeight: 600 }}>IIT Kharagpur</div>
                </div>
            </div>

            <div className="user-profile">
                <img src={avatarUrl} alt="" className="avatar" />
                <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }} id="sidebarName">{appData?.full_name || 'User'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-stone)' }}>...</div>
                </div>
            </div>
        </aside>
    );
}
