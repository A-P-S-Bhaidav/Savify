import { useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Chart, ArcElement, PieController, LineController, LineElement, PointElement, CategoryScale, LinearScale, Filler, Tooltip } from 'chart.js';
import { chartColors, APP_START_DATE } from '../../utils/helpers';

Chart.register(ArcElement, PieController, LineController, LineElement, PointElement, CategoryScale, LinearScale, Filler, Tooltip);

export default function AnalysisTab({ expenses, currentBudget, appData }) {
    const navigate = useNavigate();
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

    return (
        <div className="analysis-container" id="captureArea">
            {/* Tab Greeting */}
            <div className="tab-greeting">
                <h1>Hello, {appData?.full_name?.split(' ')[0] || 'User'}!</h1>
                <p>Monitoring your progress.</p>
            </div>
            <div className="report-header">
                <h2 className="spending-report-title">Spending Report</h2>
                <button className="detailed-analysis-btn" onClick={() => navigate('/deep-dive')}>
                    <i className="fas fa-chart-bar"></i> Detailed Analysis
                </button>
            </div>

            {/* Pie Chart */}
            <div className="analysis-card-dark">
                <h3>Expense Breakdown</h3>
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
                <div className="watermark">SAVIFY</div>
            </div>

            {/* Trend Line */}
            <div className="analysis-card-dark">
                <h3>SPENDING TREND (LAST 7 DAYS)</h3>
                <div className="chart-wrapper">
                    <canvas ref={lineRef}></canvas>
                </div>
                <div className="trend-subtitle">Tracking daily velocity</div>
                <div className="watermark">SAVIFY</div>
            </div>

            <div className="timestamp-tag" id="chartLastUpdate">
                Updated: {new Date().toLocaleTimeString()}
            </div>
        </div>
    );
}
