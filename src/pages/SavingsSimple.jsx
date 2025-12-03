// Simplified Add Funds Modal Component
// Use this simpler version if you want cleaner, faster UI

import { X } from 'lucide-react';

export const SimpleFundsModal = ({ show, goal, amount, setAmount, onSave, onCancel, currencySymbol }) => {
    if (!show || !goal) return null;

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100
        }}>
            <div style={{
                background: 'var(--color-bg-card)',
                padding: '2rem',
                borderRadius: '1rem',
                width: '90%',
                maxWidth: '400px',
                border: '1px solid var(--border-color)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '600', margin: 0 }}>Add Funds</h3>
                    <button
                        onClick={onCancel}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '0.5rem',
                            color: 'var(--color-text-secondary)'
                        }}
                    >
                        <X size={20} />
                    </button>
                </div>

                <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                    to {goal.title}
                </p>

                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '500' }}>
                        Amount ({currencySymbol})
                    </label>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        autoFocus
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            fontSize: '1rem',
                            border: '1px solid var(--border-color)',
                            borderRadius: '0.5rem',
                            outline: 'none'
                        }}
                    />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                        onClick={onCancel}
                        style={{
                            flex: 1,
                            padding: '0.75rem',
                            borderRadius: '0.5rem',
                            border: '1px solid var(--border-color)',
                            background: 'transparent',
                            cursor: 'pointer',
                            fontWeight: '500'
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onSave}
                        disabled={!amount || Number(amount) <= 0}
                        className="btn btn-primary"
                        style={{
                            flex: 1,
                            padding: '0.75rem',
                            borderRadius: '0.5rem',
                            border: 'none',
                            cursor: amount && Number(amount) > 0 ? 'pointer' : 'not-allowed',
                            fontWeight: '600',
                            opacity: amount && Number(amount) > 0 ? 1 : 0.5
                        }}
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};
