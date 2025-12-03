import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, AlertCircle, Chrome, CheckCircle } from 'lucide-react';
import { validatePassword } from '../utils/passwordValidation';
import TermsModal from '../components/TermsModal';

export default function Auth() {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        fullName: '',
        acceptedTerms: false
    });
    const [passwordValidation, setPasswordValidation] = useState(null);
    const [showTermsModal, setShowTermsModal] = useState(false);
    const [modalType, setModalType] = useState('terms'); // 'terms' or 'privacy'

    const { signIn, signUp, signInWithGoogle } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        // Validate password on signup
        if (!isLogin) {
            const validation = validatePassword(formData.password);
            if (!validation.isValid) {
                setError(validation.message);
                return;
            }
            if (!formData.acceptedTerms) {
                setError('You must accept the terms and conditions');
                return;
            }
        }

        setLoading(true);

        try {
            if (isLogin) {
                const { error } = await signIn({
                    email: formData.email,
                    password: formData.password
                });
                if (error) throw error;
            } else {
                const { error } = await signUp({
                    email: formData.email,
                    password: formData.password,
                    options: {
                        data: { full_name: formData.fullName }
                    }
                });
                if (error) throw error;
                alert('Check your email for the confirmation link!');
            }
            navigate('/');
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            const { error } = await signInWithGoogle();
            if (error) throw error;
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Background Effects */}
            <div style={{
                position: 'absolute',
                top: '-20%',
                left: '-10%',
                width: '600px',
                height: '600px',
                background: 'radial-gradient(circle, rgba(79, 70, 229, 0.15) 0%, transparent 70%)',
                borderRadius: '50%',
                filter: 'blur(40px)'
            }} />
            <div style={{
                position: 'absolute',
                bottom: '-20%',
                right: '-10%',
                width: '600px',
                height: '600px',
                background: 'radial-gradient(circle, rgba(236, 72, 153, 0.15) 0%, transparent 70%)',
                borderRadius: '50%',
                filter: 'blur(40px)'
            }} />

            <div className="glass-panel" style={{
                width: '100%',
                maxWidth: '420px',
                padding: '2.5rem',
                position: 'relative',
                zIndex: 10,
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(20px)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h1 style={{
                        fontSize: '2rem',
                        fontWeight: 'bold',
                        color: 'white',
                        marginBottom: '0.5rem',
                        letterSpacing: '-0.02em'
                    }}>
                        {isLogin ? 'Welcome Back' : 'Create Account'}
                    </h1>
                    <p style={{ color: '#94A3B8' }}>
                        {isLogin ? 'Enter your credentials to access your account' : 'Start your financial journey today'}
                    </p>
                </div>

                {error && (
                    <div style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        color: '#FCA5A5',
                        padding: '0.75rem',
                        borderRadius: '0.5rem',
                        marginBottom: '1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.875rem'
                    }}>
                        <AlertCircle size={16} />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {!isLogin && (
                        <div className="form-group" style={{ margin: 0 }}>
                            <div style={{ position: 'relative' }}>
                                <User size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                                <input
                                    type="text"
                                    placeholder="Full Name"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    required
                                    style={{ paddingLeft: '3rem', background: 'rgba(0,0,0,0.2)', borderColor: 'rgba(255,255,255,0.1)', color: 'white' }}
                                />
                            </div>
                        </div>
                    )}

                    <div className="form-group" style={{ margin: 0 }}>
                        <div style={{ position: 'relative' }}>
                            <Mail size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                            <input
                                type="email"
                                placeholder="Email Address"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                                style={{ paddingLeft: '3rem', background: 'rgba(0,0,0,0.2)', borderColor: 'rgba(255,255,255,0.1)', color: 'white' }}
                            />
                        </div>
                    </div>

                    <div className="form-group" style={{ margin: 0 }}>
                        <div style={{ position: 'relative' }}>
                            <Lock size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                            <input
                                type="password"
                                placeholder="Password"
                                value={formData.password}
                                onChange={(e) => {
                                    setFormData({ ...formData, password: e.target.value });
                                    if (!isLogin) {
                                        setPasswordValidation(validatePassword(e.target.value));
                                    }
                                }}
                                required
                                style={{ paddingLeft: '3rem', background: 'rgba(0,0,0,0.2)', borderColor: 'rgba(255,255,255,0.1)', color: 'white' }}
                            />
                        </div>
                        {!isLogin && passwordValidation && (
                            <div style={{ marginTop: '0.75rem' }}>
                                <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.5rem' }}>
                                    <div style={{ flex: 1, height: '4px', borderRadius: '2px', background: passwordValidation.strength === 'weak' ? passwordValidation.color : '#334155' }} />
                                    <div style={{ flex: 1, height: '4px', borderRadius: '2px', background: passwordValidation.strength === 'medium' || passwordValidation.strength === 'strong' ? passwordValidation.color : '#334155' }} />
                                    <div style={{ flex: 1, height: '4px', borderRadius: '2px', background: passwordValidation.strength === 'strong' ? passwordValidation.color : '#334155' }} />
                                </div>
                                <p style={{ fontSize: '0.8rem', color: passwordValidation.color, margin: 0 }}>
                                    {passwordValidation.message}
                                </p>
                            </div>
                        )}
                    </div>

                    {!isLogin && (
                        <div style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '0.75rem',
                            padding: '1rem',
                            background: 'rgba(99, 102, 241, 0.05)',
                            border: '1px solid rgba(99, 102, 241, 0.2)',
                            borderRadius: '0.75rem',
                            marginTop: '0.5rem'
                        }}>
                            <input
                                type="checkbox"
                                id="terms"
                                checked={formData.acceptedTerms}
                                onChange={(e) => setFormData({ ...formData, acceptedTerms: e.target.checked })}
                                style={{
                                    marginTop: '0.25rem',
                                    cursor: 'pointer',
                                    accentColor: '#6366f1',
                                    width: '18px',
                                    height: '18px'
                                }}
                            />
                            <label htmlFor="terms" style={{
                                fontSize: '0.875rem',
                                color: '#CBD5E1',
                                cursor: 'pointer',
                                userSelect: 'none',
                                flex: 1
                            }}>
                                I accept the{' '}
                                <a
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setModalType('terms');
                                        setShowTermsModal(true);
                                    }}
                                    style={{
                                        color: '#818CF8',
                                        textDecoration: 'underline',
                                        fontWeight: '600'
                                    }}
                                >
                                    Terms & Conditions
                                </a>
                                {' '}and{' '}
                                <a
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setModalType('privacy');
                                        setShowTermsModal(true);
                                    }}
                                    style={{
                                        color: '#818CF8',
                                        textDecoration: 'underline',
                                        fontWeight: '600'
                                    }}
                                >
                                    Privacy Policy
                                </a>
                            </label>
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                        style={{ marginTop: '0.5rem', width: '100%', justifyContent: 'center' }}
                    >
                        {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
                        {!loading && <ArrowRight size={18} />}
                    </button>
                </form>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1.5rem 0' }}>
                    <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
                    <span style={{ color: '#64748B', fontSize: '0.875rem' }}>OR</span>
                    <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
                </div>

                <button
                    type="button"
                    onClick={handleGoogleLogin}
                    className="btn"
                    style={{
                        width: '100%',
                        background: 'white',
                        color: '#0F172A',
                        border: 'none',
                        justifyContent: 'center',
                        gap: '0.75rem'
                    }}
                >
                    <Chrome size={20} color="#DB4437" />
                    Sign in with Google
                </button>

                <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#94A3B8',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            textDecoration: 'underline',
                            textUnderlineOffset: '4px'
                        }}
                    >
                        {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
                    </button>
                </div>
            </div>

            <TermsModal
                isOpen={showTermsModal}
                onClose={() => setShowTermsModal(false)}
                type={modalType}
            />
        </div>
    );
}
