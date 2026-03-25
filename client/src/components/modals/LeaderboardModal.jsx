import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '../../config/supabase';

export default function LeaderboardModal({ isOpen, onClose, currentUserName }) {
    const [loading, setLoading] = useState(true);
    const [leaderboard, setLeaderboard] = useState([]);

    useEffect(() => {
        if (!isOpen) return;
        const fetchLeaderboard = async () => {
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('leaderboard_view')
                    .select('full_name, rank_number')
                    .order('rank_number', { ascending: true });

                if (!error && data) {
                    setLeaderboard(data);
                }
            } catch (e) {
                console.error('Leaderboard fetch error:', e);
            } finally {
                setLoading(false);
            }
        };
        fetchLeaderboard();
    }, [isOpen]);

    if (!isOpen) return null;

    return createPortal(
        <div className="leaderboard-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="leaderboard-popup">
                <button className="leaderboard-close" onClick={onClose}>&times;</button>
                <div className="leaderboard-header">
                    <div className="leaderboard-trophy">
                        <i className="fas fa-trophy"></i>
                    </div>
                    <h2 className="leaderboard-title">Global Leaderboard</h2>
                </div>
                {loading ? (
                    <div className="leaderboard-loading">
                        <i className="fas fa-spinner fa-spin"></i>
                        <span>Loading leaderboard...</span>
                    </div>
                ) : leaderboard.length === 0 ? (
                    <div className="leaderboard-empty">No rankings available yet.</div>
                ) : (
                    <div className="leaderboard-list">
                        {leaderboard.map((entry, idx) => {
                            const isCurrentUser = currentUserName && entry.full_name === currentUserName;
                            const isTop3 = entry.rank_number <= 3;
                            return (
                                <div
                                    className={`leaderboard-row ${isCurrentUser ? 'leaderboard-row-self' : ''} ${isTop3 ? 'leaderboard-row-top' : ''}`}
                                    key={idx}
                                >
                                    <span className={`leaderboard-rank ${isTop3 ? `rank-${entry.rank_number}` : ''}`}>
                                        {isTop3 ? (
                                            <i className={`fas fa-medal rank-medal-${entry.rank_number}`}></i>
                                        ) : (
                                            `#${entry.rank_number}`
                                        )}
                                    </span>
                                    <span className="leaderboard-name">
                                        {entry.full_name}
                                        {isCurrentUser && <span className="leaderboard-you-badge">You</span>}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
}
