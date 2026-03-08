import '../styles/landing.css';

export default function LandingPage() {
    return (
        <div className="landing-body">
            <nav className="landing-navbar">
                <div className="landing-container">
                    <div className="landing-nav-inner">
                        <a href="/" className="landing-logo">
                            <img src="https://i.ibb.co/v441FQJ1/gemini-2-5-flash-image-Refine-this-Savify-S-logo-to-be-flatter-more-geometric-and-ultra-premium.png" alt="Savify" style={{ height: 32 }} />
                            Savify
                        </a>
                        <div className="landing-nav-links">
                            <a href="/features">Features</a>
                            <a href="/pricing">Pricing</a>
                            <a href="/about">About</a>
                            <a href="/login" className="landing-cta-btn">Get Started</a>
                        </div>
                    </div>
                </div>
            </nav>

            <section className="hero-section">
                <div className="landing-container hero-content">
                    <div className="hero-badge">🎓 Built for IIT KGP Students</div>
                    <h1 className="hero-title">Master Your <span className="gradient-text">Financial Balance</span></h1>
                    <p className="hero-subtitle">Track spending, compete with peers, and build discipline. Your Balance Score tells the real story.</p>
                    <div className="hero-actions">
                        <a href="/login" className="hero-primary-btn">Start Free <i className="fas fa-arrow-right"></i></a>
                        <a href="/features" className="hero-secondary-btn">How It Works</a>
                    </div>
                    <div className="hero-stats">
                        <div className="hero-stat"><span className="hero-stat-value">500+</span><span className="hero-stat-label">Active Users</span></div>
                        <div className="hero-stat"><span className="hero-stat-value">₹2M+</span><span className="hero-stat-label">Tracked</span></div>
                        <div className="hero-stat"><span className="hero-stat-value">4.8★</span><span className="hero-stat-label">User Rating</span></div>
                    </div>
                </div>
            </section>

            <section className="features-section">
                <div className="landing-container">
                    <h2 className="section-title">Why Students Love <span className="gradient-text">Savify</span></h2>
                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-card-icon"><i className="fas fa-chart-line"></i></div>
                            <h3>Balance Score</h3>
                            <p>A 0-1000 metric measuring your financial discipline in real-time.</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-card-icon"><i className="fas fa-trophy"></i></div>
                            <h3>Campus Leaderboard</h3>
                            <p>See how you rank against other students. Competition breeds discipline.</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-card-icon"><i className="fas fa-robot"></i></div>
                            <h3>AI Agent</h3>
                            <p>Get spicy, personalized commentary on every expense you make.</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-card-icon"><i className="fas fa-fire"></i></div>
                            <h3>Hall Bloodbath</h3>
                            <p>Inter-hall competition. Represent your hall. Dominate the leaderboard.</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-card-icon"><i className="fas fa-chart-pie"></i></div>
                            <h3>Smart Analytics</h3>
                            <p>Visual breakdowns of where your money goes, with 7-day trends.</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-card-icon"><i className="fas fa-shield-alt"></i></div>
                            <h3>Privacy First</h3>
                            <p>Only YOU see your finances. We never share or sell your data.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="cta-section">
                <div className="landing-container" style={{ textAlign: 'center' }}>
                    <h2 style={{ fontFamily: 'var(--font-secondary)', fontSize: '2.5rem', marginBottom: '1rem', color: 'white' }}>
                        Ready to Take Control?
                    </h2>
                    <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '2rem', maxWidth: 500, margin: '0 auto 2rem' }}>
                        Join hundreds of IIT KGP students already mastering their finances.
                    </p>
                    <a href="/login" className="hero-primary-btn" style={{ display: 'inline-flex' }}>
                        Get Started Free <i className="fas fa-arrow-right" style={{ marginLeft: 8 }}></i>
                    </a>
                </div>
            </section>

            <footer className="landing-footer">
                <div className="landing-container">
                    <div className="footer-grid">
                        <div className="footer-col">
                            <h4>Product</h4>
                            <a href="/features">Features</a>
                            <a href="/pricing">Pricing</a>
                            <a href="/balance-score">Balance Score</a>
                        </div>
                        <div className="footer-col">
                            <h4>Company</h4>
                            <a href="/about">About</a>
                            <a href="/contact">Contact</a>
                        </div>
                        <div className="footer-col">
                            <h4>Legal</h4>
                            <a href="/privacy-policy">Privacy</a>
                            <a href="/terms-and-conditions">Terms</a>
                            <a href="/refund-policy">Refund</a>
                        </div>
                    </div>
                    <p style={{ textAlign: 'center', marginTop: '3rem', color: '#718096', fontSize: '0.9rem' }}>
                        © 2026 Savify Inc. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}
