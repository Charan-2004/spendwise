import React from 'react';
import { Calendar, Tag, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ExpenseItem = ({ expense, onDelete, showCategory = true }) => {
    const { profile } = useAuth();

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: profile?.currency || 'USD'
        }).format(amount);
    };

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem',
            background: 'rgba(255,255,255,0.03)',
            borderRadius: '0.75rem',
            border: '1px solid rgba(255,255,255,0.05)'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                    width: '3rem',
                    height: '3rem',
                    borderRadius: '0.75rem',
                    background: 'rgba(99, 102, 241, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#818cf8'
                }}>
                    <Tag size={20} />
                </div>
                <div>
                    <h4 style={{ margin: 0, fontWeight: '600' }}>{expense.title}</h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.25rem' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Calendar size={12} />
                            {new Date(expense.date).toLocaleDateString()}
                        </span>
                        {showCategory && (
                            <span style={{ fontSize: '0.75rem', padding: '0.1rem 0.5rem', borderRadius: '1rem', background: 'rgba(255,255,255,0.1)' }}>
                                {expense.category}
                            </span>
                        )}
                        {expense.is_recurring && (
                            <span style={{ fontSize: '0.75rem', padding: '0.1rem 0.5rem', borderRadius: '1rem', background: 'rgba(52, 211, 153, 0.1)', color: '#34d399', border: '1px solid rgba(52, 211, 153, 0.2)' }}>
                                Recurring
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <span style={{ fontWeight: 'bold', fontSize: '1.125rem', color: '#f87171' }}>
                    -{formatCurrency(expense.amount)}
                </span>
                {onDelete && (
                    <button
                        onClick={() => onDelete(expense.id)}
                        style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', padding: '0.5rem' }}
                        className="hover:text-red-500 transition-colors"
                        title="Delete Expense"
                    >
                        <Trash2 size={18} />
                    </button>
                )}
            </div>
        </div>
    );
};

export default ExpenseItem;
