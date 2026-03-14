export default function TrustLogicModal({ isOpen, onClose }) {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay open" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal trust-logic-modal">
                <div className="trust-logic-header">
                    <h2>
                        <i className="fas fa-lock" style={{ marginRight: 10, color: 'var(--color-emerald)' }}></i>
                        Trust & Logic
                    </h2>
                    <span className="close-modal" onClick={onClose}>&times;</span>
                </div>

                <p className="trust-logic-subtitle">HOW SCORES ARE CALCULATED</p>

                <div className="trust-logic-item">
                    <div className="trust-logic-icon" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
                        <i className="fas fa-wallet" style={{ color: 'var(--color-emerald)' }}></i>
                    </div>
                    <div>
                        <div className="trust-logic-title">Budget Adherence</div>
                        <div className="trust-logic-desc">Staying within your weekly limit is the biggest factor.</div>
                    </div>
                </div>

                <div className="trust-logic-item">
                    <div className="trust-logic-icon" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
                        <i className="fas fa-calendar-check" style={{ color: 'var(--color-emerald)' }}></i>
                    </div>
                    <div>
                        <div className="trust-logic-title">Consistency</div>
                        <div className="trust-logic-desc">Logging expenses daily boosts your streak and score.</div>
                    </div>
                </div>

                <div className="trust-logic-item">
                    <div className="trust-logic-icon" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
                        <i className="fas fa-atom" style={{ color: 'var(--color-emerald)' }}></i>
                    </div>
                    <div>
                        <div className="trust-logic-title">Velocity</div>
                        <div className="trust-logic-desc">Pacing your spending evenly through the week matters.</div>
                    </div>
                </div>

                <div className="trust-logic-transparency">
                    <div className="trust-logic-transparency-header">
                        <i className="fas fa-shield-alt" style={{ color: 'var(--color-emerald)', marginRight: 8 }}></i>
                        <strong>Data Transparency</strong>
                    </div>
                    <p>
                        Your data is secure. Savify is a <strong>manual tracker simulator</strong>.
                        We <strong>never</strong> ask for bank passwords or access financial APIs.
                    </p>
                </div>

                <button className="sexy-btn" style={{ marginTop: '1.5rem' }} onClick={onClose}>Got it</button>
            </div>
        </div>
    );
}
