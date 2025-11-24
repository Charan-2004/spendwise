import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { User, Save, Loader2, DollarSign, Globe } from 'lucide-react';

export default function Profile() {
    const { user, profile: contextProfile, refreshProfile } = useAuth();
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const [profile, setProfile] = useState({
        full_name: '',
        monthly_income: '',
        fixed_expenses: '',
        currency: 'USD',
        avatar_url: ''
    });

    useEffect(() => {
        if (contextProfile) {
            setProfile({
                full_name: contextProfile.full_name || '',
                monthly_income: contextProfile.monthly_income || '',
                fixed_expenses: contextProfile.fixed_expenses || '',
                currency: contextProfile.currency || 'USD',
                avatar_url: contextProfile.avatar_url || ''
            });
        }
    }, [contextProfile]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });

        try {
            const updates = {
                id: user.id,
                full_name: profile.full_name,
                monthly_income: profile.monthly_income,
                fixed_expenses: profile.fixed_expenses,
                currency: profile.currency,
                updated_at: new Date()
            };

            const { error } = await supabase
                .from('profiles')
                .upsert(updates);

            if (error) throw error;

            await refreshProfile(); // Refresh global state
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Error updating profile: ' + error.message });
        } finally {
            setSaving(false);
        }
    };

    return (
        <Layout>
            <h2 className="page-title">Profile Settings</h2>

            <div className="glass-panel" style={{ maxWidth: '40rem', margin: '0 auto', padding: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{
                        width: '5rem',
                        height: '5rem',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #6366f1, #ec4899)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '2rem',
                        fontWeight: 'bold',
                        color: 'white',
                        boxShadow: '0 0 20px rgba(99, 102, 241, 0.3)'
                    }}>
                        {user?.email?.[0].toUpperCase()}
                    </div>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>{user?.email}</h3>
                        <p style={{ margin: 0, color: 'var(--color-text-secondary)' }}>Member since {new Date(user?.created_at).toLocaleDateString()}</p>
                    </div>
                </div>

                {message.text && (
                    <div style={{
                        padding: '1rem',
                        borderRadius: '0.5rem',
                        marginBottom: '1.5rem',
                        background: message.type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        color: message.type === 'success' ? '#22c55e' : '#f87171',
                        border: `1px solid ${message.type === 'success' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
                    }}>
                        {message.text}
                    </div>
                )}

                {!contextProfile ? (
                    <div style={{ textAlign: 'center', padding: '2rem' }}>
                        <Loader2 className="animate-spin" size={32} style={{ margin: '0 auto 1rem', color: 'var(--color-primary)' }} />
                        <p>Loading profile...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div className="input-group">
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-secondary)' }}>Full Name</label>
                            <div style={{ position: 'relative' }}>
                                <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }} />
                                <input
                                    type="text"
                                    className="input-field"
                                    style={{ paddingLeft: '2.5rem' }}
                                    value={profile.full_name}
                                    onChange={e => setProfile({ ...profile, full_name: e.target.value })}
                                    placeholder="Enter your full name"
                                />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div className="input-group">
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-secondary)' }}>Monthly Income</label>
                                <div style={{ position: 'relative' }}>
                                    <DollarSign size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }} />
                                    <input
                                        type="number"
                                        className="input-field"
                                        style={{ paddingLeft: '2.5rem' }}
                                        value={profile.monthly_income}
                                        onChange={e => setProfile({ ...profile, monthly_income: e.target.value })}
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            <div className="input-group">
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-secondary)' }}>Fixed Expenses</label>
                                <div style={{ position: 'relative' }}>
                                    <DollarSign size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }} />
                                    <input
                                        type="number"
                                        className="input-field"
                                        style={{ paddingLeft: '2.5rem' }}
                                        value={profile.fixed_expenses}
                                        onChange={e => setProfile({ ...profile, fixed_expenses: e.target.value })}
                                        placeholder="0.00"
                                        title="This amount will be automatically deducted each month"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="input-group">
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-secondary)' }}>Currency</label>
                            <div style={{ position: 'relative' }}>
                                <Globe size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)', zIndex: 1 }} />
                                <select
                                    className="input-field"
                                    style={{
                                        paddingLeft: '2.5rem',
                                        appearance: 'none',
                                        cursor: 'pointer',
                                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                        color: 'var(--color-text-primary)'
                                    }}
                                    value={profile.currency}
                                    onChange={e => setProfile({ ...profile, currency: e.target.value })}
                                >
                                    <option value="USD" style={{ color: 'black' }}>USD ($) - US Dollar</option>
                                    <option value="EUR" style={{ color: 'black' }}>EUR (€) - Euro</option>
                                    <option value="GBP" style={{ color: 'black' }}>GBP (£) - British Pound</option>
                                    <option value="JPY" style={{ color: 'black' }}>JPY (¥) - Japanese Yen</option>
                                    <option value="INR" style={{ color: 'black' }}>INR (₹) - Indian Rupee</option>
                                    <option value="CAD" style={{ color: 'black' }}>CAD ($) - Canadian Dollar</option>
                                    <option value="AUD" style={{ color: 'black' }}>AUD ($) - Australian Dollar</option>
                                    <option value="CNY" style={{ color: 'black' }}>CNY (¥) - Chinese Yuan</option>
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

                        <button
                            type="submit"
                            disabled={saving}
                            className="btn btn-primary"
                            style={{ marginTop: '1rem' }}
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="animate-spin" style={{ marginRight: '0.5rem' }} />
                                    Saving Changes...
                                </>
                            ) : (
                                <>
                                    <Save size={18} style={{ marginRight: '0.5rem' }} />
                                    Save Profile
                                </>
                            )}
                        </button>
                    </form>
                )}
            </div>
        </Layout>
    );
}
