import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import '../styles/savify-home.css';

export default function LandingPage() {
    useEffect(() => {
        // Handle mobile menu
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const mobileNav = document.getElementById('mobileNav');

        const toggleMenu = () => mobileNav?.classList.toggle('active');
        if (mobileMenuBtn) {
            mobileMenuBtn.addEventListener('click', toggleMenu);
        }

        const navLinks = document.querySelectorAll('.mobile-nav .nav-link');
        const closeMenu = () => mobileNav?.classList.remove('active');
        navLinks.forEach(link => link.addEventListener('click', closeMenu));

        // Handle fade-in animations - robustly for React StrictMode
        const fadeElements = document.querySelectorAll('.fade-in');
        let observer = null;

        if (fadeElements.length > 0) {
            const observerOptions = {
                root: null,
                rootMargin: '0px',
                threshold: 0.05
            };

            observer = new IntersectionObserver((entries, obs) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        obs.unobserve(entry.target);
                    }
                });
            }, observerOptions);

            fadeElements.forEach(element => {
                observer.observe(element);
            });
        }

        return () => {
            if (mobileMenuBtn) {
                mobileMenuBtn.removeEventListener('click', toggleMenu);
            }
            navLinks.forEach(link => link.removeEventListener('click', closeMenu));
            if (observer) {
                observer.disconnect();
            }
        };
    }, []);

    return (
        <>

            <header className="header" id="header">
                <div className="container">
                    <div className="header-content">
                        <Link to="/" className="logo">
                            <img src="https://i.ibb.co/fVyqMkfj/gemini-2-5-flash-image-Refine-this-Savify-S-logo-to-be-flatter-more-geometric-and-ultra-premium.png"
                                alt="Savify Logo" className="logo-img" />
                            Savify
                        </Link>
                        <nav className="nav">
                            <div className="nav-links">
                                <a href="#insight" className="nav-link">Concept</a>
                                <a href="#howitworks" className="nav-link">Process</a>
                                <a href="#balance" className="nav-link">Score</a>
                                <a href="#competition" className="nav-link">Competition</a>
                                <a href="#status" className="nav-link">Levels</a>
                            </div>
                            <div className="auth-buttons">
                                <Link to="/login" className="btn btn-auth btn-login">Log in</Link>
                                <Link to="/login" className="btn btn-auth btn-signup">Get Started</Link>
                            </div>
                        </nav>
                        <button className="mobile-menu-btn" id="mobileMenuBtn" aria-label="Toggle menu">
                            <i className="fas fa-bars"></i>
                        </button>
                    </div>
                </div>
            </header>

            <div className="mobile-nav" id="mobileNav">
                <div className="nav-links">
                    <a href="#insight" className="nav-link">Concept</a>
                    <a href="#howitworks" className="nav-link">Process</a>
                    <a href="#balance" className="nav-link">Score</a>
                    <a href="#competition" className="nav-link">Competition</a>
                    <a href="#status" className="nav-link">Levels</a>
                </div>
                <div className="auth-buttons">
                    <Link to="/login" className="btn btn-auth btn-login">Log in</Link>
                    <Link to="/login" className="btn btn-auth btn-signup">Get Started</Link>
                </div>
            </div>

            <section className="hero section">
                <div className="hero-background">
                    <div className="floating-orb orb-1"></div>
                    <div className="floating-orb orb-2"></div>
                    <div className="floating-orb orb-3"></div>
                </div>
                <div className="container">
                    <div className="hero-content">
                        <h1 className="hero-headline">Allocation Over Amount</h1>
                        <p className="hero-subheadline">
                            Savify evaluates how you allocate money—not how much you spend. Your financial health isn't about
                            saving more. It's about spending right.
                        </p>
                        <div className="hero-cta">
                            <Link to="/login" className="btn btn-primary">
                                <i className="fas fa-chart-line" style={{ marginRight: '10px' }}></i>
                                Check Your Balance Score
                            </Link>
                            <p className="body-text">
                                Takes 2 minutes • Completely private • Free forever
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section id="insight" className="section section-light">
                <div className="container">
                    <div className="section-title fade-in">A Different Perspective</div>
                    <h2 className="section-headline fade-in delay-1">Intelligent Allocation</h2>
                    <p className="large-text fade-in delay-2" style={{ margin: '0 auto var(--space-xl)' }}>
                        Two people can earn the same amount, yet have completely different financial health. The key lies in how
                        you allocate, not how much you spend.
                    </p>

                    <div className="allocation-visualization fade-in delay-3">
                        <div className="visualization-container" id="allocationViz">

                            <div className="simple-allocation-grid">
                                <div className="simple-alloc-card alloc-green">
                                    <div className="simple-alloc-percent">50%</div>
                                    <div className="simple-alloc-label">Necessities</div>
                                </div>
                                <div className="simple-alloc-card alloc-gold">
                                    <div className="simple-alloc-percent">30%</div>
                                    <div className="simple-alloc-label">Development</div>
                                </div>
                                <div className="simple-alloc-card alloc-purple">
                                    <div className="simple-alloc-percent">20%</div>
                                    <div className="simple-alloc-label">Enjoyment</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="insight-statements" style={{ marginTop: 'var(--space-xl)', textAlign: 'center' }}>
                        <p className="statement large-text fade-in delay-4"
                            style={{ color: 'var(--color-emerald)', marginBottom: 'var(--space-sm)' }}>
                            <i className="fas fa-check-circle" style={{ marginRight: '10px' }}></i>
                            Same income, smarter allocation
                        </p>
                        <p className="statement large-text fade-in delay-5" style={{ color: 'var(--color-gold)' }}>
                            <i className="fas fa-check-circle" style={{ marginRight: '10px' }}></i>
                            Better balance, better life
                        </p>
                    </div>
                </div>
            </section>

            <section id="howitworks" className="timeline-section">
                <div className="container">
                    <div className="section-title fade-in">Simple Weekly Rhythm</div>
                    <h2 className="section-headline fade-in delay-1">How it Works – 3 Easy Steps</h2>

                    <div className="timeline-container">
                        <div className="timeline-item fade-in delay-2">
                            <div className="timeline-content">
                                <div className="floating-badge">
                                    <div className="floating-icon"><i className="fas fa-user-plus"></i></div>
                                    <span>Quick Profile</span>
                                </div>
                                <h3 className="tier-title">Log in & Complete Your Profile</h3>
                                <p className="body-text">
                                    Sign up on Savify and fill out a simple form about your financial habits to get started.
                                </p>
                            </div>
                            <div className="timeline-marker">01</div>
                            <div className="timeline-image-container">
                                <div className="mockup-phone">
                                    <div className="mockup-screen">
                                        <div className="ui-header"></div>
                                        <div className="ui-circle">
                                            <i className="fas fa-user"></i>
                                        </div>
                                        <div className="ui-bar" style={{ width: '60%' }}></div>
                                        <div className="ui-bar" style={{ width: '80%' }}></div>
                                        <div className="ui-bar" style={{ width: '40%' }}></div>
                                        <a href="#" className="btn btn-primary btn-auth"
                                            style={{ marginTop: '20px', fontSize: '0.7rem' }}>Submit Profile</a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="timeline-item fade-in delay-3">
                            <div className="timeline-content">
                                <div className="floating-badge">
                                    <div className="floating-icon"><i className="fas fa-receipt"></i></div>
                                    <span>Track Spend</span>
                                </div>
                                <h3 className="tier-title">Add Expenses for 7 Days</h3>
                                <p className="body-text">
                                    Start adding your daily expenses. Savify's AI observes your spending behavior for the first
                                    7 days to understand your money pattern.
                                </p>
                            </div>
                            <div className="timeline-marker">02</div>
                            <div className="timeline-image-container">
                                <div className="mockup-phone">
                                    <div className="mockup-screen">
                                        <div className="ui-header"></div>
                                        <div style={{ width: '100%', padding: '0 15px' }}>
                                            <h4 style={{ color: 'white', marginBottom: '10px', fontSize: '0.9rem' }}>Today's Spend</h4>
                                            <div className="ui-row">
                                                <span><i className="fas fa-coffee"
                                                    style={{ color: 'var(--color-emerald)', marginRight: '5px' }}></i> Coffee</span>
                                                <span>$5.00</span>
                                            </div>
                                            <div className="ui-row">
                                                <span><i className="fas fa-book"
                                                    style={{ color: 'var(--color-gold)', marginRight: '5px' }}></i> Books</span>
                                                <span>$25.00</span>
                                            </div>
                                            <div className="ui-row">
                                                <span><i className="fas fa-utensils" style={{ color: '#8B5CF6', marginRight: '5px' }}></i>
                                                    Lunch</span>
                                                <span>$12.50</span>
                                            </div>
                                        </div>
                                        <div
                                            style={{ position: 'absolute', bottom: '20px', width: '50px', height: '50px', background: 'var(--gradient-emerald)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 5px 15px rgba(16,185,129,0.3)' }}>
                                            <i className="fas fa-plus"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="timeline-item fade-in delay-4">
                            <div className="timeline-content">
                                <div className="floating-badge">
                                    <div className="floating-icon"><i className="fas fa-trophy"></i></div>
                                    <span>Win Rewards</span>
                                </div>
                                <h3 className="tier-title">Get Ranked, Feedback & Rewards</h3>
                                <p className="body-text">
                                    You receive a financial rank based on your habits. The rank keeps updating with regular
                                    feedback—and you can win exciting rewards by improving your score. 🚀
                                </p>
                            </div>
                            <div className="timeline-marker">03</div>
                            <div className="timeline-image-container">
                                <div className="mockup-phone">
                                    <div className="mockup-screen">
                                        <div className="ui-header"></div>
                                        <div style={{ textAlign: 'center', color: 'white' }}>
                                            <div style={{ fontSize: '3rem', marginBottom: '10px' }}>
                                                <i className="fas fa-gift"
                                                    style={{ color: 'var(--color-gold)', filter: 'drop-shadow(0 0 10px rgba(255,215,0,0.5))' }}></i>
                                            </div>
                                            <h3 style={{ fontSize: '1.2rem', marginBottom: '5px' }}>You Won!</h3>
                                            <p style={{ fontSize: '0.8rem', opacity: '0.8', marginBottom: '20px' }}>Gold Rank Achieved
                                            </p>
                                            <div
                                                style={{ background: 'rgba(255,255,255,0.1)', padding: '10px 20px', borderRadius: '20px', display: 'inline-block' }}>
                                                <i className="fas fa-star" style={{ color: 'var(--color-gold)' }}></i> +500 Pts
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            <section id="balance" className="section section-light">
                <div className="container">
                    <div className="balance-score-container">
                        <div className="score-display fade-in">
                            <div className="score-circle">
                                <div className="circle-bg">
                                    <div className="score-needle"></div>
                                </div>
                                <div className="circle-inner">
                                    <div>
                                        <div className="score-value" id="scoreValue">0</div>
                                        <div className="score-label">Balance Score (out of 1000)</div>
                                        <div className="score-progress">
                                            <div className="score-progress-bar" id="scoreProgress" style={{ width: '0%' }}></div>
                                        </div>
                                        <div className="score-labels">
                                            <span>0</span>
                                            <span>1000</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="fade-in delay-1">
                            <div className="section-title">A Fair Measure</div>
                            <h2 className="section-headline">Your Intelligent Score</h2>
                            <p className="large-text">
                                A dynamic score between 0–1000 that evolves with your spending habits.
                                It measures how well you balance necessities, growth, and enjoyment—regardless of income level.
                            </p>
                            <div style={{ marginTop: 'var(--space-lg)' }}>
                                <div
                                    style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
                                    <div
                                        style={{ width: '20px', height: '20px', background: 'var(--gradient-emerald)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <i className="fas fa-check" style={{ color: 'white', fontSize: '10px' }}></i>
                                    </div>
                                    <span className="body-text">Score calculated out of 1000 for precise measurement</span>
                                </div>
                                <div
                                    style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
                                    <div
                                        style={{ width: '20px', height: '20px', background: 'var(--gradient-emerald)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <i className="fas fa-check" style={{ color: 'white', fontSize: '10px' }}></i>
                                    </div>
                                    <span className="body-text">Four achievement tiers: Bronze, Silver, Gold, Platinum</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                                    <div
                                        style={{ width: '20px', height: '20px', background: 'var(--gradient-emerald)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <i className="fas fa-check" style={{ color: 'white', fontSize: '10px' }}></i>
                                    </div>
                                    <span className="body-text">Weekly updates to track your progress across tiers</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section id="competition" className="section">
                <div className="container">
                    <div className="section-title fade-in">Healthy Rivalry</div>
                    <h2 className="section-headline fade-in delay-1">Compete Without Comparison</h2>
                    <p className="large-text fade-in delay-2" style={{ margin: '0 auto var(--space-xl)' }}>
                        Your score finds meaning in community. Compete fairly, improve collectively.
                    </p>

                    <div className="competition-grid">
                        <div className="competition-card fade-in">
                            <div className="competition-icon">
                                <i className="fas fa-user"></i>
                            </div>
                            <h3 className="tier-title">Individual</h3>
                            <p className="body-text">Track your personal progress and weekly improvements in allocation balance.
                                Master your own financial journey.</p>
                        </div>
                        <div className="competition-card fade-in delay-1">
                            <div className="competition-icon">
                                <i className="fas fa-building"></i>
                            </div>
                            <h3 className="tier-title">Hostel vs Hostel</h3>
                            <p className="body-text">Friendly competition between floors and hostels. Bragging rights for the most
                                balanced community. Build financial camaraderie.</p>
                        </div>
                        <div className="competition-card fade-in delay-2">
                            <div className="competition-icon">
                                <i className="fas fa-university"></i>
                            </div>
                            <h3 className="tier-title">College vs College</h3>
                            <p className="body-text">Campus-wide competition. See which institution fosters the most financially
                                intelligent students. Elevate your college's reputation.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section id="status" className="section section-light">
                <div className="container">
                    <div className="section-title fade-in">Recognition, Not Rewards</div>
                    <h2 className="section-headline fade-in delay-1">Achieve Higher Tiers</h2>
                    <p className="large-text fade-in delay-2" style={{ margin: '0 auto var(--space-xl)' }}>
                        As your Balance Score improves, unlock deeper insights and recognition that matter.
                    </p>

                    <div className="tiers-container">
                        <div className="tier-card fade-in">
                            <div className="tier-badge">
                                <i className="fas fa-award"></i>
                            </div>
                            <div className="tier-range tier-bronze-text">0 - 299</div>
                            <h3 className="tier-title">Bronze</h3>
                            <p className="tier-description">Foundational allocation habits</p>
                            <ul className="tier-features">
                                <li>
                                    <i className="fas fa-check"
                                        style={{ color: 'var(--color-bronze)', marginRight: 'var(--space-sm)' }}></i>
                                    Basic insights & trends
                                </li>
                                <li>
                                    <i className="fas fa-check"
                                        style={{ color: 'var(--color-bronze)', marginRight: 'var(--space-sm)' }}></i>
                                    Progress tracking
                                </li>
                                <li>
                                    <i className="fas fa-check"
                                        style={{ color: 'var(--color-bronze)', marginRight: 'var(--space-sm)' }}></i>
                                    Bronze profile badge
                                </li>
                            </ul>
                        </div>
                        <div className="tier-card fade-in delay-1">
                            <div className="tier-badge">
                                <i className="fas fa-medal"></i>
                            </div>
                            <div className="tier-range tier-silver-text">300 - 599</div>
                            <h3 className="tier-title">Silver</h3>
                            <p className="tier-description">Developing balance mastery</p>
                            <ul className="tier-features">
                                <li>
                                    <i className="fas fa-star"
                                        style={{ color: 'var(--color-silver)', marginRight: 'var(--space-sm)' }}></i>
                                    Advanced analytics
                                </li>
                                <li>
                                    <i className="fas fa-star"
                                        style={{ color: 'var(--color-silver)', marginRight: 'var(--space-sm)' }}></i>
                                    College rankings access
                                </li>
                                <li>
                                    <i className="fas fa-star"
                                        style={{ color: 'var(--color-silver)', marginRight: 'var(--space-sm)' }}></i>
                                    Silver profile badge
                                </li>
                            </ul>
                        </div>
                        <div className="tier-card fade-in delay-2">
                            <div className="tier-badge">
                                <i className="fas fa-crown"></i>
                            </div>
                            <div className="tier-range tier-gold-text">600 - 899</div>
                            <h3 className="tier-title">Gold</h3>
                            <p className="tier-description">Exceptional spending intelligence</p>
                            <ul className="tier-features">
                                <li>
                                    <i className="fas fa-crown"
                                        style={{ color: 'var(--color-gold)', marginRight: 'var(--space-sm)' }}></i>
                                    Predictive insights & AI guidance
                                </li>
                                <li>
                                    <i className="fas fa-crown"
                                        style={{ color: 'var(--color-gold)', marginRight: 'var(--space-sm)' }}></i>
                                    Featured recognition
                                </li>
                                <li>
                                    <i className="fas fa-crown"
                                        style={{ color: 'var(--color-gold)', marginRight: 'var(--space-sm)' }}></i>
                                    Gold profile badge
                                </li>
                            </ul>
                        </div>
                        <div className="tier-card fade-in delay-3">
                            <div className="tier-badge">
                                <i className="fas fa-gem"></i>
                            </div>
                            <div className="tier-range tier-platinum-text">900+</div>
                            <h3 className="tier-title">Platinum</h3>
                            <p className="tier-description">Master-level financial intelligence</p>
                            <ul className="tier-features">
                                <li>
                                    <i className="fas fa-gem"
                                        style={{ color: 'var(--color-platinum-dark)', marginRight: 'var(--space-sm)' }}></i>
                                    Elite insights & personal coach
                                </li>
                                <li>
                                    <i className="fas fa-gem"
                                        style={{ color: 'var(--color-platinum-dark)', marginRight: 'var(--space-sm)' }}></i>
                                    Exclusive interviews & features
                                </li>
                                <li>
                                    <i className="fas fa-gem"
                                        style={{ color: 'var(--color-platinum-dark)', marginRight: 'var(--space-sm)' }}></i>
                                    Platinum master badge
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            <section className="section section-dark philosophy">
                <div className="philosophy-bg"></div>
                <div className="container">
                    <div className="philosophy-content">
                        <div className="section-title section-title-light fade-in">Our Philosophy</div>
                        <div className="quote philosophy-quote fade-in delay-1">
                            "Savify doesn't tell you to spend less.<br />It helps you spend with intent."
                        </div>
                        <p className="large-text large-text-light fade-in delay-2"
                            style={{ marginTop: 'var(--space-lg)', marginLeft: 'auto', marginRight: 'auto' }}>
                            Financial intelligence isn't about restriction—it's about making every rupee count toward a balanced
                            life. We believe in empowering you with insights, not imposing limits.
                        </p>
                    </div>
                </div>
            </section>

            <section className="footer-cta">
                <div className="cta-glow"></div>
                <div className="container">
                    <h2 className="section-headline fade-in">Ready to See Your Balance?</h2>
                    <p className="large-text fade-in delay-1" style={{ margin: 'var(--space-xl) auto' }}>
                        Join thousands of students who are redefining financial intelligence.
                        Discover your Balance Score in minutes—no strings attached.
                    </p>
                    <div className="cta-buttons">
                        <Link to="/login" className="btn btn-primary fade-in delay-2">
                            <i className="fas fa-chart-line" style={{ marginRight: '12px' }}></i>
                            Get Your Free Score
                        </Link>
                    </div>
                    <p className="body-text fade-in delay-3" style={{ marginTop: 'var(--space-lg)' }}>
                        No credit card required • 100% private • Takes 2 minutes • Free forever
                    </p>
                </div>
            </section>

            <footer className="footer">
                <div className="container">
                    <div className="footer-content">
                        <div className="footer-column">
                            <Link to="/" className="logo"
                                style={{ color: 'var(--color-ivory)', marginBottom: 'var(--space-lg)', display: 'flex', alignItems: 'center' }}>
                                <img src="https://i.ibb.co/fVyqMkfj/gemini-2-5-flash-image-Refine-this-Savify-S-logo-to-be-flatter-more-geometric-and-ultra-premium.png"
                                    alt="Savify Logo" className="logo-img" style={{ height: '30px', width: 'auto' }} />
                                Savify
                            </Link>
                            <p style={{ color: 'var(--color-stone-light)', fontSize: '0.9375rem' }}>
                                Intelligent allocation for balanced living. Redefining financial wellness for the modern
                                student.
                            </p>
                            <div className="social-links">
                                <a href="https://www.linkedin.com/company/savifyhq/?viewAsMember=true" className="social-link" target="_blank">
                                    <i className="fab fa-linkedin-in"></i>
                                </a>
                                <a href="https://www.instagram.com/savifyhq" className="social-link" target="_blank">
                                    <i className="fab fa-instagram"></i>
                                </a>
                            </div>
                        </div>
                        <div className="footer-column">
                            <div className="footer-column-title">Company</div>
                            <div className="footer-links">
                                <Link to="/about" className="footer-link">About Us</Link>
                            </div>
                        </div>
                        <div className="footer-column">
                            <div className="footer-column-title">Legal</div>
                            <div className="footer-links">
                                <Link to="/terms-and-conditions" className="footer-link">Terms and Conditions</Link>
                                <Link to="/privacy-policy" className="footer-link">Privacy Policy</Link>
                                <Link to="/refund-policy" className="footer-link">Refund Policy</Link>
                                <Link to="/extra-policy" className="footer-link">Extra policies</Link>
                                <Link to="/contact" className="footer-link">Contact</Link>
                            </div>
                        </div>
                    </div>
                    <div className="footer-bottom">
                        <p>© 2026 Savify. All rights reserved.</p>
                        <p style={{ marginTop: 'var(--space-xs)', fontSize: '0.75rem', color: 'var(--color-stone)' }}>
                            Savify evaluates financial discipline and consistency using behavioral analytics. It does not verify
                            individual real-world purchases or provide financial advice.
                        </p>
                    </div>
                </div>
            </footer>



        </>
    );
}
