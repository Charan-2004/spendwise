import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    PlusCircle,
    BrainCircuit,
    Target,
    User,
    LogOut,
    Menu,
    X,
    RefreshCw,
    BarChart2,
    Settings
} from 'lucide-react';

export default function Layout({ children }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { user, signOut } = useAuth();
    const location = useLocation();

    const navigation = [
        { name: 'Dashboard', href: '/', icon: LayoutDashboard },
        { name: 'Add Expense', href: '/expenses', icon: PlusCircle },
        { name: 'Recurring', href: '/recurring', icon: RefreshCw },
        { name: 'Savings', href: '/savings', icon: Target },
        { name: 'Analytics', href: '/analytics', icon: BarChart2 },
        { name: 'Purchase Advisor', href: '/advisor', icon: BrainCircuit },
        { name: 'Profile', href: '/profile', icon: User },
        { name: 'Settings', href: '/settings', icon: Settings },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <div className="app-container">
            {/* Sidebar - Desktop */}
            <aside className="sidebar">
                <div style={{ padding: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <h1 style={{
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                        background: 'linear-gradient(to right, #fff, #94a3b8)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        margin: 0
                    }}>
                        FinanceAI
                    </h1>
                </div>

                <nav style={{ flex: 1, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {navigation.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.href);
                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '0.875rem 1rem',
                                    borderRadius: '0.75rem',
                                    textDecoration: 'none',
                                    color: active ? '#fff' : '#94a3b8',
                                    background: active ? 'rgba(79, 70, 229, 0.2)' : 'transparent',
                                    border: active ? '1px solid rgba(79, 70, 229, 0.3)' : '1px solid transparent',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <Icon size={20} style={{ marginRight: '0.75rem', color: active ? '#818cf8' : 'currentColor' }} />
                                <span style={{ fontWeight: active ? 600 : 500 }}>{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div style={{ padding: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: 'rgba(255,255,255,0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 'bold',
                            border: '1px solid rgba(255,255,255,0.2)'
                        }}>
                            {user?.email?.[0].toUpperCase()}
                        </div>
                        <div style={{ marginLeft: '0.75rem', overflow: 'hidden' }}>
                            <p style={{ margin: 0, fontSize: '0.875rem', color: '#fff', fontWeight: 500 }}>User</p>
                            <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                                {user?.email}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => signOut()}
                        style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '0.75rem',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '0.5rem',
                            color: '#cbd5e1',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                        className="hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30"
                    >
                        <LogOut size={18} style={{ marginRight: '0.5rem' }} />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Mobile Header */}
            <div className="mobile-header" style={{
                display: 'none', // Hidden by default, shown via CSS media query
                padding: '1rem',
                background: 'var(--color-bg-secondary)',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'sticky',
                top: 0,
                zIndex: 50
            }}>
                <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#fff', margin: 0 }}>FinanceAI</h1>
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} style={{ background: 'none', border: 'none', color: '#fff' }}>
                    {isMobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 40,
                    background: '#0f172a',
                    padding: '5rem 2rem 2rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem'
                }}>
                    {navigation.map((item) => (
                        <Link
                            key={item.name}
                            to={item.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '1rem',
                                color: isActive(item.href) ? '#818cf8' : '#fff',
                                fontSize: '1.1rem',
                                fontWeight: 500,
                                textDecoration: 'none'
                            }}
                        >
                            <item.icon style={{ marginRight: '1rem' }} />
                            {item.name}
                        </Link>
                    ))}
                    <button
                        onClick={() => {
                            signOut();
                            setIsMobileMenuOpen(false);
                        }}
                        style={{
                            marginTop: 'auto',
                            display: 'flex',
                            alignItems: 'center',
                            padding: '1rem',
                            background: 'none',
                            border: 'none',
                            color: '#ef4444',
                            fontSize: '1.1rem'
                        }}
                    >
                        <LogOut style={{ marginRight: '1rem' }} />
                        Sign Out
                    </button>
                </div>
            )}

            {/* Main Content */}
            <main className="main-content">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                    >
                        {children}
                    </motion.div>
                </AnimatePresence>
            </main>

            <style>{`
                @media (max-width: 768px) {
                    .sidebar { display: none !important; }
                    .mobile-header { display: flex !important; }
                    .app-container { flex-direction: column; }
                    .main-content { padding: 1rem; }
                }
            `}</style>
        </div>
    );
}
