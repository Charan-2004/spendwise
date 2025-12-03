import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { User, Save, Loader2, DollarSign, Globe, Calendar, RefreshCcw } from 'lucide-react';

export default function Profile() {
    const { user, profile: contextProfile, refreshProfile } = useAuth();
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const [profile, setProfile] = useState({
        full_name: '',
        monthly_income: '',
        currency: 'USD',
        avatar_url: '',
        reset_enabled: false,
        reset_day: 1
    });

    useEffect(() => {
        if (contextProfile) {
            setProfile({
                full_name: contextProfile.full_name || '',
                monthly_income: contextProfile.monthly_income || '',
                currency: contextProfile.currency || 'USD',
                avatar_url: contextProfile.avatar_url || '',
                reset_enabled: contextProfile.reset_enabled || false,
                reset_day: contextProfile.reset_day || 1
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
                currency: profile.currency,
                reset_enabled: profile.reset_enabled,
                reset_day: profile.reset_day,
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

    const getCurrencySymbol = (currencyCode) => {
        const symbols = {
            'USD': '$', 'EUR': '€', 'GBP': '£', 'JPY': '¥',
            'INR': '₹', 'CAD': '$', 'AUD': '$', 'CNY': '¥'
        };
        return symbols[currencyCode] || '$';
    };

    return (
        <Layout>
            <h2 className="page-title">Profile Settings</h2>

            <div className="card" style={{ maxWidth: '40rem', margin: '0 auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
                    <div className="avatar" style={{ width: '4rem', height: '4rem', fontSize: '1.5rem' }}>
                        {user?.email?.[0].toUpperCase()}
                    </div>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600', color: 'var(--color-text-primary)' }}>{user?.email}</h3>
                        <p style={{ margin: '0.25rem 0 0', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
                            Member since {new Date(user?.created_at).toLocaleDateString()}
                        </p>
                    </div>
                </div>

                {message.text && (
                    <div className="error-message" style={{
                        background: message.type === 'success' ? '#ECFDF5' : '#FEF2F2',
                        color: message.type === 'success' ? '#047857' : '#B91C1C',
                        borderColor: message.type === 'success' ? '#6EE7B7' : '#FCA5A5'
                    }}>
                        {message.text}
                    </div>
                )}

                {!contextProfile ? (
                    <div style={{ textAlign: 'center', padding: '3rem' }}>
                        <Loader2 className="animate-spin" size={24} style={{ margin: '0 auto 1rem', color: 'var(--color-text-tertiary)' }} />
                        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>Loading profile...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div className="input-group">
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-primary)', fontSize: '0.875rem', fontWeight: '500' }}>Full Name</label>
                            <div style={{ position: 'relative' }}>
                                <User size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-tertiary)' }} />
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

                        <div className="input-group">
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-primary)', fontSize: '0.875rem', fontWeight: '500' }}>Monthly Income</label>
                            <div style={{ position: 'relative' }}>
                                <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-tertiary)', fontWeight: '500' }}>
                                    {getCurrencySymbol(profile.currency)}
                                </span>
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
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-primary)', fontSize: '0.875rem', fontWeight: '500' }}>Currency</label>
                            <div style={{ position: 'relative' }}>
                                <Globe size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-tertiary)', zIndex: 1 }} />
                                <select
                                    className="input-field"
                                    style={{
                                        paddingLeft: '2.5rem',
                                        appearance: 'none',
                                        cursor: 'pointer',
                                        backgroundColor: '#FFFFFF',
                                        color: 'var(--color-text-primary)'
                                    }}
                                    value={profile.currency}
                                    onChange={e => setProfile({ ...profile, currency: e.target.value })}
                                >
                                    <option value="USD">USD ($) - US Dollar</option>
                                    <option value="EUR">EUR (€) - Euro</option>
                                    <option value="GBP">GBP (£) - British Pound</option>
                                    <option value="JPY">JPY (¥) - Japanese Yen</option>
                                    <option value="INR">INR (₹) - Indian Rupee</option>
                                    <option value="CAD">CAD ($) - Canadian Dollar</option>
                                    <option value="AUD">AUD ($) - Australian Dollar</option>
                                    <option value="CNY">CNY (¥) - Chinese Yuan</option>
                                </select>
                                <div style={{
                                    position: 'absolute',
                                    right: '0.75rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    pointerEvents: 'none',
                                    color: 'var(--color-text-tertiary)',
                                    fontSize: '0.75rem'
                                }}>
                                    ▼
                                </div>
                            </div>
                        </div>

                        {/* Budget Reset Section */}
                        <div style={{ padding: '1.5rem', background: 'rgba(99, 102, 241, 0.05)', borderRadius: '0.75rem', border: '1px solid rgba(99, 102, 241, 0.1)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                <RefreshCcw size={20} style={{ color: '#6366f1' }} />
                                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '600', color: 'var(--color-text-primary)' }}>
                                    Monthly Budget Reset
                                </h4>
                            </div>
                            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '1rem', lineHeight: '1.6' }}>
                                Automatically reset your budget tracking on a specific day each month (e.g., payday). Past expenses will be kept in history.
                            </p>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1rem' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={profile.reset_enabled}
                                        onChange={e => setProfile({ ...profile, reset_enabled: e.target.checked })}
                                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                    />
                                    <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>Enable Monthly Reset</span>
                                </label>
                            </div>

                            {profile.reset_enabled && (
                                <div className="input-group">
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-primary)', fontSize: '0.875rem', fontWeight: '500' }}>
                                        Reset Day (1-31)
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <Calendar size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-tertiary)', zIndex: 1 }} />
                                        <select
                                            className="input-field"
                                            style={{
                                                paddingLeft: '2.5rem',
                                                appearance: 'none',
                                                cursor: 'pointer',
                                                backgroundColor: '#FFFFFF',
                                                color: 'var(--color-text-primary)'
                                            }}
                                            value={profile.reset_day}
                                            onChange={e => setProfile({ ...profile, reset_day: parseInt(e.target.value) })}
                                        >
                                            {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                                                <option key={day} value={day}>
                                                    Day {day} of each month
                                                </option>
                                            ))}
                                        </select>
                                        <div style={{
                                            position: 'absolute',
                                            right: '0.75rem',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            pointerEvents: 'none',
                                            color: 'var(--color-text-tertiary)',
                                            fontSize: '0.75rem'
                                        }}>
                                            ▼
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={saving}
                            className="btn btn-primary"
                            style={{ marginTop: '1rem', width: '100%' }}
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="animate-spin" size={16} style={{ marginRight: '0.5rem' }} />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save size={16} style={{ marginRight: '0.5rem' }} />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </form>
                )}
            </div>
        </Layout>
    );
}
