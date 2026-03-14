import { useState, useEffect } from 'react';

const SAVIFY_LOGO = 'https://i.ibb.co/v441FQJ1/gemini-2-5-flash-image-Refine-this-Savify-S-logo-to-be-flatter-more-geometric-and-ultra-premium.png';

export default function Header({ onHelp }) {
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
        <header className="header glass-header">
            {/* Subtle animated shimmer line at bottom */}
            <div className="header-shimmer"></div>
            <div className="header-inner">
                <div className="header-logo">
                    <img src={SAVIFY_LOGO} alt="Savify" className="header-logo-img" />
                    <span className="header-logo-text">Savify</span>
                </div>
                <div className="header-actions">
                    <button className="icon-btn help-btn" onClick={onHelp} title="How to use Savify">
                        <i className="fas fa-question-circle"></i>
                    </button>
                    <button className="unwrapped-btn" onClick={() => window.open('/unwrapped', '_blank')}>
                        <i className="fas fa-gift"></i>
                        <span>Unwrapped</span>
                    </button>
                    {!isInstalled ? (
                        <button className="install-app-btn" onClick={handleInstall}>
                            <i className="fas fa-download"></i>
                            <span>App</span>
                        </button>
                    ) : (
                        <button className="install-app-btn installed" disabled>
                            <i className="fas fa-check-circle"></i>
                            <span>Installed</span>
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
}
