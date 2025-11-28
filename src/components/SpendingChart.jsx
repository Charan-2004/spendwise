import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = ['#6366f1', '#ec4899', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#64748b'];

const SpendingChart = ({ expenses, currency = 'USD' }) => {
    // Process data: Group by category and sum amounts
    const data = expenses.reduce((acc, curr) => {
        const existing = acc.find(item => item.name === curr.category);
        if (existing) {
            existing.value += Number(curr.amount);
        } else {
            acc.push({ name: curr.category, value: Number(curr.amount) });
        }
        return acc;
    }, []);

    // Filter out zero values and sort by value descending
    const chartData = data
        .filter(item => item.value > 0)
        .sort((a, b) => b.value - a.value);

    if (chartData.length === 0) {
        return (
            <div style={{
                height: '300px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-text-secondary)',
                flexDirection: 'column',
                gap: '1rem'
            }}>
                <div style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    border: '2px dashed rgba(255,255,255,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    No Data
                </div>
                <p>Add expenses to see your spending breakdown</p>
            </div>
        );
    }

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}>
                    <p style={{ margin: 0, fontWeight: '600', color: 'white' }}>{payload[0].name}</p>
                    <p style={{ margin: 0, color: '#94a3b8' }}>
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(payload[0].value)}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div style={{ width: '100%', height: '280px' }}>
            <ResponsiveContainer>
                <PieChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={95}
                        paddingAngle={3}
                        dataKey="value"
                        stroke="none"
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                        layout="horizontal"
                        verticalAlign="bottom"
                        align="center"
                        wrapperStyle={{ paddingTop: '10px', fontSize: '0.75rem' }}
                        formatter={(value) => <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{value}</span>}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

export default SpendingChart;
