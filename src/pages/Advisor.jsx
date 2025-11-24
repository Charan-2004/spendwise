import { useState } from 'react';
import Layout from '../components/Layout';
import { Brain, CheckCircle, AlertTriangle, XCircle, ShoppingBag, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { GoogleGenerativeAI } from '@google/generative-ai';

export default function Advisor() {
    const { user, profile } = useAuth();
    const [item, setItem] = useState('');
    const [price, setPrice] = useState('');
    const [reason, setReason] = useState('');
    const [analyzing, setAnalyzing] = useState(false);
    const [advice, setAdvice] = useState(null);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState(null);

    const getCurrencySymbol = () => {
        const currency = profile?.currency || 'USD';
        return new Intl.NumberFormat('en-US', { style: 'currency', currency }).formatToParts(0).find(part => part.type === 'currency').value;
    };

    const analyzePurchase = async (e) => {
        e.preventDefault();
        setAnalyzing(true);
        setAdvice(null);
        setSaved(false);
        setError(null);

        try {
            const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
            if (!apiKey) {
                throw new Error("Missing API Key. Please add VITE_GEMINI_API_KEY to your .env file.");
            }

            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

            const prompt = `
                Act as a strict but helpful financial advisor. Analyze this potential purchase:
                Item: ${item}
                Price: ${price} ${profile?.currency || 'USD'}
                Reason: ${reason}

                Provide a JSON response with the following structure (do not use markdown code blocks, just raw JSON):
                {
                    "verdict": "Approved" | "Proceed with Caution" | "Denied",
                    "type": "Necessary" | "Need" | "Luxury",
                    "details": "A 2-3 sentence explanation of why, referencing the specific item and reason.",
                    "alternatives": ["Alternative 1", "Alternative 2"] (optional, suggest cheaper or better options if applicable)
                }
            `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            // Clean up markdown if present
            const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
            const data = JSON.parse(jsonString);

            setAdvice(data);
        } catch (err) {
            console.error("AI Error:", err);
            setError(err.message || "Failed to get advice. Please try again.");
        } finally {
            setAnalyzing(false);
        }
    };

    const addToExpenses = async () => {
        try {
            const { error } = await supabase.from('expenses').insert([
                {
                    user_id: user.id,
                    title: item,
                    amount: price,
                    category: advice.type === 'Necessary' ? 'Essentials' : 'Shopping',
                    date: new Date().toISOString().split('T')[0],
                    is_recurring: false
                }
            ]);

            if (error) throw error;
            setSaved(true);
        } catch (error) {
            alert('Error adding expense: ' + error.message);
        }
    };

    return (
        <Layout>
            <h2 className="page-title">AI Purchase Advisor</h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>

                {/* Input Form */}
                <div className="glass-panel animate-fade-in" style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div style={{ padding: '0.75rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '0.75rem', color: '#6366f1' }}>
                            <Brain size={24} />
                        </div>
                        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold' }}>Analyze Purchase</h3>
                    </div>

                    <form onSubmit={analyzePurchase}>
                        <div className="input-group">
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-secondary)' }}>Item Name</label>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="e.g. Wireless Headphones"
                                value={item}
                                onChange={e => setItem(e.target.value)}
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-secondary)' }}>Price ({getCurrencySymbol()})</label>
                            <input
                                type="number"
                                className="input-field"
                                placeholder="0.00"
                                value={price}
                                onChange={e => setPrice(e.target.value)}
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-secondary)' }}>Why do you want this?</label>
                            <textarea
                                className="input-field"
                                placeholder="e.g. My old ones broke, need for work..."
                                value={reason}
                                onChange={e => setReason(e.target.value)}
                                rows="3"
                                required
                                style={{ resize: 'none' }}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={analyzing}
                            className="btn btn-primary"
                            style={{ width: '100%', marginTop: '1rem' }}
                        >
                            {analyzing ? (
                                <>
                                    <Loader2 className="animate-spin" size={18} style={{ marginRight: '0.5rem' }} />
                                    Analyzing...
                                </>
                            ) : 'Get Real Advice'}
                        </button>
                    </form>
                </div>

                {/* Results Panel */}
                <div>
                    {error && (
                        <div className="error-message animate-fade-in">
                            <AlertTriangle size={18} style={{ display: 'inline', marginRight: '0.5rem' }} />
                            {error}
                        </div>
                    )}

                    {advice ? (
                        <div className="glass-panel animate-fade-in" style={{ padding: '2rem', border: `1px solid ${advice.verdict === 'Approved' ? '#22c55e' : advice.verdict === 'Proceed with Caution' ? '#eab308' : '#ef4444'}` }}>
                            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                                {advice.verdict === 'Approved' && <CheckCircle size={48} color="#22c55e" style={{ marginBottom: '1rem' }} />}
                                {advice.verdict === 'Proceed with Caution' && <AlertTriangle size={48} color="#eab308" style={{ marginBottom: '1rem' }} />}
                                {advice.verdict === 'Denied' && <XCircle size={48} color="#ef4444" style={{ marginBottom: '1rem' }} />}

                                <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem', color: advice.verdict === 'Approved' ? '#22c55e' : advice.verdict === 'Proceed with Caution' ? '#eab308' : '#ef4444' }}>
                                    {advice.verdict}
                                </h3>
                                <span style={{
                                    padding: '0.25rem 0.75rem',
                                    borderRadius: '1rem',
                                    fontSize: '0.75rem',
                                    fontWeight: 'bold',
                                    textTransform: 'uppercase',
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    color: 'var(--color-text-primary)'
                                }}>
                                    {advice.type}
                                </span>
                            </div>

                            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
                                <p style={{ margin: 0, lineHeight: '1.6' }}>{advice.details}</p>
                            </div>

                            {advice.alternatives && advice.alternatives.length > 0 && (
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <h4 style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>Alternatives:</h4>
                                    <ul style={{ paddingLeft: '1.5rem', margin: 0 }}>
                                        {advice.alternatives.map((alt, i) => (
                                            <li key={i} style={{ marginBottom: '0.25rem' }}>{alt}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {!saved ? (
                                <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
                                    <p style={{ marginBottom: '1rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>Did you decide to buy it?</p>
                                    <button
                                        onClick={addToExpenses}
                                        className="btn btn-primary"
                                        style={{ width: '100%', background: 'linear-gradient(135deg, #10b981, #059669)' }}
                                    >
                                        <ShoppingBag size={18} style={{ marginRight: '0.5rem' }} />
                                        Yes, Add to Expenses
                                    </button>
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '0.5rem', color: '#10b981' }}>
                                    <CheckCircle size={20} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '0.5rem' }} />
                                    <span style={{ verticalAlign: 'middle', fontWeight: 'bold' }}>Added to Expenses!</span>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', opacity: 0.5 }}>
                            <Brain size={48} style={{ marginBottom: '1rem' }} />
                            <p>Enter item details to receive AI-powered financial advice.</p>
                        </div>
                    )}
                </div>

            </div>
        </Layout>
    );
}
