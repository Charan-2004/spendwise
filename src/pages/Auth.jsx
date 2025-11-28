import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, Sparkles, TrendingUp, Shield, Zap } from 'lucide-react';

export default function Auth() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { signIn, signUp } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (isLogin) {
                const { error } = await signIn({ email, password });
                if (error) throw error;
            } else {
                const { error } = await signUp({
                    email,
                    password,
                    options: {
                        data: { full_name: fullName }
                    }
                });
                if (error) throw error;
            }
        } catch (err) {
            setError(err.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Animated background elements */}
            <div style={{
                position: 'absolute',
                top: '-10%',
                right: '-5%',
                width: '500px',
                height: '500px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '50%',
                filter: 'blur(80px)'
            }} />
            <div style={{
                position: 'absolute',
                bottom: '-10%',
                left: '-5%',
                width: '400px',
                height: '400px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '50%',
                filter: 'blur(80px)'
            }} />

            {/* Left side - Branding */}
            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                padding: '4rem',
                color: 'white',
                position: 'relative',
                zIndex: 1
            }}>
                <div style={{ maxWidth: '500px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                        <div style={{
                            width: '60px',
                            height: '60px',
                            background: 'rgba(255, 255, 255, 0.2)',
                            borderRadius: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backdropFilter: 'blur(10px)'
                        }}>
                            <Sparkles size={32} />
                        </div>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: 0 }}>SpendWise</h1>
                    </div>

                    <p style={{ fontSize: '1.25rem', marginBottom: '3rem', opacity: 0.9, lineHeight: '1.6' }}>
                        Take control of your finances with AI-powered insights and smart budgeting tools.
                    </p>

                    {/* Features */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {[
                            { icon: TrendingUp, title: 'Track Expenses', desc: 'Monitor your spending in real-time' },
                            { icon: Shield, title: 'Secure & Private', desc: 'Your data is encrypted and protected' },
                            { icon: Zap, title: 'AI Advisor', desc: 'Get smart purchase recommendations' }
                        ].map((feature, i) => (
                            <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'start' }}>
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    background: 'rgba(255, 255, 255, 0.2)',
                                    borderRadius: '10px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0
                                }}>
                                    <feature.icon size={20} />
                                </div>
                                <div>
                                    <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.1rem', fontWeight: '600' }}>
                                        {feature.title}
                                    </h3>
                                    <p style={{ margin: 0, opacity: 0.8, fontSize: '0.95rem' }}>
                                        {feature.desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right side - Auth Form */}
            <div style={{
                width: '500px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem',
                position: 'relative',
                zIndex: 1
            }}>
                <div style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '24px',
                    padding: '3rem',
                    width: '100%',
                    maxWidth: '450px',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
                }}>
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1a1a1a', margin: '0 0 0.5rem 0' }}>
                            {isLogin ? 'Welcome Back' : 'Create Account'}
                        </h2>
                        <p style={{ color: '#666', fontSize: '0.95rem', margin: 0 }}>
                            {isLogin ? 'Sign in to continue to your dashboard' : 'Start managing your finances today'}
                        </p>
                    </div>

                    {error && (
                        <div style={{
                            padding: '1rem',
                            background: '#fee',
                            border: '1px solid #fcc',
                            borderRadius: '12px',
                            color: '#c33',
                            fontSize: '0.9rem',
                            marginBottom: '1.5rem',
                            textAlign: 'center'
                        }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {!isLogin && (
                            <div>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    color: '#333',
                                    fontSize: '0.9rem',
                                    fontWeight: '500'
                                }}>
                                    Full Name
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <User size={18} style={{
                                        position: 'absolute',
                                        left: '1rem',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        color: '#999'
                                    }} />
                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        required={!isLogin}
                                        placeholder="John Doe"
                                        style={{
                                            width: '100%',
                                            padding: '0.875rem 1rem 0.875rem 3rem',
                                            border: '2px solid #e5e5e5',
                                            borderRadius: '12px',
                                            fontSize: '1rem',
                                            transition: 'all 0.3s',
                                            outline: 'none',
                                            background: 'white'
                                        }}
                                        onFocus={(e) => e.target.style.borderColor = '#667eea'}
                                        onBlur={(e) => e.target.style.borderColor = '#e5e5e5'}
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <label style={{
                                display: 'block',
                                marginBottom: '0.5rem',
                                color: '#333',
                                fontSize: '0.9rem',
                                fontWeight: '500'
                            }}>
                                Email Address
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={18} style={{
                                    position: 'absolute',
                                    left: '1rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: '#999'
                                }} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    placeholder="you@example.com"
                                    style={{
                                        width: '100%',
                                        padding: '0.875rem 1rem 0.875rem 3rem',
                                        border: '2px solid #e5e5e5',
                                        borderRadius: '12px',
                                        fontSize: '1rem',
                                        transition: 'all 0.3s',
                                        outline: 'none',
                                        background: 'white'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#667eea'}
                                    onBlur={(e) => e.target.style.borderColor = '#e5e5e5'}
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{
                                display: 'block',
                                marginBottom: '0.5rem',
                                color: '#333',
                                fontSize: '0.9rem',
                                fontWeight: '500'
                            }}>
                                Password
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={18} style={{
                                    position: 'absolute',
                                    left: '1rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: '#999'
                                }} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder="••••••••"
                                    style={{
                                        width: '100%',
                                        padding: '0.875rem 1rem 0.875rem 3rem',
                                        border: '2px solid #e5e5e5',
                                        borderRadius: '12px',
                                        fontSize: '1rem',
                                        transition: 'all 0.3s',
                                        outline: 'none',
                                        background: 'white'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#667eea'}
                                    onBlur={(e) => e.target.style.borderColor = '#e5e5e5'}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '1rem',
                                background: loading ? '#999' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '12px',
                                fontSize: '1rem',
                                fontWeight: '600',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                transition: 'all 0.3s',
                                marginTop: '0.5rem',
                                boxShadow: loading ? 'none' : '0 4px 15px rgba(102, 126, 234, 0.4)'
                            }}
                            onMouseEnter={(e) => !loading && (e.target.style.transform = 'translateY(-2px)')}
                            onMouseLeave={(e) => !loading && (e.target.style.transform = 'translateY(0)')}
                        >
                            {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
                        </button>
                    </form>

                    <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                        <button
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setError('');
                            }}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#667eea',
                                cursor: 'pointer',
                                fontSize: '0.95rem',
                                fontWeight: '500',
                                textDecoration: 'underline'
                            }}
                        >
                            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
