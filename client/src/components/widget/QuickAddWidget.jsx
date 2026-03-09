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

const RADIUS = 85;

export default function QuickAddWidget({ user, addExpense, currentBudget, currentSpending, fetchScoreAndRank, fetchHistory, fetchExpenses }) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [amount, setAmount] = useState('');
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);

    // Position state - default bottom-right
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

    // --- DRAG LOGIC (using mouse/touch events, NOT pointer events) ---
    const onDragStart = useCallback((clientX, clientY) => {
        isDragging.current = true;
        hasMoved.current = false;
        startPoint.current = { x: clientX, y: clientY };
        startPos.current = { ...fabPos };
    }, [fabPos]);

    const onDragMove = useCallback((clientX, clientY) => {
        if (!isDragging.current) return;
        const dx = clientX - startPoint.current.x;
        const dy = clientY - startPoint.current.y;
        if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
            hasMoved.current = true;
        }
        setFabPos({
            x: startPos.current.x + dx,
            y: startPos.current.y + dy,
        });
    }, []);

    const onDragEnd = useCallback(() => {
        if (!isDragging.current) return;
        isDragging.current = false;

        // Snap to nearest horizontal edge
        const fabSize = 56;
        const margin = 10;
        const midX = window.innerWidth / 2;
        const currentX = fabPos.x + fabSize / 2;
        const snapX = currentX < midX ? margin : window.innerWidth - fabSize - margin;
        const snapY = Math.max(margin, Math.min(window.innerHeight - fabSize - margin, fabPos.y));
        const snapped = { x: snapX, y: snapY };
        setFabPos(snapped);
        localStorage.setItem('savify_widget_pos', JSON.stringify(snapped));

        // If didn't drag, treat as click
        if (!hasMoved.current) {
            setIsOpen(prev => !prev);
        }
    }, [fabPos]);

    // Mouse events
    const handleMouseDown = (e) => {
        e.preventDefault();
        onDragStart(e.clientX, e.clientY);
    };

    useEffect(() => {
        const onMouseMove = (e) => onDragMove(e.clientX, e.clientY);
        const onMouseUp = () => onDragEnd();
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };
    }, [onDragMove, onDragEnd]);

    // Touch events
    const handleTouchStart = (e) => {
        const touch = e.touches[0];
        onDragStart(touch.clientX, touch.clientY);
    };

    useEffect(() => {
        const onTouchMove = (e) => {
            if (isDragging.current) e.preventDefault();
            const touch = e.touches[0];
            onDragMove(touch.clientX, touch.clientY);
        };
        const onTouchEnd = () => onDragEnd();
        window.addEventListener('touchmove', onTouchMove, { passive: false });
        window.addEventListener('touchend', onTouchEnd);
        return () => {
            window.removeEventListener('touchmove', onTouchMove);
            window.removeEventListener('touchend', onTouchEnd);
        };
    }, [onDragMove, onDragEnd]);

    // --- CATEGORY BUTTON POSITIONS ---
    const fabSize = 56;
    const cx = fabPos.x + fabSize / 2;
    const cy = fabPos.y + fabSize / 2;
    const isOnLeft = fabPos.x < window.innerWidth / 2;

    const getCategoryPos = (index) => {
        // Semi-circle opens away from the edge
        // Left side: arc from -90° to +90° (right half-circle)
        // Right side: arc from 90° to 270° (left half-circle)
        const startDeg = isOnLeft ? -90 : 90;
        const step = 180 / (CATEGORIES.length - 1);
        const angleDeg = startDeg + step * index;
        const angleRad = (angleDeg * Math.PI) / 180;
        return {
            x: cx + RADIUS * Math.cos(angleRad) - 22,
            y: cy + RADIUS * Math.sin(angleRad) - 22,
        };
    };

    // --- CATEGORY CLICK ---
    const handleCategoryClick = (cat) => {
        setSelectedCategory(cat);
        setIsOpen(false);
        setTimeout(() => amountInputRef.current?.focus(), 100);
    };

    // --- SUBMIT EXPENSE ---
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
            {/* ===== BACKDROP when menu is open ===== */}
            {isOpen && (
                <div
                    className="widget-backdrop"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* ===== CATEGORY BUTTONS ===== */}
            {CATEGORIES.map((cat, idx) => {
                const pos = getCategoryPos(idx);
                return (
                    <button
                        key={cat.name}
                        className={`widget-cat-btn ${isOpen ? 'visible' : ''}`}
                        style={{
                            left: pos.x,
                            top: pos.y,
                            background: cat.color,
                            transitionDelay: isOpen ? `${idx * 50}ms` : `${(CATEGORIES.length - idx) * 30}ms`,
                        }}
                        onClick={() => handleCategoryClick(cat)}
                        title={cat.name}
                    >
                        <i className={`fas ${cat.icon}`}></i>
                        <span className="widget-cat-label">{cat.name}</span>
                    </button>
                );
            })}

            {/* ===== MAIN FAB ===== */}
            <button
                className={`widget-fab ${isOpen ? 'expanded' : ''}`}
                style={{ left: fabPos.x, top: fabPos.y }}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
            >
                {isOpen ? (
                    <span style={{ fontSize: '1.5rem', color: 'white', lineHeight: 1 }}>✕</span>
                ) : (
                    <img src={SAVIFY_LOGO} alt="S" className="widget-fab-logo" />
                )}
            </button>

            {/* ===== AMOUNT POPUP ===== */}
            {selectedCategory && (
                <div className="widget-popup-overlay" onClick={(e) => e.target === e.currentTarget && closePopup()}>
                    <div className="widget-popup">
                        <div className="widget-popup-header">
                            <h3 className="widget-popup-title">Quick Add</h3>
                            <button className="widget-popup-close" onClick={closePopup}>×</button>
                        </div>

                        <div className="widget-popup-category" style={{ borderColor: selectedCategory.color + '33' }}>
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
