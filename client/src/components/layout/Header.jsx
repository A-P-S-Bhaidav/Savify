import { useState, useEffect } from 'react';

export default function Header({ appData, onHelp, onAddExpense }) {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [isInstalled, setIsInstalled] = useState(() => {
        if (typeof window !== 'undefined') {
            return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
        }
        return false;
    });

    useEffect(() => {
        const handler = (e) => { e.preventDefault(); setDeferredPrompt(e); };
        window.addEventListener('beforeinstallprompt', handler);
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

    return (
        <header className="header">
            <div className="welcome-text">
                <h1>Hello, {appData?.full_name?.split(' ')[0] || 'User'}!</h1>
                <p className="welcome-subtitle">Monitoring your progress.</p>
            </div>
            <div className="header-actions">
                <button className="icon-btn help-btn" onClick={onHelp} title="How It Works">
                    <i className="fas fa-question"></i>
                </button>

                <button className="unwrapped-btn" onClick={() => window.open('/unwrapped', '_blank')}>
                    <i className="fas fa-gift"></i> Unwrapped
                </button>

                {!isInstalled && deferredPrompt && (
                    <button className="install-app-btn" onClick={handleInstall}>
                        I App
                    </button>
                )}
                {isInstalled && (
                    <button className="install-app-btn installed" disabled>
                        <i className="fas fa-check-circle"></i> Installed
                    </button>
                )}
            </div>
        </header>
    );
}
