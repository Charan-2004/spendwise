import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { savingsService } from '../services';
import { Plus, Trash2, Target, TrendingUp, DollarSign, X } from 'lucide-react';
import SkeletonLoader from '../components/SkeletonLoader';
import { formatCurrency, getCurrencySymbol } from '../utils/currency';

export default function Savings() {
    const { user, profile } = useAuth();
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        target_amount: '',
        current_amount: '0',
        target_date: '',
        color: '#10b981'
    });

    const currencySymbol = getCurrencySymbol(profile?.currency || 'USD');

    useEffect(() => {
        if (user) fetchGoals();
    }, [user]);

    const fetchGoals = async () => {
        try {
            const data = await savingsService.getGoals(user.id);
            setGoals(data);
        } catch (error) {
            console.error('Error fetching goals:', error);
            setError('Failed to load savings goals');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        try {
            const goalData = {
                user_id: user.id,
                title: formData.title,
                target_amount: formData.target_amount,
                current_amount: formData.current_amount,
                target_date: formData.target_date || null,
                color: formData.color
            };

            const newGoal = await savingsService.createGoal(goalData);
            setGoals(prev => [newGoal, ...prev]);
            setShowAddModal(false);
            setFormData({
                title: '',
                target_amount: '',
                current_amount: '0',
                target_date: '',
                color: '#10b981'
            });
        } catch (error) {
            console.error('Error creating goal:', error);
            setError('Failed to create savings goal');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this goal?')) return;
        try {
            await savingsService.deleteGoal(id);
            setGoals(prev => prev.filter(g => g.id !== id));
        } catch (error) {
            console.error('Error deleting goal:', error);
            setError('Failed to delete savings goal');
        }
    };

    const handleDeposit = async (goal, amount) => {
        const newAmount = Number(goal.current_amount) + Number(amount);
        try {
            const updatedGoal = await savingsService.updateGoal(goal.id, { current_amount: newAmount });
            setGoals(prev => prev.map(g => g.id === goal.id ? updatedGoal : g));
        } catch (error) {
            console.error('Error updating goal:', error);
            alert('Failed to update amount');
        }
    };

    return (
        <Layout>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 className="page-title">Savings Goals</h1>
                    <p style={{ color: 'var(--color-text-secondary)' }}>Track your progress towards financial milestones</p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => setShowAddModal(true)}
                >
                    <Plus size={20} />
                    New Goal
                </button>
            </div>

            {showAddModal && (
                <div style={{
                    position: 'fixed', inset: 0,
                    background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 100
                }}>
                    <div className="glass-panel" style={{ padding: '2rem', width: '100%', maxWidth: '500px', position: 'relative', background: 'var(--color-bg-card)' }}>
                        <button
                            onClick={() => setShowAddModal(false)}
                            style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer' }}
                        >
                            <X size={24} />
                        </button>

                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Create New Goal</h2>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div>
                                <label className="form-label">Goal Title</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Dream Vacation"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    required
                                />
                            </div>

                            <div>
                                <label className="form-label">Target Amount</label>
                                <div style={{ position: 'relative' }}>
                                    <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', fontWeight: 'bold', color: 'var(--color-text-secondary)' }}>
                                        {currencySymbol}
                                    </span>
                                    <input
                                        type="number"
                                        style={{ paddingLeft: '2.5rem' }}
                                        value={formData.target_amount}
                                        onChange={e => setFormData({ ...formData, target_amount: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="form-label">Starting Amount</label>
                                <input
                                    type="number"
                                    value={formData.current_amount}
                                    onChange={e => setFormData({ ...formData, current_amount: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="form-label">Target Date (Optional)</label>
                                <input
                                    type="date"
                                    value={formData.target_date}
                                    onChange={e => setFormData({ ...formData, target_date: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="form-label">Color Theme</label>
                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                    {['#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b'].map(c => (
                                        <div
                                            key={c}
                                            onClick={() => setFormData({ ...formData, color: c })}
                                            style={{
                                                width: '36px', height: '36px', borderRadius: '50%', background: c,
                                                cursor: 'pointer',
                                                border: formData.color === c ? '3px solid white' : '2px solid transparent',
                                                boxShadow: formData.color === c ? `0 0 0 2px ${c}` : 'none',
                                                transition: 'all 0.2s'
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="btn btn-primary"
                                style={{ marginTop: '1rem', width: '100%' }}
                            >
                                {submitting ? 'Creating...' : 'Create Goal'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {loading ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                    <SkeletonLoader height="240px" />
                    <SkeletonLoader height="240px" />
                </div>
            ) : goals.length === 0 ? (
                <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                    <div style={{ width: '64px', height: '64px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                        <Target size={32} className="text-success" style={{ color: '#10b981' }} />
                    </div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>No Savings Goals Yet</h3>
                    <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>Start saving for your dreams today.</p>
                    <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                        Create First Goal
                    </button>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                    {goals.map(goal => {
                        const progress = Math.min(100, (goal.current_amount / goal.target_amount) * 100);
                        return (
                            <div key={goal.id} className="glass-panel" style={{ padding: '1.5rem', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                                <div style={{
                                    position: 'absolute', top: 0, left: 0, width: '100%', height: '6px',
                                    background: goal.color
                                }} />

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                                    <div>
                                        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0 }}>{goal.title}</h3>
                                        {goal.target_date && (
                                            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
                                                Target: {new Date(goal.target_date).toLocaleDateString()}
                                            </p>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => handleDelete(goal.id)}
                                        style={{ background: 'none', border: 'none', color: 'var(--color-text-tertiary)', cursor: 'pointer', padding: '0.25rem' }}
                                        className="hover:text-red-500"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>

                                <div style={{ marginBottom: '2rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '0.75rem' }}>
                                        <span style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--color-text-primary)' }}>
                                            {formatCurrency(goal.current_amount, profile?.currency)}
                                        </span>
                                        <span style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', paddingBottom: '0.25rem' }}>
                                            of {formatCurrency(goal.target_amount, profile?.currency)}
                                        </span>
                                    </div>
                                    <div style={{ width: '100%', height: '10px', background: 'rgba(0,0,0,0.05)', borderRadius: '5px', overflow: 'hidden' }}>
                                        <div style={{ width: `${progress}%`, height: '100%', background: goal.color, transition: 'width 1s ease-out', borderRadius: '5px' }} />
                                    </div>
                                    <div style={{ textAlign: 'right', marginTop: '0.5rem', fontSize: '0.875rem', fontWeight: '600', color: goal.color }}>
                                        {progress.toFixed(1)}%
                                    </div>
                                </div>

                                <div style={{ marginTop: 'auto' }}>
                                    <button
                                        className="btn"
                                        style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)' }}
                                        onClick={() => {
                                            const amount = prompt('Enter amount to deposit:');
                                            if (amount && !isNaN(amount)) handleDeposit(goal, amount);
                                        }}
                                    >
                                        + Add Funds
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </Layout>
    );
}
