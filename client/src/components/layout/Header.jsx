import { useState, useEffect, useRef } from 'react';

const SAVIFY_LOGO = 'https://i.ibb.co/v441FQJ1/gemini-2-5-flash-image-Refine-this-Savify-S-logo-to-be-flatter-more-geometric-and-ultra-premium.png';

export default function Header({ onHelp }) {
    const canvasRef = useRef(null);
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

    // Green particle animation
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let animId;
        let particles = [];

        const resize = () => {
            canvas.width = canvas.parentElement.offsetWidth;
            canvas.height = canvas.parentElement.offsetHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        class Particle {
            constructor() { this.reset(); }
            reset() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 3 + 1;
                this.speedX = (Math.random() - 0.5) * 0.8;
                this.speedY = (Math.random() - 0.5) * 0.4;
                this.opacity = Math.random() * 0.5 + 0.15;
                this.hue = 140 + Math.random() * 30; // green range
            }
            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
                if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
                this.opacity += (Math.random() - 0.5) * 0.02;
                this.opacity = Math.max(0.1, Math.min(0.6, this.opacity));
            }
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = `hsla(${this.hue}, 70%, 55%, ${this.opacity})`;
                ctx.fill();
                // glow
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size * 2.5, 0, Math.PI * 2);
                ctx.fillStyle = `hsla(${this.hue}, 70%, 55%, ${this.opacity * 0.2})`;
                ctx.fill();
            }
        }

        const count = Math.min(35, Math.floor(canvas.width / 20));
        for (let i = 0; i < count; i++) particles.push(new Particle());

        const drawLines = () => {
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 100) {
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `hsla(150, 60%, 50%, ${0.08 * (1 - dist / 100)})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => { p.update(); p.draw(); });
            drawLines();
            animId = requestAnimationFrame(animate);
        };
        animate();

        return () => {
            cancelAnimationFrame(animId);
            window.removeEventListener('resize', resize);
        };
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
            <canvas ref={canvasRef} className="header-particles" />
            <div className="header-inner">
                <div className="header-logo">
                    <img src={SAVIFY_LOGO} alt="Savify" className="header-logo-img" />
                    <span className="header-logo-text">Savify</span>
                </div>
                <div className="header-actions">
                    <button className="icon-btn help-btn" onClick={onHelp} title="How to use">
                        <i className="fas fa-question-circle"></i>
                    </button>
                    <button className="unwrapped-btn" onClick={() => window.open('/unwrapped', '_blank')}>
                        <i className="fas fa-gift" style={{ color: 'var(--color-emerald)' }}></i> Unwrapped
                    </button>
                    {!isInstalled ? (
                        <button className="install-app-btn" onClick={handleInstall}>
                            <i className="fas fa-download"></i> App
                        </button>
                    ) : (
                        <button className="install-app-btn installed" disabled>
                            <i className="fas fa-check-circle"></i> Installed
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
}
