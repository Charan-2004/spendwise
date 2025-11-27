import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { TrendingUp, TrendingDown, DollarSign, Calendar, Wallet } from 'lucide-react';
import SkeletonLoader from '../components/SkeletonLoader';
import ExpenseItem from '../components/ExpenseItem';
import SpendingChart from '../components/SpendingChart';

const QUOTES = [
    { text: "Do not save what is left after spending, but spend what is left after saving.", author: "Warren Buffett" },
    { text: "A budget is telling your money where to go instead of wondering where it went.", author: "Dave Ramsey" },
    { text: "Financial freedom is available to those who learn about it and work for it.", author: "Robert Kiyosaki" },
    { text: "It's not how much money you make, but how much money you keep.", author: "Robert Kiyosaki" },
    { text: "Beware of little expenses. A small leak will sink a great ship.", author: "Benjamin Franklin" }
];

export default function Dashboard() {
    const { user, profile } = useAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalExpenses: 0,
        monthlyExpenses: 0,
        monthlyIncome: 0,
        remainingBudget: 0,
        budgetStatus: 'Good',
        recentTransactions: [],
        allExpenses: []
    });
    const [quote, setQuote] = useState(QUOTES[0]);

    useEffect(() => {
        setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
    }, []);

    useEffect(() => {
        if (user) {
            checkAndAddFixedExpenses();
            fetchDashboardData();
        }
    }, [user, profile]); // Re-run when profile changes (e.g. currency update)

    const checkAndAddFixedExpenses = async () => {
        try {
            // Use profile from context if available
            const fixedAmount = profile?.fixed_expenses ? Number(profile.fixed_expenses) : 0;
            if (fixedAmount <= 0) return;

            // 2. Check if fixed expense already exists for this month
            const date = new Date();
            const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).toISOString();
            const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString();

            const { data: existing } = await supabase
                .from('expenses')
                .select('*')
                .eq('user_id', user.id)
                .eq('title', 'Monthly Fixed Expenses')
                .gte('date', firstDay)
                .lte('date', lastDay);

            if (existing && existing.length > 0) return;

            // 3. Add fixed expense if not exists
            await supabase.from('expenses').insert([{
                user_id: user.id,
                title: 'Monthly Fixed Expenses',
                amount: fixedAmount,
                category: 'Bills',
                date: new Date().toISOString().split('T')[0],
                is_recurring: true
            }]);

            // Refresh expenses to show new deduction
            fetchDashboardData();

        } catch (error) {
            console.error('Error processing fixed expenses:', error);
        }
    };

    const fetchDashboardData = async () => {
        try {
            const startOfMonth = new Date();
            startOfMonth.setDate(1);
            startOfMonth.setHours(0, 0, 0, 0);

            const monthlyIncome = Number(profile?.monthly_income || 0);

            // Fetch all expenses
            const fetchPromise = supabase
                .from('expenses')
                .select('*')
                .eq('user_id', user.id)
                .order('date', { ascending: false });

            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Dashboard fetch timed out')), 5000)
            );

            const { data: expenses, error } = await Promise.race([fetchPromise, timeoutPromise]);

            if (error) throw error;

            const total = expenses.reduce((sum, item) => sum + Number(item.amount), 0);
            const monthly = expenses
                .filter(item => new Date(item.date) >= startOfMonth)
                .reduce((sum, item) => sum + Number(item.amount), 0);

            const remaining = monthlyIncome - monthly;

            let status = 'Good';
            if (monthly > monthlyIncome) status = 'Over Budget';
            else if (monthly > monthlyIncome * 0.8) status = 'Tight';

            setStats({
                totalExpenses: total,
                monthlyExpenses: monthly,
                monthlyIncome,
                remainingBudget: remaining,
                budgetStatus: status,
                recentTransactions: expenses.slice(0, 5),
                allExpenses: expenses
            });
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: profile?.currency || 'USD'
        }).format(amount);
    };

    const getStatusColor = (status) => {
        if (status === 'Good') return 'text-green-400';
        if (status === 'Tight') return 'text-yellow-400';
        return 'text-red-400';
    };

    return (
        <Layout>
            <div style={{ marginBottom: '2rem' }}>
                <h1 className="page-title" style={{ marginBottom: '0.5rem' }}>
                    Welcome back, {profile?.full_name?.split(' ')[0] || 'User'}!
                </h1>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.1rem' }}>
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
            </div>

            {/* Motivational Quote Banner */}
            <div className="glass-panel" style={{
                padding: '1rem 1.5rem',
                marginBottom: '1.5rem',
                background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.1) 0%, rgba(124, 58, 237, 0.1) 100%)',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem'
            }}>
                <p style={{ fontStyle: 'italic', color: 'var(--color-text-primary)', fontSize: '1rem', fontWeight: '500', margin: 0 }}>
                    "{quote.text}"
                </p>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontWeight: '600', margin: 0 }}>
                    — {quote.author}
                </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
                <button className="btn btn-primary" onClick={fetchDashboardData}>
                    Refresh Data
                </button>
            </div>

            <div className="dashboard-grid">
                {/* Chart Section - Spans 2 columns on large screens */}
                <div className="glass-panel stat-card" style={{ gridColumn: 'span 2' }}>
                    <h3 className="stat-label">Spending by Category</h3>
                    {loading ? (
                        <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <SkeletonLoader type="circle" width="200px" height="200px" />
                        </div>
                    ) : (
                        <SpendingChart expenses={stats.allExpenses} />
                    )}
                </div>

                {/* Stats Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="glass-panel stat-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <h3 className="stat-label">Monthly Spending</h3>
                                {loading ? (
                                    <SkeletonLoader width="100px" height="2rem" />
                                ) : (
                                    <p className="stat-value text-pink">{formatCurrency(stats.monthlyExpenses)}</p>
                                )}
                            </div>
                            <div style={{ padding: '0.5rem', borderRadius: '0.5rem', background: 'rgba(236, 72, 153, 0.2)', color: '#ec4899' }}>
                                <Calendar size={24} />
                            </div>
                        </div>
                    </div>

                    <div className="glass-panel stat-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <h3 className="stat-label">Remaining Budget</h3>
                                {loading ? (
                                    <SkeletonLoader width="100px" height="2rem" />
                                ) : (
                                    <p className={`stat-value ${stats.remainingBudget >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {formatCurrency(stats.remainingBudget)}
                                    </p>
                                )}
                            </div>
                            <div style={{ padding: '0.5rem', borderRadius: '0.5rem', background: 'rgba(52, 211, 153, 0.2)', color: '#34d399' }}>
                                <Wallet size={24} />
                            </div>
                        </div>
                    </div>

                    <div className="glass-panel stat-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <h3 className="stat-label">Budget Status</h3>
                                {loading ? (
                                    <SkeletonLoader width="80px" height="2rem" />
                                ) : (
                                    <p className={`stat-value ${getStatusColor(stats.budgetStatus)}`}>{stats.budgetStatus}</p>
                                )}
                            </div>
                            <div style={{ padding: '0.5rem', borderRadius: '0.5rem', background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8' }}>
                                <DollarSign size={24} />
                            </div>
                        </div>
                    </div>

                    {/* Motivational Quote */}

                </div>
            </div>

            <div style={{ marginTop: '2rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>Recent Transactions</h3>
                <div className="glass-panel" style={{ overflow: 'hidden', padding: '1rem' }}>
                    {loading ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <SkeletonLoader height="4rem" />
                            <SkeletonLoader height="4rem" />
                            <SkeletonLoader height="4rem" />
                        </div>
                    ) : stats.recentTransactions.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {stats.recentTransactions.map((tx) => (
                                <ExpenseItem key={tx.id} expense={tx} />
                            ))}
                        </div>
                    ) : (
                        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                            No recent transactions found. Start by adding an expense!
                        </div>
                    )}
                </div>
            </div>
        </Layout >
    );
}
