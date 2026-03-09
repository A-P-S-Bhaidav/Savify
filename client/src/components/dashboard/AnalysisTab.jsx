import { useEffect, useRef, useMemo } from 'react';
import { Chart, ArcElement, PieController, LineController, LineElement, PointElement, CategoryScale, LinearScale, Filler, Tooltip } from 'chart.js';
import { chartColors, APP_START_DATE } from '../../utils/helpers';

Chart.register(ArcElement, PieController, LineController, LineElement, PointElement, CategoryScale, LinearScale, Filler, Tooltip);

export default function AnalysisTab({ expenses, currentBudget }) {
    const pieRef = useRef(null);
    const lineRef = useRef(null);
    const pieChartRef = useRef(null);
    const lineChartRef = useRef(null);

    const filteredExpenses = useMemo(() => {
        return (expenses || []).filter(exp => new Date(exp.created_at) >= APP_START_DATE);
    }, [expenses]);

    const { totalSpent, pieLabels, pieData } = useMemo(() => {
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

    // Daily totals for trend line
    const { dayLabels, dailyData } = useMemo(() => {
        const dailyTotals = {};
        const last7Days = [];
        const dayLabels = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date(); d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            last7Days.push(dateStr);
            dayLabels.push(d.toLocaleDateString('en-US', { weekday: 'short' }));
            dailyTotals[dateStr] = 0;
        }
        filteredExpenses.forEach(exp => {
            const dateStr = new Date(exp.created_at).toISOString().split('T')[0];
            if (Object.prototype.hasOwnProperty.call(dailyTotals, dateStr)) dailyTotals[dateStr] += exp.amount;
        });
        return { dayLabels, dailyData: last7Days.map(d => dailyTotals[d]) };
    }, [filteredExpenses]);

    useEffect(() => {
        // Pie chart
        if (pieRef.current) {
            if (pieChartRef.current) pieChartRef.current.destroy();
            pieChartRef.current = new Chart(pieRef.current.getContext('2d'), {
                type: 'pie',
                data: {
                    labels: pieLabels.length > 0 ? pieLabels : ['No data'],
                    datasets: [{
                        data: pieData.length > 0 ? pieData : [1],
                        backgroundColor: pieData.length > 0 ? chartColors : ['#333'],
                        borderWidth: 1,
                        borderColor: '#0A0A0A'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } }
                }
            });
        }

        // Line chart
        if (lineRef.current) {
            if (lineChartRef.current) lineChartRef.current.destroy();
            lineChartRef.current = new Chart(lineRef.current.getContext('2d'), {
                type: 'line',
                data: {
                    labels: dayLabels,
                    datasets: [{
                        label: 'Spending',
                        data: dailyData,
                        borderColor: '#D4AF37',
                        backgroundColor: 'rgba(212, 175, 55, 0.1)',
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#999' } },
                        x: { grid: { display: false }, ticks: { color: '#999' } }
                    },
                    plugins: { legend: { display: false } }
                }
            });
        }

        return () => {
            if (pieChartRef.current) pieChartRef.current.destroy();
            if (lineChartRef.current) lineChartRef.current.destroy();
        };
    }, [pieLabels, pieData, dayLabels, dailyData]);

    const budgetUsed = currentBudget > 0 ? ((totalSpent / currentBudget) * 100).toFixed(1) : 0;

    return (
        <div className="analysis-container" id="captureArea">
            <div className="report-header">
                <h2 style={{ fontFamily: 'var(--font-secondary)' }}>
                    <i className="fas fa-chart-pie" style={{ marginRight: 10, color: 'var(--color-gold)' }}></i>
                    Spending Analysis
                </h2>
                <button className="download-btn" onClick={() => {
                    if (typeof window.html2canvas !== 'undefined') {
                        window.html2canvas(document.getElementById('captureArea'), { backgroundColor: null, scale: 2 }).then(canvas => {
                            const link = document.createElement('a');
                            link.download = `Savify-Report-${Date.now()}.png`;
                            link.href = canvas.toDataURL('image/png');
                            link.click();
                        });
                    }
                }}>
                    <i className="fas fa-download"></i> Download Report
                </button>
            </div>

            {/* Pie Chart */}
            <div className="analysis-card-dark">
                <h3>Spending Breakdown</h3>
                <div className="chart-wrapper">
                    <canvas ref={pieRef}></canvas>
                </div>
                <div className="chart-legend-grid" id="chartLegend">
                    {pieLabels.map((label, index) => {
                        const amount = pieData[index];
                        const percent = totalSpent > 0 ? ((amount / totalSpent) * 100).toFixed(1) : 0;
                        const color = chartColors[index % chartColors.length];
                        return (
                            <div className="legend-item" key={label}>
                                <span className="legend-dot" style={{ background: color }}></span>
                                <span>{label}: <strong>{percent}%</strong></span>
                            </div>
                        );
                    })}
                </div>
                <div className="watermark">Savify</div>
            </div>

            {/* Trend Line */}
            <div className="analysis-card-dark">
                <h3>7-Day Spending Trend</h3>
                <div className="chart-wrapper">
                    <canvas ref={lineRef}></canvas>
                </div>
                <div className="watermark">Savify</div>
            </div>

            {/* Quick Stats */}
            <div className="card" style={{ marginTop: '1rem' }}>
                <h3><i className="fas fa-info-circle" style={{ marginRight: 8, color: 'var(--color-emerald)' }}></i> Quick Stats</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                    <div style={{ padding: '1rem', background: 'var(--color-emerald-light)', borderRadius: 12, textAlign: 'center' }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-stone)', marginBottom: 4 }}>Total Spent</div>
                        <div style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--color-obsidian)' }}>₹{totalSpent.toLocaleString()}</div>
                    </div>
                    <div style={{ padding: '1rem', background: 'var(--color-emerald-light)', borderRadius: 12, textAlign: 'center' }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-stone)', marginBottom: 4 }}>Budget Used</div>
                        <div style={{ fontWeight: 700, fontSize: '1.2rem', color: budgetUsed > 100 ? '#ef4444' : 'var(--color-obsidian)' }}>{budgetUsed}%</div>
                    </div>
                    <div style={{ padding: '1rem', background: 'var(--color-emerald-light)', borderRadius: 12, textAlign: 'center' }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-stone)', marginBottom: 4 }}>Categories</div>
                        <div style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--color-obsidian)' }}>{pieLabels.length}</div>
                    </div>
                    <div style={{ padding: '1rem', background: 'var(--color-emerald-light)', borderRadius: 12, textAlign: 'center' }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-stone)', marginBottom: 4 }}>Transactions</div>
                        <div style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--color-obsidian)' }}>{filteredExpenses.length}</div>
                    </div>
                </div>
            </div>

            <div className="timestamp-tag" id="chartLastUpdate">
                Updated: {new Date().toLocaleTimeString()}
            </div>
        </div>
    );
}
