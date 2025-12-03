import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { recurringService } from '../services';
import { Plus, Trash2, Calendar, RefreshCw, CheckCircle } from 'lucide-react';
import SkeletonLoader from '../components/SkeletonLoader';
import { formatCurrency } from '../utils/currency';

export default function Recurring() {
    const { user, profile } = useAuth();
    const [rules, setRules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        amount: '',
        category: 'Bills',
        frequency: 'monthly',
        start_date: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        if (user) fetchRules();
    }, [user]);

    const fetchRules = async () => {
        try {
            const data = await recurringService.getRecurringRules(user.id);
            setRules(data);
        } catch (error) {
            console.error('Error fetching rules:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Recurring form submitted with data:', formData);
        try {
            await recurringService.createRecurringRule({
                user_id: user.id,
                ...formData,
                amount: Number(formData.amount)
            });
            console.log('Rule created successfully');
            setShowForm(false);
            setFormData({ ...formData, title: '', amount: '' });
            fetchRules();
        } catch (error) {
            console.error('Error creating recurring rule:', error);
            alert('Failed to create rule');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Stop this recurring expense?')) return;
        try {
            await recurringService.deleteRecurringRule(id);
            fetchRules();
        } catch (error) {
            alert('Failed to delete rule');
        }
    };

    return (
        <Layout>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 className="page-title">Recurring Expenses</h1>
                    <p style={{ color: 'var(--color-text-secondary)' }}>Automate your bills and subscriptions</p>
                </div>
                <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
                    <Plus size={20} />
                    New Rule
                </button>
            </div>

            <div className="dashboard-grid">
                {/* Form Section */}
                {showForm && (
                    <div className="glass-panel" style={{
                        gridColumn: 'span 2',
                        marginBottom: '2rem',
                        background: 'rgba(15, 23, 42, 0.6)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(99, 102, 241, 0.2)',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
                    }}>
                        <h3 style={{
                            marginBottom: '1.5rem',
                            fontSize: '1.5rem',
                            fontWeight: '700',
                            background: 'linear-gradient(135deg, #818cf8, #a78bfa)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>Add Recurring Expense</h3>
                        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                            <div>
                                <label className="form-label">Title</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Netflix"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="form-label">Amount</label>
                                <input
                                    type="number"
                                    placeholder="0.00"
                                    value={formData.amount}
                                    onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="form-label">Category</label>
                                <select
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                >
                                    <option value="Bills">Bills</option>
                                    <option value="Subscriptions">Subscriptions</option>
                                    <option value="Rent">Rent</option>
                                    <option value="Insurance">Insurance</option>
                                </select>
                            </div>
                            <div>
                                <label className="form-label">Frequency</label>
                                <select
                                    value={formData.frequency}
                                    onChange={e => setFormData({ ...formData, frequency: e.target.value })}
                                >
                                    <option value="monthly">Monthly</option>
                                    <option value="weekly">Weekly</option>
                                    <option value="yearly">Yearly</option>
                                </select>
                            </div>
                            <div>
                                <label className="form-label">Start Date</label>
                                <input
                                    type="date"
                                    value={formData.start_date}
                                    onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                                    required
                                />
                            </div>
                            <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    style={{
                                        padding: '0.75rem 1.5rem',
                                        borderRadius: '0.75rem',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        background: 'rgba(255,255,255,0.05)',
                                        color: 'rgba(255,255,255,0.8)',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.background = 'rgba(255,255,255,0.1)';
                                        e.target.style.color = '#fff';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.background = 'rgba(255,255,255,0.05)';
                                        e.target.style.color = 'rgba(255,255,255,0.8)';
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    style={{
                                        padding: '0.75rem 1.5rem',
                                        borderRadius: '0.75rem',
                                        border: 'none',
                                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                        color: '#fff',
                                        fontWeight: '700',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.transform = 'translateY(-2px)';
                                        e.target.style.boxShadow = '0 6px 20px rgba(99, 102, 241, 0.5)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.transform = 'translateY(0)';
                                        e.target.style.boxShadow = '0 4px 15px rgba(99, 102, 241, 0.4)';
                                    }}
                                >
                                    Save Rule
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Rules List */}
                <div style={{ gridColumn: '1 / -1', display: 'grid', gap: '1rem' }}>
                    {loading ? (
                        <>
                            <SkeletonLoader height="80px" />
                            <SkeletonLoader height="80px" />
                        </>
                    ) : rules.length === 0 ? (
                        <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                            <div style={{ width: '64px', height: '64px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                                <RefreshCw size={32} className="text-indigo" />
                            </div>
                            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No Recurring Expenses</h3>
                            <p style={{ color: 'var(--color-text-secondary)' }}>Set up your first automated rule to track bills.</p>
                        </div>
                    ) : (
                        rules.map(rule => (
                            <div key={rule.id} className="glass-panel" style={{
                                padding: '1.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                flexWrap: 'wrap',
                                gap: '1rem'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                    <div style={{
                                        width: '48px',
                                        height: '48px',
                                        borderRadius: '12px',
                                        background: 'rgba(16, 185, 129, 0.1)',
                                        color: '#10b981',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <RefreshCw size={24} />
                                    </div>
                                    <div>
                                        <h4 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.25rem' }}>{rule.title}</h4>
                                        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                <Calendar size={14} /> {rule.frequency}
                                            </span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                <CheckCircle size={14} /> Next: {new Date(rule.next_due_date).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                                    <span style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--color-text-primary)' }}>
                                        {formatCurrency(rule.amount, profile?.currency)}
                                    </span>
                                    <button
                                        onClick={() => handleDelete(rule.id)}
                                        className="btn"
                                        style={{ padding: '0.5rem', color: 'var(--color-text-tertiary)' }}
                                    >
                                        <Trash2 size={20} className="hover:text-red-500 transition-colors" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </Layout>
    );
}
