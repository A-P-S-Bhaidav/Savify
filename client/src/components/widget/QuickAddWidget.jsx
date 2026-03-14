import { useState, useRef, useCallback, useEffect } from 'react';
import { supabase } from '../../config/supabase';
import '../../styles/widget.css';

const SAVIFY_LOGO = 'https://i.ibb.co/v441FQJ1/gemini-2-5-flash-image-Refine-this-Savify-S-logo-to-be-flatter-more-geometric-and-ultra-premium.png';

const CATEGORIES = [
    { name: 'Food', icon: 'fa-utensils', color: '#EF4444' },
    { name: 'Transport', icon: 'fa-car', color: '#3B82F6' },
    { name: 'Shopping', icon: 'fa-shopping-bag', color: '#8B5CF6' },
    { name: 'Entertainment', icon: 'fa-film', color: '#F59E0B' },
    { name: 'Bills', icon: 'fa-file-invoice', color: '#06B6D4' },
    { name: 'Education', icon: 'fa-graduation-cap', color: '#10B981' },
];

const RADIUS = 80;

export default function QuickAddWidget({ user, addExpense, currentBudget, currentSpending, fetchScoreAndRank, fetchHistory, fetchExpenses }) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [amount, setAmount] = useState('');
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);

    // Position state
    const [fabPos, setFabPos] = useState(() => {
        try {
            const saved = localStorage.getItem('savify_widget_pos');
            if (saved) return JSON.parse(saved);
        } catch { /* ignore */ }
        return { x: window.innerWidth - 75, y: window.innerHeight - 120 };
    });

    const isDragging = useRef(false);
    const hasMoved = useRef(false);
    const startPoint = useRef({ x: 0, y: 0 });
    const startPos = useRef({ x: 0, y: 0 });
    const amountInputRef = useRef(null);

    // Snap to edge
    const snapToEdge = useCallback((currentPos) => {
        const fabSize = 56;
        const margin = 10;
        const midX = window.innerWidth / 2;
        const snapX = (currentPos.x + fabSize / 2) < midX
            ? margin
            : window.innerWidth - fabSize - margin;
        const snapY = Math.max(margin, Math.min(window.innerHeight - fabSize - margin, currentPos.y));
        const snapped = { x: snapX, y: snapY };
        setFabPos(snapped);
        localStorage.setItem('savify_widget_pos', JSON.stringify(snapped));
    }, []);

    // Drag handlers
    useEffect(() => {
        const onMove = (e) => {
            if (!isDragging.current) return;
            e.stopPropagation(); // Prevent tab swipe
            const clientX = e.clientX ?? e.touches?.[0]?.clientX;
            const clientY = e.clientY ?? e.touches?.[0]?.clientY;
            if (clientX == null) return;

            const dx = clientX - startPoint.current.x;
            const dy = clientY - startPoint.current.y;

            // Only consider it a drag if moved more than 8px
            if (Math.abs(dx) > 8 || Math.abs(dy) > 8) {
                hasMoved.current = true;
                e.preventDefault?.();
            }

            if (hasMoved.current) {
                const newPos = { x: startPos.current.x + dx, y: startPos.current.y + dy };
                setFabPos(newPos);
            }
        };

        const onEnd = (e) => {
            if (!isDragging.current) return;
            e.stopPropagation(); // Prevent tab swipe
            isDragging.current = false;

            if (hasMoved.current) {
                setFabPos(prev => {
                    snapToEdge(prev);
                    return prev;
                });
            } else {
                // It was a tap — toggle open with a reliable timeout
                setTimeout(() => setIsOpen(prev => !prev), 50);
            }
            hasMoved.current = false;
        };

        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onEnd);
        window.addEventListener('touchmove', onMove, { passive: false });
        window.addEventListener('touchend', onEnd);
        return () => {
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onEnd);
            window.removeEventListener('touchmove', onMove);
            window.removeEventListener('touchend', onEnd);
        };
    }, [snapToEdge]);

    const handleDown = (e) => {
        e.stopPropagation(); // Prevent tab swipe
        isDragging.current = true;
        hasMoved.current = false;
        const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
        const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? 0;
        startPoint.current = { x: clientX, y: clientY };
        startPos.current = { ...fabPos };
    };

    // Category positions
    const fabSize = 56;
    const cx = fabPos.x + fabSize / 2;
    const cy = fabPos.y + fabSize / 2;
    const isOnLeft = fabPos.x < window.innerWidth / 2;

    const getCatStyle = (index) => {
        const startDeg = isOnLeft ? -90 : 90;
        const step = 180 / (CATEGORIES.length - 1);
        const angleDeg = startDeg + step * index;
        const angleRad = (angleDeg * Math.PI) / 180;
        const bx = cx + RADIUS * Math.cos(angleRad);
        const by = cy + RADIUS * Math.sin(angleRad);
        return { left: bx - 22, top: by - 22 };
    };

    // Category click
    const handleCategoryClick = (cat) => {
        setSelectedCategory(cat);
        setIsOpen(false);
        setTimeout(() => amountInputRef.current?.focus(), 100);
    };

    // Submit
    const handleSubmit = async () => {
        const val = parseFloat(amount);
        if (!val || val <= 0 || !selectedCategory) return;
        setSaving(true);
        try {
            await addExpense(val, selectedCategory.name, 'Quick Add');
            const newSpending = (currentSpending || 0) + val;
            let score = 1000 - Math.round((newSpending / Math.max(currentBudget || 1, 1)) * 1000);
            score = Math.max(0, Math.min(1000, score));
            await supabase.from('user_applications')
                .update({ current_weekly_spent: newSpending, current_score: score })
                .eq('user_id', user.id);
            setSuccess(true);
            setTimeout(() => {
                setSelectedCategory(null);
                setAmount('');
                setSuccess(false);
                setSaving(false);
                fetchHistory?.();
                fetchExpenses?.();
                fetchScoreAndRank?.();
            }, 800);
            if (typeof window.confetti === 'function') {
                window.confetti({ particleCount: 100, spread: 60, origin: { y: 0.6 }, colors: ['#10B981', '#D4AF37', '#000'] });
            }
        } catch (err) {
            console.error('Quick add error:', err);
            alert('Failed: ' + (err.message || 'Unknown error'));
            setSaving(false);
        }
    };

    const closePopup = () => {
        if (saving) return;
        setSelectedCategory(null);
        setAmount('');
    };

    return (
        <>
            {/* Backdrop */}
            {isOpen && <div className="widget-backdrop" onClick={() => setIsOpen(false)} />}

            {/* Category Buttons — rendered via a portal-like approach directly in body */}
            {isOpen && CATEGORIES.map((cat, idx) => {
                const pos = getCatStyle(idx);
                return (
                    <div
                        key={cat.name}
                        className="widget-cat-btn-wrapper"
                        style={{
                            position: 'fixed',
                            zIndex: 100001,
                            left: `${pos.left}px`,
                            top: `${pos.top}px`,
                            width: '44px',
                            height: '44px',
                            animationDelay: `${idx * 60}ms`,
                        }}
                    >
                        <button
                            className="widget-cat-btn-inner"
                            style={{ background: cat.color }}
                            onClick={() => handleCategoryClick(cat)}
                            title={cat.name}
                        >
                            <i className={`fas ${cat.icon}`}></i>
                        </button>
                        <span className="widget-cat-label">{cat.name}</span>
                    </div>
                );
            })}

            {/* Main FAB */}
            <button
                className={`widget-fab ${isOpen ? 'expanded' : ''}`}
                style={{ left: fabPos.x, top: fabPos.y }}
                onMouseDown={handleDown}
                onTouchStart={handleDown}
            >
                {isOpen ? (
                    <span style={{ fontSize: '1.5rem', color: 'white', lineHeight: 1 }}>✕</span>
                ) : (
                    <img src={SAVIFY_LOGO} alt="S" className="widget-fab-logo" />
                )}
            </button>

            {/* Amount Popup */}
            {selectedCategory && (
                <div className="widget-popup-overlay" onClick={(e) => e.target === e.currentTarget && closePopup()}>
                    <div className="widget-popup">
                        <div className="widget-popup-header">
                            <h3 className="widget-popup-title">Quick Add</h3>
                            <button className="widget-popup-close" onClick={closePopup}>×</button>
                        </div>
                        <div className="widget-popup-category">
                            <div className="widget-popup-category-icon" style={{ background: selectedCategory.color }}>
                                <i className={`fas ${selectedCategory.icon}`}></i>
                            </div>
                            <div>
                                <div className="widget-popup-category-name">{selectedCategory.name}</div>
                                <div className="widget-popup-category-sub">Expense Category</div>
                            </div>
                        </div>
                        <div className="widget-popup-input-group">
                            <label className="widget-popup-label">Amount (₹)</label>
                            <input
                                ref={amountInputRef}
                                className="widget-popup-input"
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                autoFocus
                            />
                        </div>
                        <button
                            className={`widget-popup-add-btn ${success ? 'success' : ''}`}
                            onClick={handleSubmit}
                            disabled={saving || !amount || parseFloat(amount) <= 0}
                        >
                            {saving ? (success ? '✓ Added!' : 'Saving...') : 'Add Expense'}
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
