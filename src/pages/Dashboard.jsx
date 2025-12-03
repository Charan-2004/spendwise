import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { expenseService, recurringService, currencyService, budgetService } from '../services';
import { quoteService } from '../services/quoteService';
import { TrendingUp, TrendingDown, Wallet, Globe, Calendar, Plus } from 'lucide-react';
import SkeletonLoader from '../components/SkeletonLoader';
import ExpenseItem from '../components/ExpenseItem';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import { formatCurrency } from '../utils/currency';
import { formatErrorMessage } from '../utils/errorHandler';
import { Link } from 'react-router-dom';

const COLORS = ['#6366f1', '#ec4899', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#64748b'];

export default function Dashboard() {
    const { user, profile } = useAuth();
    const [stats, setStats] = useState({
        income: 0,
        expenses: 0,
        balance: 0,
        recentExpenses: [],
        allExpenses: []
    });
    const [loading, setLoading] = useState(true); // Must start as true
    const [error, setError] = useState(null);
    const [quote, setQuote] = useState(quoteService.getDailyQuote());

    const [displayCurrency, setDisplayCurrency] = useState(null); // Start as null
    const [exchangeRate, setExchangeRate] = useState(1);
    const [availableCurrencies] = useState(currencyService.getAvailableCurrencies());

    useEffect(() => {
        setQuote(quoteService.getDailyQuote());
    }, []);

    // Set display currency from profile when available
    useEffect(() => {
        if (profile?.currency) {
            setDisplayCurrency(profile.currency);
        }
    }, [profile?.currency]);

    useEffect(() => {
        if (user) {
            // checkBudgetReset(); // Disabled for performance
            // checkAndAddFixedExpenses(); // Disabled for performance
            fetchDashboardData();
        }
    }, [user]);

    const checkBudgetReset = async () => {
        try {
            // This will silently fail if database columns don't exist yet
            const wasReset = await budgetService.checkAndProcessReset(user.id);
            if (wasReset) {
                console.log('Budget period was reset');
            }
        } catch (error) {
            // Silent fail - budget reset is optional feature
            console.log('Budget reset not available (run migration to enable)');
        }
    };

    useEffect(() => {
        if (profile?.currency) setDisplayCurrency(profile.currency);
    }, [profile]);

    useEffect(() => {
        const updateRate = async () => {
            if (profile?.currency && displayCurrency !== profile.currency) {
                const rate = await currencyService.convert(1, profile.currency, displayCurrency);
                setExchangeRate(rate);
            } else {
                setExchangeRate(1);
            }
        };
        updateRate();
    }, [displayCurrency, profile]);

    const checkAndAddFixedExpenses = async () => {
        try {
            const processed = await recurringService.processDueExpenses(user.id);
            if (processed > 0) fetchDashboardData();
        } catch (error) {
            console.error('Error checking fixed expenses:', error);
        }
    };

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);
            let expensesData = await expenseService.getExpenses(user.id);

            // Filter by current budget period if reset is enabled
            if (profile?.reset_enabled) {
                const period = await budgetService.getCurrentPeriod(user.id);
                expensesData = budgetService.filterByPeriod(expensesData, period);
            }

            const totalExpenses = expensesData.reduce((sum, item) => sum + Number(item.amount), 0);
            const monthlyIncome = profile?.monthly_income ? Number(profile.monthly_income) : 0;

            setStats({
                income: monthlyIncome,
                expenses: totalExpenses,
                balance: monthlyIncome - totalExpenses,
                recentExpenses: expensesData.slice(0, 5),
                allExpenses: expensesData
            });
        } catch (error) {
            setError(formatErrorMessage(error, 'loading dashboard'));
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteExpense = async (id) => {
        if (!confirm('Delete this expense?')) return;
        try {
            await expenseService.deleteExpense(id, user.id);
            fetchDashboardData();
        } catch (error) {
            alert('Failed to delete expense');
        }
    };

    const formatDisplayAmount = (amount) => {
        const converted = amount * exchangeRate;
        return formatCurrency(converted, displayCurrency);
    };

    // Personalization
    const userName = profile?.full_name || user?.email?.split('@')[0] || 'User';

    // Process data for charts
    const getCategoryData = () => {
        const categoryMap = {};
        stats.allExpenses.forEach(exp => {
            if (categoryMap[exp.category]) {
                categoryMap[exp.category] += Number(exp.amount);
            } else {
                categoryMap[exp.category] = Number(exp.amount);
            }
        });
        return Object.entries(categoryMap)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
    };

    const getMonthlyTrendData = () => {
        const monthly = {};
        const now = new Date();

        // Initialize last 6 months
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = d.toLocaleString('default', { month: 'short' });
            monthly[key] = 0;
        }

        stats.allExpenses.forEach(exp => {
            const d = new Date(exp.date);
            const key = d.toLocaleString('default', { month: 'short' });
            if (monthly.hasOwnProperty(key)) {
                monthly[key] += Number(exp.amount);
            }
        });

        return Object.entries(monthly).map(([name, amount]) => ({ name, amount }));
    };

    const categoryData = getCategoryData();
    const trendData = getMonthlyTrendData();

    return (
        <Layout>
            {/* Header Section */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                marginBottom: '2.5rem',
                flexWrap: 'wrap',
                gap: '1.5rem'
            }}>
                <div>
                    <h1 style={{
                        fontSize: '2.5rem',
                        fontWeight: '700',
                        marginBottom: '0.5rem',
                        color: '#818cf8',
                        letterSpacing: '-0.03em'
                    }}>
                        Welcome back, {userName}
                    </h1>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.1rem', maxWidth: '600px', lineHeight: '1.6' }}>
                        "{quote.text}"
                    </p>
                </div>

                <div className="glass-panel" style={{
                    padding: '0.75rem 1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    borderRadius: '1rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                    <Globe size={18} style={{ color: '#818cf8' }} />
                    <select
                        value={displayCurrency}
                        onChange={(e) => setDisplayCurrency(e.target.value)}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--color-text-primary)',
                            fontWeight: '600',
                            cursor: 'pointer',
                            padding: '0',
                            width: 'auto',
                            boxShadow: 'none',
                            fontSize: '0.95rem'
                        }}
                    >
                        {availableCurrencies.map(c => (
                            <option key={c.code} value={c.code} style={{ color: 'black' }}>
                                {c.code} ({c.symbol})
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            {/* Stats Grid */}
            <div className="stats-grid" style={{ marginBottom: '2rem' }}>
                <div className="stat-card">
                    <div className="stat-icon income"><TrendingUp size={24} /></div>
                    <div>
                        <p className="stat-label">Monthly Income</p>
                        {loading ? <SkeletonLoader width="120px" height="32px" /> : (
                            <p className="stat-value">{formatDisplayAmount(stats.income)}</p>
                        )}
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon expense"><TrendingDown size={24} /></div>
                    <div>
                        <p className="stat-label">Total Expenses</p>
                        {loading ? <SkeletonLoader width="120px" height="32px" /> : (
                            <p className="stat-value">{formatDisplayAmount(stats.expenses)}</p>
                        )}
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon balance"><Wallet size={24} /></div>
                    <div>
                        <p className="stat-label">Balance</p>
                        {loading ? <SkeletonLoader width="120px" height="32px" /> : (
                            <p className="stat-value" style={{ color: stats.balance >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                                {formatDisplayAmount(stats.balance)}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Spending Overview - Dual Chart Layout */}
            <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '600' }}>Spending Overview</h2>
                    <Link to="/analytics" className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                        View Details
                    </Link>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                    {/* Pie Chart - Category Breakdown */}
                    <div className="glass-panel" style={{ padding: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1.5rem' }}>By Category</h3>
                        {loading ? (
                            <div style={{ height: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <SkeletonLoader type="circle" width="200px" height="200px" />
                            </div>
                        ) : categoryData.length === 0 ? (
                            <div style={{ height: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-secondary)' }}>
                                No data yet
                            </div>
                        ) : (
                            <div style={{ height: '280px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={categoryData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={90}
                                            paddingAngle={3}
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
                                                        <div style={{
                                                            background: 'rgba(15, 23, 42, 0.95)',
                                                            border: '1px solid rgba(255,255,255,0.2)',
                                                            borderRadius: '8px',
                                                            padding: '0.75rem 1rem',
                                                            boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                                                        }}>
                                                            <p style={{ margin: 0, fontWeight: '600', color: '#fff', fontSize: '0.9rem' }}>
                                                                {payload[0].name}
                                                            </p>
                                                            <p style={{ margin: '0.25rem 0 0 0', color: '#818cf8', fontWeight: '700', fontSize: '1.1rem' }}>
                                                                {formatCurrency(payload[0].value, displayCurrency)}
                                                            </p>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                            position={{ x: 'auto', y: 'auto' }}
                                            cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </div>

                    {/* Area Chart - Monthly Trend */}
                    <div className="glass-panel" style={{ padding: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1.5rem' }}>Monthly Trend</h3>
                        {loading ? (
                            <div style={{ height: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <SkeletonLoader type="rect" width="100%" height="250px" />
                            </div>
                        ) : (
                            <div style={{ height: '280px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                                        />
                                        <YAxis
                                            stroke="var(--color-text-secondary)"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <Tooltip
                                            formatter={(value) => formatCurrency(value, displayCurrency)}
                                            contentStyle={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="amount"
                                            stroke="#6366f1"
                                            strokeWidth={2}
                                            fillOpacity={1}
                                            fill="url(#colorAmount)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Recent Transactions */}
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Recent Transactions</h3>
                    <Link to="/expenses" style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: '600', fontSize: '0.875rem' }}>
                        View All
                    </Link>
                </div>

                {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <SkeletonLoader height="60px" />
                        <SkeletonLoader height="60px" />
                        <SkeletonLoader height="60px" />
                    </div>
                ) : stats.recentExpenses.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--color-text-secondary)' }}>
                        <div style={{ background: 'rgba(255,255,255,0.05)', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                            <Calendar size={24} />
                        </div>
                        <p>No transactions yet.</p>
                        <Link to="/expenses" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                            <Plus size={16} /> Add First
                        </Link>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {stats.recentExpenses.map(expense => (
                            <ExpenseItem
                                key={expense.id}
                                expense={{
                                    ...expense,
                                    amount: expense.amount * exchangeRate
                                }}
                                onDelete={handleDeleteExpense}
                                currencySymbol={availableCurrencies.find(c => c.code === displayCurrency)?.symbol}
                            />
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
}
