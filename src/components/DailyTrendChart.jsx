import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const DailyTrendChart = ({ expenses, currency = 'USD' }) => {
    // Process expenses to get daily totals for current month
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    // Filter expenses for current month
    const monthExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
    });

    // Group by day and sum amounts
    const dailyData = monthExpenses.reduce((acc, expense) => {
        const date = new Date(expense.date);
        const day = date.getDate();
        const dateKey = date.toISOString().split('T')[0];

        if (!acc[dateKey]) {
            acc[dateKey] = {
                day: day,
                date: dateKey,
                amount: 0,
                displayDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            };
        }
        acc[dateKey].amount += Number(expense.amount);
        return acc;
    }, {});

    // Convert to array and sort by date
    const chartData = Object.values(dailyData)
        .sort((a, b) => new Date(a.date) - new Date(b.date));

    if (chartData.length === 0) {
        return (
            <div style={{
                height: '250px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-text-secondary)',
                flexDirection: 'column',
                gap: '0.5rem'
            }}>
                <p style={{ margin: 0, fontSize: '0.875rem' }}>No spending data for this month</p>
            </div>
        );
    }

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    border: '1px solid rgba(99, 102, 241, 0.3)',
                    padding: '0.75rem 1rem',
                    borderRadius: '0.5rem',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                }}>
                    <p style={{ margin: 0, fontWeight: '600', color: 'white', fontSize: '0.875rem' }}>
                        {payload[0].payload.displayDate}
                    </p>
                    <p style={{ margin: '0.25rem 0 0', color: '#6366f1', fontWeight: '700', fontSize: '1rem' }}>
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(payload[0].value)}
                    </p>
                </div>
            );
        }
        return null;
    };

    const getCurrencySymbol = () => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency }).formatToParts(0).find(part => part.type === 'currency')?.value || '$';
    };

    return (
        <div style={{ width: '100%', height: '250px' }}>
            <ResponsiveContainer>
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                    <XAxis
                        dataKey="day"
                        stroke="#94a3b8"
                        style={{ fontSize: '0.75rem' }}
                        tick={{ fill: '#94a3b8' }}
                    />
                    <YAxis
                        stroke="#94a3b8"
                        style={{ fontSize: '0.75rem' }}
                        tick={{ fill: '#94a3b8' }}
                        tickFormatter={(value) => `${getCurrencySymbol()}${value}`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                        type="monotone"
                        dataKey="amount"
                        stroke="#6366f1"
                        strokeWidth={2}
                        fill="url(#colorAmount)"
                        animationDuration={1000}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default DailyTrendChart;
