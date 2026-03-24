import { useState, useEffect } from 'react';
import { getRank, getNextRank, getRankProgress, getAppOpens, getChosenTopRank, setChosenTopRank, RANKS } from '../../utils/ranks';

export default function RankBadge({ appData, expenses = [] }) {
    const [showPopup, setShowPopup] = useState(false);
    const [showChoice, setShowChoice] = useState(false);

    const appOpens = getAppOpens();
    const expenseCount = expenses.length;
    const chosenTop = getChosenTopRank();
    const rank = getRank(appOpens, expenseCount, chosenTop);
    const progress = getRankProgress(appOpens, expenseCount);
    const firstName = (appData?.full_name?.split(' ')[0] || 'USER').toUpperCase();

    // Check if user just reached alpha level and hasn't chosen yet
    useEffect(() => {
        const alphaRank = RANKS.find(r => r.id === 'alpha');
        if (appOpens >= alphaRank.minOpens && expenseCount >= alphaRank.minExpenses && !chosenTop) {
            setShowChoice(true);
        }
    }, [appOpens, expenseCount, chosenTop]);

    const handleChoice = (choice) => {
        setChosenTopRank(choice);
        setShowChoice(false);
    };

    return (
        <>
            {/* Name + Badge Display */}
            <div className="rank-greeting" onClick={() => setShowPopup(true)}>
                <h1 className="rank-name">{firstName}</h1>
                <div className="rank-badge-row">
                    <img src={rank.image} alt={rank.name} className="rank-badge-icon" />
                    <span className="rank-badge-label">{rank.name}</span>
                </div>
            </div>

            {/* Badge Progress Popup */}
            {showPopup && (
                <div className="modal-overlay open" onClick={() => setShowPopup(false)}>
                    <div className="rank-popup" onClick={e => e.stopPropagation()}>
                        <button className="milestone-popup-close" onClick={() => setShowPopup(false)}>
                            <i className="fas fa-times"></i>
                        </button>

                        <div className="rank-popup-current">
                            <img src={rank.image} alt={rank.name} className="rank-popup-image" />
                            <h2 className="rank-popup-title">{rank.name}</h2>
                            <p className="rank-popup-subtitle">Your current rank</p>
                        </div>

                        <div className="rank-popup-stats">
                            <div className="rank-stat-item">
                                <span className="rank-stat-number">{appOpens}</span>
                                <span className="rank-stat-label">App Opens</span>
                            </div>
                            <div className="rank-stat-divider"></div>
                            <div className="rank-stat-item">
                                <span className="rank-stat-number">{expenseCount}</span>
                                <span className="rank-stat-label">Expenses Added</span>
                            </div>
                        </div>

                        {progress.atTop ? (
                            <div className="rank-popup-top">
                                <div className="rank-top-emoji">🔥👑🔥</div>
                                <h3>You're at the TOP!</h3>
                                <p className="rank-top-msg">
                                    {rank.id === 'sigma' 
                                        ? "You don't follow the hierarchy. You ARE the hierarchy. Main character energy. 🐺" 
                                        : "You've conquered every rank. You're literally the final boss. Bow down peasants. 😤"}
                                </p>
                                <p className="rank-top-god">
                                    Now you need <span className="rank-highlight">∞ aura</span> to reach <span className="rank-highlight">GOD 🔥😂</span>
                                </p>
                                <p className="rank-aura-farm">Aura level: <span className="rank-highlight">IMMEASURABLE</span> ✨</p>
                            </div>
                        ) : (
                            <div className="rank-popup-next">
                                <div className="rank-next-header">
                                    <img src={progress.nextRank.image} alt={progress.nextRank.name} className="rank-next-icon" />
                                    <h3>Next: <span className="rank-highlight">{progress.nextRank.name}</span></h3>
                                </div>
                                <div className="rank-next-requirements">
                                    <div className="rank-req-item">
                                        <i className="fas fa-mobile-alt"></i>
                                        <span>Open app <span className="rank-highlight">{progress.opensNeeded}</span> more times</span>
                                    </div>
                                    <div className="rank-req-item">
                                        <i className="fas fa-receipt"></i>
                                        <span>Add <span className="rank-highlight">{progress.expensesNeeded}</span> more expenses</span>
                                    </div>
                                </div>
                                <p className="rank-motivation">Keep grinding, {firstName}! 💪</p>
                            </div>
                        )}

                        {/* All Ranks Preview */}
                        <div className="rank-all-tiers">
                            <h4>All Ranks</h4>
                            <div className="rank-tier-list">
                                {RANKS.filter(r => r.id !== 'sigma').map(r => {
                                    const isActive = (rank.id === r.id) || (rank.id === 'sigma' && r.id === 'alpha');
                                    return (
                                        <div key={r.id} className={`rank-tier-item ${isActive ? 'active' : ''} ${
                                            (appOpens >= r.minOpens && expenseCount >= r.minExpenses) ? 'unlocked' : 'locked'
                                        }`}>
                                            <img src={r.image} alt={r.name} className="rank-tier-icon" />
                                            <span className="rank-tier-name">{r.name}</span>
                                            <span className="rank-tier-req">{r.minOpens}/{r.minExpenses}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Alpha/Sigma Choice Popup */}
            {showChoice && (
                <div className="modal-overlay open">
                    <div className="rank-choice-popup">
                        <div className="rank-choice-header">
                            <h2>🏆 You've Reached The Top!</h2>
                            <p>Choose your identity, {firstName}</p>
                        </div>

                        <div className="rank-choice-options">
                            <button className="rank-choice-card alpha" onClick={() => handleChoice('alpha')}>
                                <img src="/ranks/alpha.png" alt="Alpha" className="rank-choice-icon" />
                                <h3>ALPHA</h3>
                                <p>Top of the hierarchy. The leader. Everyone follows you. 👑</p>
                            </button>

                            <div className="rank-choice-vs">OR</div>

                            <button className="rank-choice-card sigma" onClick={() => handleChoice('sigma')}>
                                <img src="/ranks/sigma.png" alt="Sigma" className="rank-choice-icon" />
                                <h3>SIGMA</h3>
                                <p>Don't fit in the hierarchy. I'm different. Lone wolf energy. 🐺</p>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
