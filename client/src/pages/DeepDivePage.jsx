import { useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useExpenses } from '../hooks/useExpenses';
import { supabase } from '../config/supabase';
import { parseCurrency, chartColors, APP_START_DATE } from '../utils/helpers';
import { Chart, ArcElement, DoughnutController, Tooltip } from 'chart.js';
import '../styles/dashboard.css';

Chart.register(ArcElement, DoughnutController, Tooltip);

export default function DeepDivePage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { expenses, fetchExpenses } = useExpenses(user?.id);
    const donutRef = useRef(null);
    const donutChartRef = useRef(null);

    useEffect(() => {
        if (user) fetchExpenses();
    }, [user]);

    const filteredExpenses = useMemo(() => {
        return (expenses || []).filter(exp => new Date(exp.created_at) >= APP_START_DATE);
    }, [expenses]);

    const { totalSpent, catTotals, pieLabels, pieData } = useMemo(() => {
        const catTotals = {};
        let totalSpent = 0;
        filteredExpenses.forEach(exp => {
            catTotals[exp.category] = (catTotals[exp.category] || 0) + exp.amount;
            totalSpent += exp.amount;
        });
        return {
            catTotals,
            totalSpent,
            pieLabels: Object.keys(catTotals),
            pieData: Object.values(catTotals)
        };
    }, [filteredExpenses]);

    // Calculate daily stats
    const { bestDay, worstDay, dailyAverage, runwayDays } = useMemo(() => {
        const dailyTotals = {};
        filteredExpenses.forEach(exp => {
            const dateStr = new Date(exp.created_at).toISOString().split('T')[0];
            dailyTotals[dateStr] = (dailyTotals[dateStr] || 0) + exp.amount;
        });

        const days = Object.entries(dailyTotals);
        let bestDay = { date: 'N/A', amount: 0 };
        let worstDay = { date: 'N/A', amount: 0 };
        let totalDays = days.length;
        let dailyAverage = totalDays > 0 ? totalSpent / totalDays : 0;

        if (days.length > 0) {
            const sorted = days.sort((a, b) => a[1] - b[1]);
            bestDay = { date: sorted[0][0], amount: sorted[0][1] };
            worstDay = { date: sorted[sorted.length - 1][0], amount: sorted[sorted.length - 1][1] };
        }

        // Runway: how many days left until budget exhausted
        // Read budget from localStorage or use a default
        let budget = 0;
        try {
            const storedBudget = localStorage.getItem('savify_deep_dive_budget');
            budget = storedBudget ? parseFloat(storedBudget) : 0;
        } catch { }

        const remaining = budget - totalSpent;
        const runwayDays = dailyAverage > 0 ? Math.max(0, Math.floor(remaining / dailyAverage)) : 0;

        return { bestDay, worstDay, dailyAverage, runwayDays };
    }, [filteredExpenses, totalSpent]);

    // Fetch budget from user_applications
    useEffect(() => {
        if (!user) return;
        const fetchBudget = async () => {
            const { data } = await supabase
                .from('user_applications')
                .select('weekly_spending, current_weekly_spent')
                .eq('user_id', user.id)
                .maybeSingle();
            if (data) {
                localStorage.setItem('savify_deep_dive_budget', parseCurrency(data.weekly_spending));
            }
        };
        fetchBudget();
    }, [user]);

    // Donut chart
    useEffect(() => {
        if (!donutRef.current) return;
        if (donutChartRef.current) donutChartRef.current.destroy();

        donutChartRef.current = new Chart(donutRef.current.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: pieLabels.length > 0 ? pieLabels : ['No data'],
                datasets: [{
                    data: pieData.length > 0 ? pieData : [1],
                    backgroundColor: pieData.length > 0 ? chartColors : ['#333'],
                    borderWidth: 2,
                    borderColor: '#0A0A0A',
                    cutout: '65%',
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (ctx) => `${ctx.label}: ₹${ctx.raw.toLocaleString()}`
                        }
                    }
                }
            }
        });

        return () => {
            if (donutChartRef.current) donutChartRef.current.destroy();
        };
    }, [pieLabels, pieData]);

    const formatDate = (dateStr) => {
        if (dateStr === 'N/A') return 'N/A';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });
    };

    const handleDownload = () => {
        const captureArea = document.getElementById('deepDiveCapture');
        if (captureArea && typeof window.html2canvas !== 'undefined') {
            window.html2canvas(captureArea, { backgroundColor: '#f8f5f0', scale: 2 }).then(canvas => {
                const link = document.createElement('a');
                link.download = `Savify-DeepDive-${Date.now()}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
            });
        } else {
            // Fallback: share via native share API
            if (navigator.share) {
                navigator.share({ title: 'My Savify Deep Dive Report', text: 'Check out my spending analysis!' });
            }
        }
    };

    const budgetVal = parseFloat(localStorage.getItem('savify_deep_dive_budget') || '0');
    const remaining = budgetVal - totalSpent;
    const budgetExhausted = remaining <= 0;

    return (
        <div className="dashboard-body" style={{ minHeight: '100vh' }}>
            <div className="deep-dive-container" id="deepDiveCapture">
                {/* Header */}
                <div className="deep-dive-header">
                    <button className="deep-dive-back" onClick={() => navigate('/dashboard')}>
                        <i className="fas fa-arrow-left"></i>
                    </button>
                    <div className="deep-dive-title">
                        <h1>Deep Dive</h1>
                        <p>Financial Forensics</p>
                    </div>
                    <button className="deep-dive-download" onClick={handleDownload}>
                        <i className="fas fa-download"></i>
                    </button>
                </div>

                {/* Runway Prediction */}
                <div className="runway-card">
                    <span className="runway-label">RUNWAY PREDICTION</span>
                    <div className={`runway-days ${budgetExhausted ? 'exhausted' : ''}`}>
                        {budgetExhausted ? '0' : runwayDays} Days
                    </div>
                    <p className="runway-subtitle">
                        {budgetExhausted ? 'Budget exhausted' : `${runwayDays} days of budget remaining`}
                    </p>
                    <div className="runway-divider"></div>
                    <div className="runway-average">
                        <span>Overall Daily Average</span>
                        <span className="runway-average-value">₹{Math.round(dailyAverage).toLocaleString()}</span>
                    </div>
                </div>

                {/* Best / Worst Day */}
                <div className="best-worst-row">
                    <div className="best-worst-card">
                        <div className="best-worst-emoji best">😊</div>
                        <span className="best-worst-label">BEST DAY (LOWEST)</span>
                        <div className="best-worst-amount best">₹{bestDay.amount.toLocaleString()}</div>
                        <span className="best-worst-date">{formatDate(bestDay.date)}</span>
                    </div>
                    <div className="best-worst-card">
                        <div className="best-worst-emoji worst">😟</div>
                        <span className="best-worst-label">WORST DAY (HIGHEST)</span>
                        <div className="best-worst-amount worst">₹{worstDay.amount.toLocaleString()}</div>
                        <span className="best-worst-date">{formatDate(worstDay.date)}</span>
                    </div>
                </div>

                {/* Spending Distribution Donut */}
                <div className="spending-distribution-card">
                    <h3>Spending Distribution</h3>
                    <div className="donut-wrapper">
                        <canvas ref={donutRef}></canvas>
                    </div>
                    <div className="donut-legend">
                        {pieLabels.map((label, index) => {
                            const amount = pieData[index];
                            const color = chartColors[index % chartColors.length];
                            return (
                                <div className="donut-legend-item" key={label}>
                                    <span className="legend-dot" style={{ background: color }}></span>
                                    <span>{label}</span>
                                    <span className="donut-legend-amount">₹{amount.toLocaleString()}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
