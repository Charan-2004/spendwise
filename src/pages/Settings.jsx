import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { Moon, Sun, Bell, Shield, ChevronRight, Download, CreditCard } from 'lucide-react';
import { expenseService, exportService } from '../services';

export default function Settings() {
    const { user, profile } = useAuth();
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
    const [exporting, setExporting] = useState(false);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    const handleExport = async () => {
        try {
            setExporting(true);
            const expenses = await expenseService.getExpenses(user.id);
            const data = exportService.prepareExpensesForExport(expenses);
            exportService.exportToCSV(data, `financeai_expenses_${new Date().toISOString().split('T')[0]}.csv`);
        } catch (error) {
            console.error('Export failed:', error);
            alert('Failed to export data.');
        } finally {
            setExporting(false);
        }
    };

    const sections = [
        {
            title: 'Appearance',
            items: [
                {
                    icon: theme === 'dark' ? Moon : Sun,
                    label: 'Theme',
                    value: theme === 'dark' ? 'Dark Mode' : 'Light Mode',
                    action: toggleTheme,
                    color: '#6366f1'
                }
            ]
        },
        {
            title: 'Data Management',
            items: [
                {
                    icon: Download,
                    label: 'Export Data',
                    value: 'CSV Format',
                    action: handleExport,
                    loading: exporting,
                    color: '#10b981'
                }
            ]
        },
        {
            title: 'Account',
            items: [
                { icon: Shield, label: 'Email', value: user?.email, action: null, color: '#ec4899' },
                { icon: Bell, label: 'Notifications', value: 'On', action: () => alert('Coming soon!'), color: '#f59e0b' }
            ]
        }
    ];

    return (
        <Layout>
            <h1 className="page-title">Settings</h1>

            <div style={{ display: 'grid', gap: '2rem', maxWidth: '800px' }}>
                {sections.map((section, idx) => (
                    <div key={idx} className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
                        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.02)' }}>
                            <h3 style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                {section.title}
                            </h3>
                        </div>
                        <div>
                            {section.items.map((item, itemIdx) => (
                                <div
                                    key={itemIdx}
                                    onClick={item.action}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '1.25rem 1.5rem',
                                        borderBottom: itemIdx < section.items.length - 1 ? '1px solid var(--border-color)' : 'none',
                                        cursor: item.action ? 'pointer' : 'default',
                                        transition: 'background 0.2s'
                                    }}
                                    className={item.action ? 'hover:bg-white/5' : ''}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{
                                            padding: '0.6rem',
                                            borderRadius: '10px',
                                            background: `${item.color}20`,
                                            color: item.color,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <item.icon size={20} />
                                        </div>
                                        <span style={{ fontWeight: '500', fontSize: '1rem' }}>{item.label}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--color-text-secondary)' }}>
                                        <span style={{ fontSize: '0.9rem' }}>{item.loading ? 'Exporting...' : item.value}</span>
                                        {item.action && <ChevronRight size={18} />}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </Layout>
    );
}
