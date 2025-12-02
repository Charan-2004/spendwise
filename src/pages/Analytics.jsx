import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { expenseService } from '../services';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { formatCurrency, getCurrencySymbol } from '../utils/currency';
import SkeletonLoader from '../components/SkeletonLoader';
import { PieChart as PieIcon, TrendingUp } from 'lucide-react';

const COLORS = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#3b82f6', '#14b8a6'];

export default function Analytics() {
    const { user, profile } = useAuth();
    const [loading, setLoading] = useState(true);
    const [expenses, setExpenses] = useState([]);
    const [timeRange, setTimeRange] = useState('6m'); // 6m, 1y

    useEffect(() => {
        if (user) fetchData();
    }, [user]);

    const fetchData = async () => {
        try {
            const data = await expenseService.getExpenses(user.id);
            setExpenses(data);
        } catch (error) {
            console.error('Error fetching analytics data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Process data for Monthly Trend
    const getMonthlyData = () => {
        const monthly = {};
        const now = new Date();
        const monthsToShow = timeRange === '6m' ? 6 : 12;

        // Initialize last N months
        for (let i = monthsToShow - 1; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = d.toLocaleString('default', { month: 'short', year: '2-digit' });
            monthly[key] = 0;
        }

        expenses.forEach(ex => {
            const d = new Date(ex.date);
            const key = d.toLocaleString('default', { month: 'short', year: '2-digit' });
            if (monthly.hasOwnProperty(key)) {
                monthly[key] += Number(ex.amount);
            }
        });

        return Object.entries(monthly).map(([name, amount]) => ({ name, amount }));
    };

    // Process data for Category Breakdown
    const getCategoryData = () => {
        const categories = {};
        expenses.forEach(ex => {
            if (categories[ex.category]) {
                categories[ex.category] += Number(ex.amount);
            } else {
                categories[ex.category] = Number(ex.amount);
            }
        });

        return Object.entries(categories)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
    };

    const monthlyData = getMonthlyData();
    const categoryData = getCategoryData();
    const currencySymbol = getCurrencySymbol(profile?.currency || 'USD');

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{ background: 'rgba(15, 23, 42, 0.9)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                    <p style={{ margin: 0, fontWeight: 'bold', color: '#fff', fontSize: '0.9rem' }}>{label}</p>
                    <p style={{ margin: '0.25rem 0 0 0', color: '#818cf8', fontWeight: '600' }}>
                        {formatCurrency(payload[0].value, profile?.currency)}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <Layout>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 className="page-title">Analytics</h1>
                    <p style={{ color: 'var(--color-text-secondary)' }}>Deep dive into your spending habits</p>
                </div>
                <div className="glass-panel" style={{ padding: '0.25rem', display: 'flex', gap: '0.25rem', borderRadius: '0.75rem' }}>
                    {['6m', '1y'].map(range => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            style={{
                                background: timeRange === range ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                                color: timeRange === range ? '#6366f1' : 'var(--color-text-secondary)',
                                border: 'none',
                                padding: '0.5rem 1rem',
                                borderRadius: '0.5rem',
                                cursor: 'pointer',
                                fontWeight: '600',
                                fontSize: '0.875rem',
                                transition: 'all 0.2s'
                            }}
                        >
                            {range === '6m' ? '6 Months' : '1 Year'}
                        </button>
                    ))}
                </div>
            </div>

            <div className="dashboard-grid">
                {/* Monthly Trend Chart */}
                <div className="glass-panel" style={{ gridColumn: 'span 2', padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
                        <div style={{ padding: '0.6rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '10px', color: '#6366f1' }}>
                            <TrendingUp size={20} />
                        </div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: 0 }}>Spending Trend</h3>
                    </div>

                    {loading ? (
                        <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <SkeletonLoader type="rect" width="100%" height="250px" />
                        </div>
                    ) : (
                        <div style={{ height: '350px', width: '100%' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                    <XAxis
                                        dataKey="name"
                                        stroke="var(--color-text-secondary)"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        dy={10}
                                    />
                                    <YAxis
                                        stroke="var(--color-text-secondary)"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={val => `${currencySymbol}${val}`}
                                        dx={-10}
                                    />
                                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2 }} />
                                    <Area
                                        type="monotone"
                                        dataKey="amount"
                                        stroke="#6366f1"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorAmount)"
                                        activeDot={{ r: 6, strokeWidth: 0, fill: '#fff' }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

                {/* Category Breakdown */}
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
                        <div style={{ padding: '0.6rem', background: 'rgba(236, 72, 153, 0.1)', borderRadius: '10px', color: '#ec4899' }}>
                            <PieIcon size={20} />
                        </div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: 0 }}>Top Categories</h3>
                    </div>

                    {loading ? (
                        <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <SkeletonLoader type="circle" width="200px" height="200px" />
                        </div>
                    ) : categoryData.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--color-text-secondary)' }}>
                            <p>No spending data yet.</p>
                        </div>
                    ) : (
                        <div style={{ height: '350px', position: 'relative', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ flex: 1, minHeight: '200px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={categoryData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {categoryData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            content={({ active, payload }) => {
                                                if (active && payload && payload.length) {
                                                    return (
                                                        <div style={{ background: 'rgba(15, 23, 42, 0.9)', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                                            <span style={{ color: '#fff', fontWeight: '500' }}>{payload[0].name}: </span>
                                                            <span style={{ color: payload[0].payload.fill }}>{formatCurrency(payload[0].value, profile?.currency)}</span>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Custom Legend */}
                            <div style={{
                                marginTop: '1rem',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.75rem',
                                maxHeight: '150px',
                                overflowY: 'auto',
                                paddingRight: '0.5rem'
                            }}>
                                {categoryData.slice(0, 5).map((entry, index) => (
                                    <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: COLORS[index % COLORS.length] }} />
                                            <span style={{ color: 'var(--color-text-primary)' }}>{entry.name}</span>
                                        </div>
                                        <span style={{ fontWeight: '600', color: 'var(--color-text-primary)' }}>{formatCurrency(entry.value, profile?.currency)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
}
