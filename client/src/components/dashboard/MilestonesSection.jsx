import { useState } from 'react';
import MilestoneDetailPopup from '../modals/MilestoneDetailPopup';

const FLUENT_BASE = 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis';

// Custom 3D icons per milestone type based on icon class
const MILESTONE_3D_MAP = {
    'fa-fire': `${FLUENT_BASE}/Travel%20and%20places/Fire.png`,
    'fa-piggy-bank': `${FLUENT_BASE}/Objects/Money%20Bag.png`,
    'fa-gem': `${FLUENT_BASE}/Objects/Gem%20Stone.png`,
    'fa-crown': `${FLUENT_BASE}/Objects/Crown.png`,
    'fa-star': `${FLUENT_BASE}/Travel%20and%20places/Glowing%20Star.png`,
    'fa-trophy': `${FLUENT_BASE}/Activities/Trophy.png`,
    'fa-shield-alt': `${FLUENT_BASE}/Objects/Shield.png`,
    'fa-bolt': `${FLUENT_BASE}/Objects/High%20Voltage.png`,
    'fa-medal': `${FLUENT_BASE}/Activities/1st%20Place%20Medal.png`,
    'fa-chart-line': `${FLUENT_BASE}/Objects/Chart%20Increasing.png`,
    'fa-wallet': `${FLUENT_BASE}/Objects/Purse.png`,
    'fa-coins': `${FLUENT_BASE}/Objects/Coin.png`,
    'fa-receipt': `${FLUENT_BASE}/Objects/Receipt.png`,
    'fa-calendar-check': `${FLUENT_BASE}/Objects/Calendar.png`,
    'fa-rocket': `${FLUENT_BASE}/Travel%20and%20places/Rocket.png`,
};

function get3DIcon(iconClass) {
    if (!iconClass) return `${FLUENT_BASE}/Objects/Gem%20Stone.png`;
    for (const [key, url] of Object.entries(MILESTONE_3D_MAP)) {
        if (iconClass.includes(key)) return url;
    }
    return `${FLUENT_BASE}/Objects/Gem%20Stone.png`;
}

export default function MilestonesSection({ achieved = [], locked = [] }) {
    const [selectedMilestone, setSelectedMilestone] = useState(null);

    // Sort locked by progress descending
    const sortedLocked = [...locked].sort((a, b) => b.progress - a.progress);

    return (
        <div className="milestones-card">
            <div className="milestones-header">
                <h2 className="milestones-title">
                    <img src={`${FLUENT_BASE}/Objects/Gem%20Stone.png`} alt="" style={{ width: 20, height: 20 }} loading="lazy" /> Milestones
                </h2>
                <span className="milestones-count">{achieved.length}/{achieved.length + locked.length}</span>
            </div>

            <div className="milestones-list" style={{ display: 'flex', overflowX: 'auto', gap: '1rem', paddingBottom: '0.5rem', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {/* Achieved milestones — 3D icon */}
                {achieved.map(m => (
                    <div
                        key={m.id}
                        className="milestone-gem achieved"
                        onClick={() => setSelectedMilestone(m)}
                        style={{ minWidth: '48px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        <div className="gem-icon">
                            <img src={get3DIcon(m.icon)} alt={m.title || ''} className="milestone-3d-icon" loading="lazy" />
                        </div>
                    </div>
                ))}

                {/* Locked milestones — greyed 3D icon with progress */}
                {sortedLocked.map(m => (
                    <div
                        key={m.id}
                        className="milestone-gem locked"
                        onClick={() => setSelectedMilestone(m)}
                        style={{ minWidth: '54px', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                    >
                        <div className="gem-icon">
                            <img
                                src={get3DIcon(m.icon)}
                                alt={m.title || ''}
                                className="milestone-3d-icon"
                                loading="lazy"
                                style={{ opacity: 0.3, filter: 'grayscale(1) drop-shadow(0 1px 2px rgba(0,0,0,0.1))' }}
                            />
                            {/* SVG progress ring */}
                            <svg className="milestone-progress-ring" viewBox="0 0 48 48">
                                <circle className="bg" cx="24" cy="24" r="22" />
                                <circle
                                    className="progress"
                                    cx="24" cy="24" r="22"
                                    strokeDasharray={`${2 * Math.PI * 22}`}
                                    strokeDashoffset={`${2 * Math.PI * 22 * (1 - (m.progress || 0) / 100)}`}
                                    transform="rotate(-90 24 24)"
                                />
                            </svg>
                        </div>
                        <div className="gem-progress-badge" style={{ marginTop: '4px' }}>{m.progress}%</div>
                    </div>
                ))}

                {achieved.length === 0 && locked.length === 0 && (
                    <div className="milestones-empty" style={{ color: 'var(--color-stone)', fontSize: '0.8rem', padding: '0.5rem' }}>No milestones yet</div>
                )}
            </div>

            {selectedMilestone && (
                <MilestoneDetailPopup
                    milestone={selectedMilestone}
                    onClose={() => setSelectedMilestone(null)}
                />
            )}
        </div>
    );
}
