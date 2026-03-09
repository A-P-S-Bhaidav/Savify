import { useState, useRef, useCallback, useEffect } from 'react';
import { supabase } from '../../config/supabase';

const SAVIFY_LOGO = 'https://i.ibb.co/v441FQJ1/gemini-2-5-flash-image-Refine-this-Savify-S-logo-to-be-flatter-more-geometric-and-ultra-premium.png';

const CATEGORIES = [
    { name: 'Food', icon: 'fa-utensils' },
    { name: 'Transport', icon: 'fa-car' },
    { name: 'Shopping', icon: 'fa-shopping-bag' },
    { name: 'Entertainment', icon: 'fa-film' },
    { name: 'Bills', icon: 'fa-file-invoice' },
    { name: 'Education', icon: 'fa-graduation-cap' },
];

const RADIUS = 90; // px distance from center for category buttons

export default function QuickAddWidget({ user, addExpense, currentBudget, currentSpending, fetchScoreAndRank, fetchHistory, fetchExpenses }) {
    const [expanded, setExpanded] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const [amount, setAmount] = useState('');
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [clickedIdx, setClickedIdx] = useState(null);

    // Drag state
    const [pos, setPos] = useState(() => {
        const saved = localStorage.getItem('savify_widget_pos');
        if (saved) {
            try { return JSON.parse(saved); } catch { /* fall through */ }
        }
        return { x: window.innerWidth - 70, y: window.innerHeight / 2 - 28 };
    });
    const [dragging, setDragging] = useState(false);
    const [snapping, setSnapping] = useState(false);
    const dragOffset = useRef({ x: 0, y: 0 });
    const dragStartPos = useRef({ x: 0, y: 0 });
    const wasDragged = useRef(false);

    // Hover proximity
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const menuRef = useRef(null);

    // Snap to nearest edge
    const snapToEdge = useCallback((x, y) => {
        const fabSize = window.innerWidth <= 768 ? 50 : 56;
        const margin = 8;
        const midX = window.innerWidth / 2;

        let targetX;
        if (x + fabSize / 2 < midX) {
            targetX = margin;
        } else {
            targetX = window.innerWidth - fabSize - margin;
        }
        // Clamp Y
        const targetY = Math.max(margin, Math.min(window.innerHeight - fabSize - margin, y));

        setSnapping(true);
        setPos({ x: targetX, y: targetY });
        localStorage.setItem('savify_widget_pos', JSON.stringify({ x: targetX, y: targetY }));
        setTimeout(() => setSnapping(false), 600);
    }, []);

    // Pointer drag handlers
    const handlePointerDown = useCallback((e) => {
        e.preventDefault();
        setDragging(true);
        wasDragged.current = false;
        const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
        const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? 0;
        dragOffset.current = { x: clientX - pos.x, y: clientY - pos.y };
        dragStartPos.current = { x: clientX, y: clientY };
    }, [pos]);

    const handlePointerMove = useCallback((e) => {
        if (!dragging) return;
        const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
        const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? 0;
        const dx = clientX - dragStartPos.current.x;
        const dy = clientY - dragStartPos.current.y;
        if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
            wasDragged.current = true;
        }
        setPos({ x: clientX - dragOffset.current.x, y: clientY - dragOffset.current.y });
    }, [dragging]);

    const handlePointerUp = useCallback(() => {
        if (!dragging) return;
        setDragging(false);
        snapToEdge(pos.x, pos.y);
    }, [dragging, pos, snapToEdge]);

    useEffect(() => {
        if (dragging) {
            window.addEventListener('pointermove', handlePointerMove);
            window.addEventListener('pointerup', handlePointerUp);
            window.addEventListener('touchmove', handlePointerMove, { passive: false });
            window.addEventListener('touchend', handlePointerUp);
        }
        return () => {
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerUp);
            window.removeEventListener('touchmove', handlePointerMove);
            window.removeEventListener('touchend', handlePointerUp);
        };
    }, [dragging, handlePointerMove, handlePointerUp]);

    // Re-snap on resize
    useEffect(() => {
        const handleResize = () => snapToEdge(pos.x, pos.y);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [pos, snapToEdge]);

    // Track mouse for proximity hover
    const handleMenuMouseMove = useCallback((e) => {
        setMousePos({ x: e.clientX, y: e.clientY });
    }, []);

    useEffect(() => {
        if (expanded) {
            window.addEventListener('pointermove', handleMenuMouseMove);
        }
        return () => window.removeEventListener('pointermove', handleMenuMouseMove);
    }, [expanded, handleMenuMouseMove]);

    // Toggle menu
    const handleFabClick = () => {
        if (wasDragged.current) return;
        if (expanded) {
            setExpanded(false);
            setClickedIdx(null);
        } else {
            setExpanded(true);
        }
    };

    // Calculate button positions (semi-circle on the side away from edge)
    const fabSize = typeof window !== 'undefined' && window.innerWidth <= 768 ? 50 : 56;
    const centerX = pos.x + fabSize / 2;
    const centerY = pos.y + fabSize / 2;
    const isLeftSide = pos.x < window.innerWidth / 2;

    const getButtonPositions = () => {
        // Left side: -90 (top) to 90 (bottom). Right side: 90 (bottom) to 270 (top)
        const startAngle = isLeftSide ? -90 : 90;
        const sweep = 180;
        const direction = 1;

        return CATEGORIES.map((_, idx) => {
            const angleDeg = startAngle + direction * (sweep / (CATEGORIES.length - 1)) * idx;
            const angleRad = (angleDeg * Math.PI) / 180;
            const x = centerX + RADIUS * Math.cos(angleRad) - 23;
            const y = centerY + RADIUS * Math.sin(angleRad) - 23;
            return { x, y, angleDeg };
        });
    };

    // Proximity-based scale
    const getProximityScale = (btnX, btnY) => {
        const dx = mousePos.x - (btnX + 23);
        const dy = mousePos.y - (btnY + 23);
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = 120;
        const minScale = 1;
        const maxScale = 1.35;
        const t = Math.max(0, 1 - dist / maxDist);
        return minScale + t * (maxScale - minScale);
    };

    // Find which is closest to cursor
    const getClosestIndex = (positions) => {
        let closest = -1;
        let minDist = Infinity;
        positions.forEach((p, i) => {
            const dx = mousePos.x - (p.x + 23);
            const dy = mousePos.y - (p.y + 23);
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < minDist && dist < 100) {
                minDist = dist;
                closest = i;
            }
        });
        return closest;
    };

    // Handle category click
    const handleCategoryClick = (category, idx) => {
        setClickedIdx(idx);
        setTimeout(() => {
            setSelectedCategory(category);
            setShowPopup(true);
            setExpanded(false);
            setClickedIdx(null);
        }, 350);
    };

    // Submit quick expense
    const handleQuickAdd = async () => {
        const amt = parseFloat(amount);
        if (isNaN(amt) || amt <= 0) return;

        setSaving(true);
        try {
            await addExpense(amt, selectedCategory.name, 'Quick Add');

            // Update user_applications
            const newSpending = (currentSpending || 0) + amt;
            let projectedScore = 1000 - Math.round((newSpending / Math.max(currentBudget || 1, 1)) * 1000);
            projectedScore = Math.max(0, Math.min(1000, projectedScore));

            await supabase.from('user_applications')
                .update({ current_weekly_spent: newSpending, current_score: projectedScore })
                .eq('user_id', user.id);

            setSuccess(true);
            setTimeout(() => {
                setShowPopup(false);
                setSelectedCategory(null);
                setAmount('');
                setSuccess(false);
                setSaving(false);
                // Refresh data
                fetchHistory?.();
                fetchExpenses?.();
                fetchScoreAndRank?.();
            }, 600);

            // Confetti
            if (typeof window.confetti === 'function') {
                window.confetti({ particleCount: 100, spread: 60, origin: { y: 0.6 }, colors: ['#10B981', '#D4AF37', '#000'] });
            }
        } catch (err) {
            console.error('Quick add error:', err);
            alert('Failed to save: ' + (err.message || 'Unknown error'));
            setSaving(false);
        }
    };

    const positions = expanded ? getButtonPositions() : [];
    const closestIdx = expanded ? getClosestIndex(positions) : -1;

    return (
        <>
            {/* Radial Menu */}
            <div
                ref={menuRef}
                className={`widget-radial-menu ${expanded ? 'open' : ''}`}
            >
                {CATEGORIES.map((cat, idx) => {
                    const p = positions[idx] || { x: centerX - 23, y: centerY - 23 };
                    const scale = expanded ? getProximityScale(p.x, p.y) : 0;
                    const isHovered = closestIdx === idx;
                    const isClicked = clickedIdx === idx;

                    return (
                        <button
                            key={cat.name}
                            className={`widget-category-btn ${isHovered ? 'hovered' : ''} ${isClicked ? 'clicked' : ''}`}
                            style={{
                                left: p.x,
                                top: p.y,
                                transform: expanded
                                    ? `scale(${isClicked ? 1 : scale})`
                                    : 'scale(0)',
                                width: expanded ? `${46 * scale}px` : '46px',
                                height: expanded ? `${46 * scale}px` : '46px',
                                fontSize: expanded ? `${1.1 * scale}rem` : '1.1rem',
                            }}
                            onClick={() => handleCategoryClick(cat, idx)}
                            title={cat.name}
                        >
                            {isClicked ? (
                                <img src={SAVIFY_LOGO} alt="Savify" style={{ width: 20, height: 20, borderRadius: '50%' }} />
                            ) : (
                                <i className={`fas ${cat.icon}`}></i>
                            )}
                            <span className="widget-category-label">{cat.name}</span>
                        </button>
                    );
                })}
            </div>

            {/* Main FAB */}
            <button
                className={`widget-fab ${expanded ? 'expanded' : ''} ${dragging ? 'dragging' : ''} ${snapping ? 'snapping' : ''}`}
                style={{ left: pos.x, top: pos.y }}
                onPointerDown={handlePointerDown}
                onClick={handleFabClick}
            >
                <img src={SAVIFY_LOGO} alt="S" className="widget-fab-logo" />
            </button>

            {/* Quick Add Popup */}
            {showPopup && selectedCategory && (
                <div className="widget-popup-overlay" onClick={(e) => e.target === e.currentTarget && !saving && (setShowPopup(false), setSelectedCategory(null), setAmount(''))}>
                    <div className="widget-popup">
                        <div className="widget-popup-header">
                            <h3 className="widget-popup-title">Quick Add</h3>
                            <button
                                className="widget-popup-close"
                                onClick={() => { setShowPopup(false); setSelectedCategory(null); setAmount(''); }}
                            >
                                ×
                            </button>
                        </div>

                        <div className="widget-popup-category">
                            <div className="widget-popup-category-icon">
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
                            onClick={handleQuickAdd}
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
