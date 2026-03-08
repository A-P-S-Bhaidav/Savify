import { useState } from 'react';
import { supabase } from '../../config/supabase';

export default function InviteModal({ isOpen, onClose, user, appData }) {
    const [inviteType, setInviteType] = useState('campus');
    const [email, setEmail] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSend = async () => {
        if (!email.trim()) { alert('Please enter an email!'); return; }
        setSubmitting(true);
        try {
            const { error } = await supabase.functions.invoke('invite-friend', {
                body: {
                    inviterName: appData?.full_name || 'A Savify User',
                    inviterEmail: user?.email || '',
                    friendEmail: email.trim(),
                    type: inviteType
                }
            });
            if (error) throw error;
            setSuccess(true);
            setTimeout(() => { setSuccess(false); setEmail(''); onClose(); }, 2000);
        } catch (err) {
            console.error('Invite error:', err);
            alert('Failed to send invite. Try again!');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay open" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontFamily: 'var(--font-secondary)' }}><i className="fas fa-user-plus" style={{ marginRight: 10, color: 'var(--color-emerald)' }}></i> Invite Friend</h2>
                    <span className="close-modal" onClick={onClose}>&times;</span>
                </div>

                {success ? (
                    <div style={{ textAlign: 'center', padding: '2rem' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
                        <h3 className="gold-text-gradient">Invite Sent!</h3>
                        <p style={{ color: 'var(--color-stone)' }}>Your friend will receive the invite shortly.</p>
                    </div>
                ) : (
                    <>
                        <div className="invite-type-grid">
                            <div className={`invite-option ${inviteType === 'campus' ? 'selected' : ''}`} onClick={() => setInviteType('campus')}>
                                <i className="fas fa-university"></i>
                                <div className="invite-label">Campus Mate</div>
                                <div className="invite-desc">Same college buddy</div>
                            </div>
                            <div className={`invite-option ${inviteType === 'friend' ? 'selected' : ''}`} onClick={() => setInviteType('friend')}>
                                <i className="fas fa-user-friends"></i>
                                <div className="invite-label">Friend</div>
                                <div className="invite-desc">Anyone from anywhere</div>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Friend's Email</label>
                            <input className="sexy-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="friend@email.com" />
                        </div>

                        <button className="sexy-btn" onClick={handleSend} disabled={submitting}>
                            {submitting ? <><i className="fas fa-spinner fa-spin"></i> Sending...</> : 'Send Invite'}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
