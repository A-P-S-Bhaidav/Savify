import { useState } from 'react';
import MilestoneDetailPopup from '../modals/MilestoneDetailPopup';

export default function MilestonesSection({ achieved = [], locked = [] }) {
    const [selectedMilestone, setSelectedMilestone] = useState(null);

    // Sort locked by progress descending
    const sortedLocked = [...locked].sort((a, b) => b.progress - a.progress);

    return (
        <div className="milestones-card">
            <div className="milestones-header">
                <h2 className="milestones-title">
                    <i className="fas fa-gem"></i> Milestones
                </h2>
                <span className="milestones-count">{achieved.length}/{achieved.length + locked.length}</span>
            </div>

            <div className="milestones-list" style={{ display: 'flex', overflowX: 'auto', gap: '1rem', paddingBottom: '0.5rem', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {/* Achieved milestones - Icon Only */}
                {achieved.map(m => (
                    <div
                        key={m.id}
                        className="milestone-gem achieved"
                        onClick={() => setSelectedMilestone(m)}
                        style={{ minWidth: '40px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        <div className="gem-icon"><i className={`${m.icon} premium-icon`}></i></div>
                    </div>
                ))}
                
                {/* Locked milestones - Grey Diamond */}
                {sortedLocked.map(m => (
                    <div
                        key={m.id}
                        className="milestone-gem locked"
                        onClick={() => setSelectedMilestone(m)}
                        style={{ minWidth: '50px', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                    >
                        <div className="gem-icon"><i className="fas fa-gem" style={{ color: '#555', fontSize: '1.2rem' }}></i></div>
                        <div className="gem-progress-badge" style={{ marginTop: '5px' }}>{m.progress}%</div>
                    </div>
                ))}

                {achieved.length === 0 && locked.length === 0 && (
                    <div className="milestones-empty">No milestones yet</div>
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
