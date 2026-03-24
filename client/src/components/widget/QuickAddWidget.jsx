import { useState, useRef, useCallback, useEffect } from 'react';
import { supabase } from '../../config/supabase';
import '../../styles/widget.css';

const SAVIFY_LOGO = 'https://i.ibb.co/v441FQJ1/gemini-2-5-flash-image-Refine-this-Savify-S-logo-to-be-flatter-more-geometric-and-ultra-premium.png';

const CATEGORIES = [
    { name: 'Food', icon: 'fa-utensils' },
    { name: 'Transport', icon: 'fa-car' },
    { name: 'Shopping', icon: 'fa-shopping-bag' },
    { name: 'Entertainment', icon: 'fa-film' },
    { name: 'Bills', icon: 'fa-file-invoice' },
    { name: 'Education', icon: 'fa-graduation-cap' },
];

const VISIBLE_COUNT = 3;

export default function QuickAddWidget({ user, addExpense, currentBudget, currentSpending, fetchScoreAndRank, fetchHistory, fetchExpenses }) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [amount, setAmount] = useState('');
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);

    // Carousel state
    const [carouselIndex, setCarouselIndex] = useState(0);
    const carouselRef = useRef(null);
    const spinStartY = useRef(null);

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
    const rafRef = useRef(null);

    // Snap to edge
    const snapToEdge = useCallback((currentPos) => {
        const fabSize = 60;
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

    // Drag handlers with rAF optimization
    useEffect(() => {
        const onMove = (e) => {
            if (!isDragging.current) return;
            e.stopPropagation();
            const clientX = e.clientX ?? e.touches?.[0]?.clientX;
            const clientY = e.clientY ?? e.touches?.[0]?.clientY;
            if (clientX == null) return;

            const dx = clientX - startPoint.current.x;
            const dy = clientY - startPoint.current.y;

            if (Math.abs(dx) > 8 || Math.abs(dy) > 8) {
                hasMoved.current = true;
                e.preventDefault?.();
            }

            if (hasMoved.current) {
                if (rafRef.current) cancelAnimationFrame(rafRef.current);
                rafRef.current = requestAnimationFrame(() => {
                    const newPos = { x: startPos.current.x + dx, y: startPos.current.y + dy };
                    setFabPos(newPos);
                });
            }
        };

        const onEnd = (e) => {
            if (!isDragging.current) return;
            e.stopPropagation();
            isDragging.current = false;

            if (hasMoved.current) {
                setFabPos(prev => {
                    snapToEdge(prev);
                    return prev;
                });
            } else {
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
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [snapToEdge]);

    const handleDown = (e) => {
        e.stopPropagation();
        isDragging.current = true;
        hasMoved.current = false;
        const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
        const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? 0;
        startPoint.current = { x: clientX, y: clientY };
        startPos.current = { ...fabPos };
    };

    // Carousel spin handlers
    const handleCarouselTouchStart = (e) => {
        e.stopPropagation();
        spinStartY.current = e.touches?.[0]?.clientY ?? e.clientY ?? 0;
    };

    const handleCarouselTouchEnd = (e) => {
        e.stopPropagation();
        if (spinStartY.current === null) return;
        const endY = e.changedTouches?.[0]?.clientY ?? e.clientY ?? 0;
        const diff = spinStartY.current - endY;
        if (Math.abs(diff) > 30) {
            if (diff > 0) {
                // Swipe up — next
                setCarouselIndex(prev => Math.min(prev + 1, CATEGORIES.length - VISIBLE_COUNT));
            } else {
                // Swipe down — prev
                setCarouselIndex(prev => Math.max(prev - 1, 0));
            }
        }
        spinStartY.current = null;
    };

    const handleWheel = (e) => {
        e.stopPropagation();
        if (e.deltaY > 0) {
            setCarouselIndex(prev => Math.min(prev + 1, CATEGORIES.length - VISIBLE_COUNT));
        } else {
            setCarouselIndex(prev => Math.max(prev - 1, 0));
        }
    };

    // Category click
    const handleCategoryClick = (cat) => {
        setSelectedCategory(cat);
        setIsOpen(false);
        setCarouselIndex(0);
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

    const fabSize = 60;
    const isOnLeft = fabPos.x < window.innerWidth / 2;

    // Carousel items: 3 visible at a time
    const visibleCategories = CATEGORIES.slice(carouselIndex, carouselIndex + VISIBLE_COUNT);
    const canScrollUp = carouselIndex > 0;
    const canScrollDown = carouselIndex < CATEGORIES.length - VISIBLE_COUNT;

    return (
        <>
            {/* Backdrop */}
            {isOpen && <div className="widget-backdrop" onClick={() => { setIsOpen(false); setCarouselIndex(0); }} />}

            {/* Carousel Panel */}
            {isOpen && (
                <div
                    className={`widget-carousel-panel ${isOnLeft ? 'panel-right' : 'panel-left'}`}
                    style={{
                        position: 'fixed',
                        zIndex: 100001,
                        top: `${fabPos.y - 20}px`,
                        ...(isOnLeft
                            ? { left: `${fabPos.x + fabSize + 14}px` }
                            : { right: `${window.innerWidth - fabPos.x + 14}px` }),
                    }}
                    onTouchStart={handleCarouselTouchStart}
                    onTouchEnd={handleCarouselTouchEnd}
                    onWheel={handleWheel}
                >
                    {/* Scroll up arrow */}
                    {canScrollUp && (
                        <button
                            className="widget-carousel-arrow up"
                            onClick={(e) => { e.stopPropagation(); setCarouselIndex(prev => Math.max(prev - 1, 0)); }}
                        >
                            <i className="fas fa-chevron-up"></i>
                        </button>
                    )}

                    <div className="widget-carousel-items" ref={carouselRef}>
                        {visibleCategories.map((cat, idx) => (
                            <button
                                key={cat.name}
                                className="widget-carousel-item"
                                onClick={(e) => { e.stopPropagation(); handleCategoryClick(cat); }}
                                style={{ animationDelay: `${idx * 80}ms` }}
                            >
                                <div className="widget-carousel-icon">
                                    <i className={`fas ${cat.icon}`}></i>
                                </div>
                                <span className="widget-carousel-label">{cat.name}</span>
                            </button>
                        ))}
                    </div>

                    {/* Scroll down arrow */}
                    {canScrollDown && (
                        <button
                            className="widget-carousel-arrow down"
                            onClick={(e) => { e.stopPropagation(); setCarouselIndex(prev => Math.min(prev + 1, CATEGORIES.length - VISIBLE_COUNT)); }}
                        >
                            <i className="fas fa-chevron-down"></i>
                        </button>
                    )}

                    {/* Scroll indicator dots */}
                    <div className="widget-carousel-dots">
                        {Array.from({ length: CATEGORIES.length - VISIBLE_COUNT + 1 }).map((_, i) => (
                            <span key={i} className={`widget-carousel-dot ${i === carouselIndex ? 'active' : ''}`} />
                        ))}
                    </div>
                </div>
            )}

            {/* Main FAB — golden glitter, red when open */}
            <button
                className={`widget-fab ${isOpen ? 'expanded' : ''}`}
                style={{ left: fabPos.x, top: fabPos.y }}
                onMouseDown={handleDown}
                onTouchStart={handleDown}
            >
                <img src={SAVIFY_LOGO} alt="S" className="widget-fab-logo" />
                <span className="widget-fab-glitter"></span>
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
