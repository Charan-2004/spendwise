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
    X
} from 'lucide-react';

export default function Layout({ children }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { user, signOut } = useAuth();
    const location = useLocation();

    const navigation = [
        { name: 'Dashboard', href: '/', icon: LayoutDashboard },
        { name: 'Add Expense', href: '/expenses', icon: PlusCircle },
        { name: 'Purchase Advisor', href: '/advisor', icon: BrainCircuit },
        { name: 'Profile', href: '/profile', icon: User },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <div className="app-container">
            {/* Sidebar - Desktop */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <h1 className="brand-text">
                        FinanceAI
                    </h1>
                </div>

                <nav className="nav-menu">
                    {navigation.map((item) => {
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={`nav-item ${isActive(item.href) ? 'active' : ''}`}
                            >
                                <motion.div
                                    whileHover={{ x: 5 }}
                                    style={{ display: 'flex', alignItems: 'center', width: '100%' }}
                                >
                                    <Icon className="nav-icon" />
                                    <span className="font-medium">{item.name}</span>
                                </motion.div>
                            </Link>
                        );
                    })}
                </nav>

                <div className="user-profile">
                    <div className="user-info">
                        <div className="avatar">
                            {user?.email?.[0].toUpperCase()}
                        </div>
                        <div className="user-email">
                            {user?.email}
                        </div>
                    </div>
                    <button
                        onClick={() => signOut()}
                        className="sign-out-btn"
                    >
                        <LogOut className="nav-icon" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Mobile Header */}
            <div className="mobile-header">
                <h1 className="brand-text" style={{ fontSize: '1.25rem' }}>
                    FinanceAI
                </h1>
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="menu-btn"
                >
                    {isMobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="mobile-menu">
                    <nav className="nav-menu">
                        {navigation.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`nav-item ${isActive(item.href) ? 'active' : ''}`}
                                >
                                    <Icon className="nav-icon" />
                                    <span className="font-medium">{item.name}</span>
                                </Link>
                            );
                        })}
                        <button
                            onClick={() => {
                                signOut();
                                setIsMobileMenuOpen(false);
                            }}
                            className="nav-item"
                            style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer' }}
                        >
                            <LogOut className="nav-icon" />
                            Sign Out
                        </button>
                    </nav>
                </div>
            )}

            {/* Main Content */}
            <main className="main-content">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="content-wrapper"
                    >
                        {children}
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
}
