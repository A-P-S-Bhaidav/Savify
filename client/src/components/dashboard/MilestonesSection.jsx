import { useState } from 'react';
import MilestoneDetailPopup from '../modals/MilestoneDetailPopup';
import True3DBadge from './True3DBadge';

const FLUENT_BASE = 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis';

// Exact mapping of all 25 specific milestones defined in useAchievements.js
const MILESTONE_3D_MAP = {
    // Balance Score
    'fa-star': `${FLUENT_BASE}/Travel%20and%20places/Glowing%20Star.png`,
    'fa-gem': `${FLUENT_BASE}/Objects/Gem%20Stone.png`,
    'fa-meteor': `${FLUENT_BASE}/Travel%20and%20places/Comet.png`,
    'fa-fire': `${FLUENT_BASE}/Travel%20and%20places/Fire.png`,
    'fa-crown': `${FLUENT_BASE}/Objects/Crown.png`,
    // Amount Managed
    'fa-coins': `${FLUENT_BASE}/Objects/Coin.png`,
    'fa-money-bill-wave': `${FLUENT_BASE}/Objects/Banknote%20with%20Dollar%20Sign.png`,
    'fa-money-check-alt': `${FLUENT_BASE}/Objects/Credit%20Card.png`,
    'fa-building': `${FLUENT_BASE}/Travel%20and%20places/Office%20Building.png`,
    'fa-landmark': `${FLUENT_BASE}/Travel%20and%20places/Classical%20Building.png`,
    // Times Added
    'fa-seedling': `${FLUENT_BASE}/Animals%20and%20Nature/Seedling.png`,
    'fa-chart-bar': `${FLUENT_BASE}/Objects/Bar%20Chart.png`,
    'fa-bullseye': `${FLUENT_BASE}/Activities/Direct%20Hit.png`,
    'fa-bolt': `${FLUENT_BASE}/Objects/High%20Voltage.png`,
    'fa-rocket': `${FLUENT_BASE}/Travel%20and%20places/Rocket.png`,
    // Custom
    'fa-magic': `${FLUENT_BASE}/Objects/Magic%20Wand.png`,
    'fa-shield-alt': `${FLUENT_BASE}/Objects/Shield.png`,
    'fa-trophy': `${FLUENT_BASE}/Activities/Trophy.png`,
    'fa-users': `${FLUENT_BASE}/People/People%20Hugging.png`,
    'fa-shield-check': `${FLUENT_BASE}/Objects/Locked.png`,
    'fa-compass': `${FLUENT_BASE}/Objects/Compass.png`,
    'fa-moon': `${FLUENT_BASE}/Travel%20and%20places/Crescent%20Moon.png`,
    'fa-sun': `${FLUENT_BASE}/Travel%20and%20places/Sun.png`,
    'fa-user-plus': `${FLUENT_BASE}/People/Busts%20in%20Silhouette.png`,
    'fa-medal': `${FLUENT_BASE}/Activities/Sports%20Medal.png`,
};

function get3DIcon(iconClass) {
    if (!iconClass) return `${FLUENT_BASE}/Objects/Gem%20Stone.png`;
    for (const [key, url] of Object.entries(MILESTONE_3D_MAP)) {
        if (iconClass.includes(key)) return url;
    }
    return `${FLUENT_BASE}/Objects/Gem%20Stone.png`;
}

function getDifficultyClass(m) {
    const target = m.target || 0;
    if (target > 0) {
        if (target <= 3) return 'bronze';
        if (target <= 7) return 'silver';
        if (target <= 15) return 'gold';
        return 'emerald';
    }
    const hash = String(m.id).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const mod = hash % 10;
    if (mod < 4) return 'bronze';
    if (mod < 7) return 'silver';
    if (mod < 9) return 'gold';
    return 'emerald';
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

            <div className="milestones-list" style={{ display: 'flex', overflowX: 'auto', gap: '1rem', padding: '1rem 0.5rem', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {/* Achieved milestones — True 3D Extrusion */}
                {achieved.map(m => {
                    const diffCls = getDifficultyClass(m);
                    return (
                        <div key={m.id} className="milestone-oval-container">
                            <True3DBadge
                                tier={diffCls}
                                isLocked={false}
                                iconUrl={get3DIcon(m.icon)}
                                onClick={() => setTimeout(() => setSelectedMilestone(m), 500)}
                            />
                        </div>
                    );
                })}

                {/* Locked milestones — Black 3D Base */}
                {sortedLocked.map(m => (
                    <div
                        key={m.id}
                        className="milestone-oval-container locked"
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}
                    >
                        <True3DBadge
                            isLocked={true}
                            onClick={() => setSelectedMilestone(m)}
                        />
                        <div className="gem-progress-badge" style={{ marginTop: '0px' }}>{m.progress}%</div>
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
