import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';

export default function Auth() {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const { signIn, signUp } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        setLoading(true);

        try {
            if (isLogin) {
                const { error } = await signIn({ email, password });
                if (error) throw error;
                navigate('/');
            } else {
                const { data, error } = await signUp({
                    email,
                    password,
                    options: {
                        data: { full_name: fullName }
                    }
                });
                if (error) throw error;

                // Check if session is null (implies email confirmation required)
                if (data && !data.session) {
                    setSuccessMsg('Registration successful! Please check your email to verify your account.');
                } else {
                    navigate('/');
                }
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            {/* Background Elements */}
            <div className="auth-bg-blob blob-1"></div>
            <div className="auth-bg-blob blob-2"></div>

            <div className="glass-panel auth-card animate-fade-in">
                <div className="auth-header">
                    <h1 className="auth-title">
                        FinanceAI
                    </h1>
                    <p className="auth-subtitle">
                        {isLogin ? 'Welcome back! Please login to continue.' : 'Create an account to start managing your finances.'}
                    </p>
                </div>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                {successMsg && (
                    <div style={{
                        backgroundColor: 'rgba(34, 197, 94, 0.1)',
                        border: '1px solid rgba(34, 197, 94, 0.2)',
                        color: '#4ade80',
                        padding: '1rem',
                        borderRadius: '0.5rem',
                        marginBottom: '1.5rem',
                        textAlign: 'center'
                    }}>
                        <p style={{ margin: 0, fontWeight: 'bold' }}>Check your email!</p>
                        <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem' }}>{successMsg}</p>
                    </div>
                )}

                {!successMsg && (
                    <form onSubmit={handleSubmit}>
                        {!isLogin && (
                            <div className="input-group">
                                <User className="input-icon" />
                                <input
                                    type="text"
                                    placeholder="Full Name"
                                    className="input-field input-with-icon"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    required
                                />
                            </div>
                        )}

                        <div className="input-group">
                            <Mail className="input-icon" />
                            <input
                                type="email"
                                placeholder="Email Address"
                                className="input-field input-with-icon"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="input-group">
                            <Lock className="input-icon" />
                            <input
                                type="password"
                                placeholder="Password"
                                className="input-field input-with-icon"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary w-full"
                            style={{ marginTop: '1.5rem', width: '100%' }}
                        >
                            {loading ? 'Processing...' : (
                                <>
                                    {isLogin ? 'Sign In' : 'Create Account'}
                                    <ArrowRight style={{ marginLeft: '0.5rem', width: '1rem', height: '1rem' }} />
                                </>
                            )}
                        </button>
                    </form>
                )}

                <div className="auth-footer">
                    <button
                        onClick={() => {
                            setIsLogin(!isLogin);
                            setError('');
                            setSuccessMsg('');
                        }}
                        className="auth-toggle-btn"
                    >
                        {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
                    </button>
                </div>
            </div>
        </div>
    );
}
