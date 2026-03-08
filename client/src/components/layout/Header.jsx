import { useState, useEffect } from 'react';

export default function Header({ appData, onHelp, onAddExpense }) {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        const handler = (e) => { e.preventDefault(); setDeferredPrompt(e); };
        window.addEventListener('beforeinstallprompt', handler);
        if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
            setIsInstalled(true);
        }
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstall = async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') setIsInstalled(true);
            setDeferredPrompt(null);
        }
    };

    const joinDate = appData?.created_at ? new Date(appData.created_at) : null;
    const isEarlyAccess = joinDate && joinDate <= new Date('2026-01-31T23:59:59');

    return (
        <header className="header">
            <div className="welcome-text">
                <h1>
                    Hello, {appData?.full_name?.split(' ')[0] || 'User'}!
                    {isEarlyAccess && (
                        <span className="early-access-badge" title="Early Supporter">
                            <i className="fas fa-star"></i> EARLY ACCESS
                        </span>
                    )}
                </h1>
            </div>
            <div className="header-actions">
                {!isInstalled && deferredPrompt && (
                    <button className="install-btn" onClick={handleInstall}>
                        <i className="fas fa-download"></i> Install App
                    </button>
                )}
                {isInstalled && (
                    <button className="install-btn installed" disabled>
                        <i className="fas fa-check-circle"></i> Installed
                    </button>
                )}

                <button className="icon-btn help-btn" onClick={onHelp} title="How It Works">
                    <i className="fas fa-question"></i>
                </button>
                <button className="icon-btn" onClick={onAddExpense} title="Add Expense">
                    <i className="fas fa-plus"></i>
                </button>
            </div>
        </header>
    );
}
