import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { expenseService } from '../services';
import { Plus, Trash2, Calendar, Tag, DollarSign } from 'lucide-react';
import SkeletonLoader from '../components/SkeletonLoader';
import ExpenseItem from '../components/ExpenseItem';
import { formatCurrency, getCurrencySymbol } from '../utils/currency';
import { formatErrorMessage } from '../utils/errorHandler';
import { EXPENSE_CATEGORIES } from '../utils/constants';

export default function Expenses() {
    const { user, profile } = useAuth();
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [validationErrors, setValidationErrors] = useState({});

    const [formData, setFormData] = useState({
        title: '',
        amount: '',
        category: 'Food',
        date: new Date().toISOString().split('T')[0],
        isRecurring: false
    });

    const categories = EXPENSE_CATEGORIES;

    const currencySymbol = getCurrencySymbol(profile?.currency || 'USD');

    useEffect(() => {
        if (user) fetchExpenses();
    }, [user]);

    const fetchExpenses = async () => {
        try {
            setError(null);
            const data = await expenseService.getExpenses(user.id);
            setExpenses(data);
        } catch (error) {
            const message = formatErrorMessage(error, 'fetching expenses');
            setError(message);
            console.error('Error fetching expenses:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setValidationErrors({});
        setError(null);

        const expenseData = {
            user_id: user.id,
            title: formData.title,
            amount: formData.amount,
            category: formData.category,
            date: formData.date,
            is_recurring: formData.isRecurring
        };

        try {
            const newExpense = await expenseService.createExpense(expenseData);

            // Optimistically add to UI
            setExpenses(prev => [newExpense, ...prev]);

            // Reset form
            setFormData({
                title: '',
                amount: '',
                category: 'Food',
                date: new Date().toISOString().split('T')[0],
                isRecurring: false
            });
        } catch (error) {
            const message = formatErrorMessage(error, 'adding expense');
            setError(message);
            // Parse validation errors if any
            if (error.message && error.message.includes('required')) {
                const errors = {};
                if (error.message.includes('Title')) errors.title = error.message;
                if (error.message.includes('Amount')) errors.amount = error.message;
                if (error.message.includes('Category')) errors.category = error.message;
                setValidationErrors(errors);
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this expense?')) return;

        // Optimistic update
        const backup = [...expenses];
        setExpenses(prev => prev.filter(ex => ex.id !== id));

        try {
            await expenseService.deleteExpense(id, user.id);
        } catch (error) {
            // Rollback on error
            setExpenses(backup);
            const message = formatErrorMessage(error, 'deleting expense');
            setError(message);
        }
    };

    return (
        <Layout>
            <h2 className="page-title">Expenses</h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }} className="lg:grid-cols-3">
                {/* Add Expense Form */}
                <div className="glass-panel" style={{ padding: '1.5rem', height: 'fit-content' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Add New Expense</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>Title</label>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="e.g. Grocery Shopping"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>Amount</label>
                            <div style={{ position: 'relative' }}>
                                <div style={{
                                    position: 'absolute',
                                    left: '1rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: 'var(--color-text-secondary)',
                                    fontWeight: 'bold'
                                }}>
                                    {currencySymbol}
                                </div>
                                <input
                                    type="number"
                                    step="0.01"
                                    className="input-field"
                                    style={{ paddingLeft: '2.5rem' }}
                                    placeholder="0.00"
                                    value={formData.amount}
                                    onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>Category</label>
                            <div style={{ position: 'relative' }}>
                                <select
                                    className="input-field"
                                    style={{
                                        appearance: 'none',
                                        cursor: 'pointer',
                                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                        color: 'var(--color-text-primary)'
                                    }}
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                >
                                    {categories.map(cat => (
                                        <option key={cat} value={cat} style={{ color: 'black' }}>{cat}</option>
                                    ))}
                                </select>
                                <div style={{
                                    position: 'absolute',
                                    right: '1rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    pointerEvents: 'none',
                                    color: 'var(--color-text-secondary)'
                                }}>
                                    ▼
                                </div>
                            </div>
                        </div>

                        <div className="input-group">
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>Date</label>
                            <input
                                type="date"
                                className="input-field"
                                value={formData.date}
                                onChange={e => setFormData({ ...formData, date: e.target.value })}
                                required
                            />
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <input
                                type="checkbox"
                                id="recurring"
                                checked={formData.isRecurring}
                                onChange={e => setFormData({ ...formData, isRecurring: e.target.checked })}
                                style={{ width: '1rem', height: '1rem' }}
                            />
                            <label htmlFor="recurring" style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>Recurring Expense</label>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="btn btn-primary"
                            style={{ width: '100%', marginTop: '1rem' }}
                        >
                            {submitting ? 'Adding...' : (
                                <>
                                    <Plus size={18} style={{ marginRight: '0.5rem' }} />
                                    Add Expense
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Expenses List */}
                <div style={{ gridColumn: 'span 2' }}>
                    <div className="glass-panel" style={{ padding: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Recent Expenses</h3>

                        {loading ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <SkeletonLoader height="4rem" />
                                <SkeletonLoader height="4rem" />
                                <SkeletonLoader height="4rem" />
                                <SkeletonLoader height="4rem" />
                            </div>
                        ) : expenses.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--color-text-secondary)' }}>
                                <p>No expenses found.</p>
                                <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>Add your first expense to get started!</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {expenses.map(expense => (
                                    <ExpenseItem key={expense.id} expense={expense} onDelete={handleDelete} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
}
