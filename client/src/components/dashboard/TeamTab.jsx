import { useState, useEffect } from 'react';
import { getCategoryIcon } from '../../utils/helpers';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';

const AVATAR_COLORS = ['10B981', '3B82F6', '8B5CF6', 'F59E0B', 'EF4444', 'EC4899', '06B6D4', 'D946EF'];

export default function TeamTab({
    teams, loading, pendingRequests,
    selectedTeam, teamExpenses, teamMembers,
    onCreateTeam, onJoinByCode,
    onApproveRequest, onRejectRequest, onSelectTeam, onBack,
    onAddTeamExpense, onRemoveMember, userId
}) {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [showAddExpense, setShowAddExpense] = useState(false);

    // Create Team form
    const [teamName, setTeamName] = useState('');
    const [creating, setCreating] = useState(false);

    // Join by code form
    const [joinCode, setJoinCode] = useState('');
    const [joinStatus, setJoinStatus] = useState('');

    // Add expense form
    const [expAmount, setExpAmount] = useState('');
    const [expCategory, setExpCategory] = useState('Food');
    const [expDesc, setExpDesc] = useState('');

    const handleCreate = async () => {
        if (!teamName.trim()) return;
        setCreating(true);
        try {
            await onCreateTeam(teamName.trim());
            setShowCreateModal(false);
            setTeamName('');
        } catch (e) {
            alert('Error: ' + e.message);
        } finally {
            setCreating(false);
        }
    };

    const handleJoin = async () => {
        if (!joinCode.trim()) return;
        setJoinStatus('sending');
        try {
            await onJoinByCode(joinCode.trim());
            setJoinStatus('sent');
        } catch (e) {
            setJoinStatus('error: ' + e.message);
        }
    };

    const handleAddExpense = async () => {
        if (!expAmount || !selectedTeam) return;
        try {
            await onAddTeamExpense(selectedTeam.id, parseFloat(expAmount), expCategory, expDesc);
            setShowAddExpense(false);
            setExpAmount('');
            setExpDesc('');
        } catch (e) {
            alert('Error: ' + e.message);
        }
    };

    const copyCode = (code) => {
        navigator.clipboard.writeText(code).then(() => {
            alert('Team code copied!');
        });
    };

    // Team Detail View
    if (selectedTeam) {
        const shareTeamCode = async () => {
            const shareText = `C'mon guys lets come to savify -> www.savify.in, i have created a team ${selectedTeam.name}, since we are collecting working on project. here we can add expense. If you havent used savify, download it from www.savify.in and use this code to join the team "${selectedTeam.team_code}"`;

            try {
                if (Capacitor.isNativePlatform()) {
                    await Share.share({
                        title: 'Join my Savify Team!',
                        text: shareText,
                        dialogTitle: 'Share Team Invite'
                    });
                } else if (navigator.share) {
                    await navigator.share({
                        title: 'Join my Savify Team!',
                        text: shareText
                    });
                } else {
                    navigator.clipboard.writeText(shareText);
                    alert('Invite message copied to clipboard! Paste it anywhere.');
                }
            } catch (err) {
                console.log('Share error or dismissed:', err);
            }
        };

        return (
            <div className="team-detail-view">
                <div className="tab-greeting">
                    <button className="team-back-btn" onClick={onBack}>
                        <i className="fas fa-arrow-left"></i> Back
                    </button>
                    <h1>{selectedTeam.name}</h1>
                    <p>{selectedTeam.isAdmin ? 'Admin' : 'Member'}</p>
                </div>

                {/* Team Code Card */}
                <div className="team-code-card">
                    <div className="team-code-label">Team Code</div>
                    <div className="team-code-value">{selectedTeam.team_code}</div>
                    <div className="team-code-actions">
                        <button className="team-code-btn" onClick={() => copyCode(selectedTeam.team_code)}>
                            <i className="fas fa-copy"></i> Copy
                        </button>
                        <button className="team-code-btn" onClick={shareTeamCode}>
                            <i className="fas fa-share-alt"></i> Share
                        </button>
                    </div>
                </div>

                {/* Pending Requests (Admin only) */}
                {selectedTeam.isAdmin && pendingRequests.length > 0 && (
                    <div className="team-pending-section">
                        <h3><i className="fas fa-user-clock"></i> Pending Requests</h3>
                        {pendingRequests.filter(r => r.project_id === selectedTeam.id).map(req => (
                            <div key={req.id} className="team-invite-item">
                                <span>{req.user_applications?.full_name || 'User'} wants to join</span>
                                <div>
                                    <button className="team-accept-btn" onClick={() => onApproveRequest(req.id, selectedTeam.id)}>
                                        <i className="fas fa-check"></i>
                                    </button>
                                    <button className="team-reject-btn" onClick={() => onRejectRequest(req.id, selectedTeam.id)}>
                                        <i className="fas fa-times"></i>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Members */}
                <div className="team-members-section">
                    <h3><i className="fas fa-users"></i> Members ({teamMembers.length})</h3>
                    <div className="team-members-grid">
                        {teamMembers.map((m, idx) => {
                            const name = m.user_applications?.full_name || 'User';
                            const color = AVATAR_COLORS[idx % AVATAR_COLORS.length];
                            const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${color}&color=fff&size=80`;
                            return (
                                <div key={m.id} className="team-member-item">
                                    <img src={avatarUrl} alt={name} className="team-member-avatar" />
                                    <span className="team-member-name">{name.split(' ')[0]}</span>
                                    {selectedTeam.isAdmin && m.user_id !== userId && (
                                        <button className="team-remove-btn" onClick={() => onRemoveMember(selectedTeam.id, m.id)} title="Remove">
                                            <i className="fas fa-user-minus"></i>
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Team Expenses */}
                <div className="team-expenses-section">
                    <div className="team-expenses-header">
                        <h3><i className="fas fa-receipt"></i> Team Expenses</h3>
                        <button className="add-expense-btn" onClick={() => setShowAddExpense(true)}>
                            <i className="fas fa-plus"></i> Add
                        </button>
                    </div>
                    <div className="team-expenses-list">
                        {teamExpenses.length === 0 ? (
                            <div className="team-expenses-empty">No team expenses yet.</div>
                        ) : teamExpenses.map((exp, idx) => (
                            <div key={idx} className="transaction-item">
                                <div className="transaction-left">
                                    <div className="transaction-icon">
                                        <i className={`fas ${getCategoryIcon(exp.category)}`}></i>
                                    </div>
                                    <div className="transaction-info">
                                        <span className="transaction-category">{exp.category}</span>
                                        <span className="transaction-date">
                                            {exp.user_applications?.full_name?.split(' ')[0] || ''} •{' '}
                                            {new Date(exp.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                        </span>
                                    </div>
                                </div>
                                <div className="transaction-amount">-₹{Number(exp.amount).toLocaleString()}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Add Expense Modal */}
                {showAddExpense && (
                    <div className="modal-overlay open" onClick={() => setShowAddExpense(false)}>
                        <div className="focus-modal" onClick={e => e.stopPropagation()}>
                            <button className="milestone-popup-close" onClick={() => setShowAddExpense(false)}>
                                <i className="fas fa-times"></i>
                            </button>
                            <h2 className="focus-modal-title"><i className="fas fa-receipt"></i> Add Team Expense</h2>
                            <div className="form-group">
                                <label>Amount (₹)</label>
                                <input type="number" value={expAmount} onChange={e => setExpAmount(e.target.value)} placeholder="Enter amount" />
                            </div>
                            <div className="form-group">
                                <label>Category</label>
                                <select value={expCategory} onChange={e => setExpCategory(e.target.value)}>
                                    {['Food', 'Transport', 'Shopping', 'Entertainment', 'Bills', 'Education', 'Others'].map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Description (optional)</label>
                                <input type="text" value={expDesc} onChange={e => setExpDesc(e.target.value)} placeholder="What was this for?" />
                            </div>
                            <button className="sexy-btn" onClick={handleAddExpense} disabled={!expAmount} style={{ width: '100%', marginTop: '1rem' }}>
                                <i className="fas fa-plus"></i> Add Expense
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Teams List View
    return (
        <div className="team-tab-container">
            <div className="tab-greeting">
                <h1>Teams</h1>
                <p>Manage group expenses with friends</p>
            </div>



            {/* Action Buttons */}
            <div className="team-action-row">
                <button className="team-action-btn create" onClick={() => setShowCreateModal(true)}>
                    <i className="fas fa-plus-circle"></i>
                    <span>Create Team</span>
                </button>
                <button className="team-action-btn join" onClick={() => setShowJoinModal(true)}>
                    <i className="fas fa-sign-in-alt"></i>
                    <span>Join by Code</span>
                </button>
            </div>

            {/* Teams List */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>
                    <i className="fas fa-spinner fa-spin"></i> Loading teams...
                </div>
            ) : teams.length === 0 ? (
                <div className="team-empty-state">
                    <i className="fas fa-users"></i>
                    <h3>No teams yet</h3>
                    <p>Create a team or join one with a code to start managing group expenses!</p>
                </div>
            ) : (
                <div className="teams-list">
                    {teams.map(team => (
                        <div key={team.id} className="team-list-card" onClick={() => onSelectTeam(team.id)}>
                            <div className="team-list-icon">
                                <i className="fas fa-users"></i>
                            </div>
                            <div className="team-list-info">
                                <h4>{team.name}</h4>
                                <span>{team.memberCount} members • ₹{(team.totalExpenses || 0).toLocaleString()}</span>
                            </div>
                            {team.isAdmin && <span className="team-admin-badge">Admin</span>}
                            <i className="fas fa-chevron-right team-list-arrow"></i>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Team Modal */}
            {showCreateModal && (
                <div className="modal-overlay open" onClick={() => setShowCreateModal(false)}>
                    <div className="focus-modal" onClick={e => e.stopPropagation()}>
                        <button className="milestone-popup-close" onClick={() => setShowCreateModal(false)}>
                            <i className="fas fa-times"></i>
                        </button>
                        <h2 className="focus-modal-title"><i className="fas fa-users"></i> Create Team</h2>
                        <div className="form-group">
                            <label>Team Name *</label>
                            <input type="text" value={teamName} onChange={e => setTeamName(e.target.value)} placeholder="e.g. Goa Trip 2026" />
                        </div>
                        <button className="sexy-btn" onClick={handleCreate} disabled={creating || !teamName.trim()} style={{ width: '100%', marginTop: '1rem' }}>
                            {creating ? <><i className="fas fa-spinner fa-spin"></i> Creating...</> : <><i className="fas fa-plus"></i> Create Team</>}
                        </button>
                    </div>
                </div>
            )}

            {/* Join by Code Modal */}
            {showJoinModal && (
                <div className="modal-overlay open" onClick={() => setShowJoinModal(false)}>
                    <div className="focus-modal" onClick={e => e.stopPropagation()}>
                        <button className="milestone-popup-close" onClick={() => setShowJoinModal(false)}>
                            <i className="fas fa-times"></i>
                        </button>
                        <h2 className="focus-modal-title"><i className="fas fa-key"></i> Join by Code</h2>
                        <div className="form-group">
                            <label>Enter Team Code</label>
                            <input type="text" value={joinCode} onChange={e => setJoinCode(e.target.value)} placeholder="e.g. a1b2c3d4" />
                        </div>
                        {joinStatus && (
                            <div className={`team-join-status ${joinStatus === 'sent' ? 'success' : joinStatus === 'sending' ? '' : 'error'}`}>
                                {joinStatus === 'sending' ? 'Sending request...' : joinStatus === 'sent' ? 'Join request sent! Waiting for admin approval.' : joinStatus}
                            </div>
                        )}
                        <button className="sexy-btn" onClick={handleJoin} disabled={!joinCode.trim() || joinStatus === 'sending'} style={{ width: '100%', marginTop: '1rem' }}>
                            <i className="fas fa-paper-plane"></i> Send Join Request
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
