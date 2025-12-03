import { X } from 'lucide-react';

export default function TermsModal({ isOpen, onClose, type }) {
    if (!isOpen) return null;

    const content = type === 'terms' ? TERMS_CONTENT : PRIVACY_CONTENT;

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
        }} onClick={onClose}>
            <div
                className="glass-panel"
                style={{
                    width: '100%',
                    maxWidth: '800px',
                    maxHeight: '80vh',
                    background: 'rgba(15, 23, 42, 0.95)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '1rem',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div style={{
                    padding: '1.5rem',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <h2 style={{
                        fontSize: '1.5rem',
                        fontWeight: '600',
                        color: 'white',
                        margin: 0
                    }}>
                        {type === 'terms' ? 'Terms & Conditions' : 'Privacy Policy'}
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'rgba(255, 255, 255, 0.1)',
                            border: 'none',
                            borderRadius: '0.5rem',
                            padding: '0.5rem',
                            cursor: 'pointer',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div style={{
                    padding: '1.5rem',
                    overflowY: 'auto',
                    flex: 1,
                    color: '#94A3B8',
                    lineHeight: '1.6'
                }}>
                    <div dangerouslySetInnerHTML={{ __html: content }} />
                </div>

                {/* Footer */}
                <div style={{
                    padding: '1.5rem',
                    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    justifyContent: 'flex-end'
                }}>
                    <button
                        onClick={onClose}
                        className="btn btn-primary"
                        style={{ minWidth: '120px' }}
                    >
                        I Understand
                    </button>
                </div>
            </div>
        </div>
    );
}

// SpendWise Terms & Conditions
const TERMS_CONTENT = `
<h3 style="color: white; margin-top: 0;">SpendWise — Terms & Conditions</h3>
<p><strong>Last Updated:</strong> December 2024</p>

<p>Welcome to SpendWise ("App", "we", "us"). By creating an account, accessing, or using SpendWise, you agree to the following Terms & Conditions. If you do not agree, please do not use the App.</p>

<h4 style="color: white; margin-top: 1.5rem;">1. Use of the App</h4>
<ul>
  <li>SpendWise is a personal finance and expense-management tool.</li>
  <li>You must be at least 13 years old to use the App.</li>
  <li>You agree not to misuse the App, attempt unauthorized access, or engage in illegal activity using the App.</li>
</ul>

<h4 style="color: white; margin-top: 1.5rem;">2. Financial Disclaimer</h4>
<ul>
  <li>SpendWise provides insights, summaries, AI-based recommendations, and budgeting suggestions for informational purposes only.</li>
  <li>SpendWise does not provide professional financial, investment, or legal advice.</li>
  <li>You are responsible for financial decisions you make based on the App.</li>
</ul>

<h4 style="color: white; margin-top: 1.5rem;">3. User Account</h4>
<ul>
  <li>You are responsible for keeping your login details secure.</li>
  <li>You agree that information you enter (expenses, income, goals, etc.) is accurate.</li>
</ul>

<h4 style="color: white; margin-top: 1.5rem;">4. Data Ownership</h4>
<ul>
  <li>You own the data you enter into SpendWise.</li>
  <li>We do not sell your data to any third party.</li>
  <li>We may use anonymized/non-identifiable data to improve the App.</li>
</ul>

<h4 style="color: white; margin-top: 1.5rem;">5. App Updates</h4>
<ul>
  <li>We may add, remove, or modify features at any time without prior notice.</li>
</ul>

<h4 style="color: white; margin-top: 1.5rem;">6. Limitation of Liability</h4>
<ul>
  <li>SpendWise is provided "as-is" without warranties of any kind.</li>
  <li>We are not responsible for financial losses, decisions, or damages resulting from using the App.</li>
  <li>We do not guarantee uninterrupted or error-free service.</li>
</ul>

<h4 style="color: white; margin-top: 1.5rem;">7. Third-Party Services</h4>
<ul>
  <li>If SpendWise uses optional third-party tools (analytics, backups, etc.), we are not responsible for their content or actions.</li>
</ul>

<h4 style="color: white; margin-top: 1.5rem;">8. Termination</h4>
<ul>
  <li>We may suspend or terminate your access if you violate these terms or misuse the App.</li>
</ul>

<h4 style="color: white; margin-top: 1.5rem;">9. Governing Law</h4>
<ul>
  <li>These Terms are governed by the laws of India, unless your region requires otherwise.</li>
</ul>

<h4 style="color: white; margin-top: 1.5rem;">10. Contact Us</h4>
<p>For any concerns:<br/>
📧 <a href="mailto:kycharan3@gmail.com" style="color: #818CF8;">kycharan3@gmail.com</a></p>
`;

const PRIVACY_CONTENT = `
<h3 style="color: white; margin-top: 0;">SpendWise — Privacy Policy</h3>
<p><strong>Last Updated:</strong> December 2024</p>

<p>This Privacy Policy explains how SpendWise ("we", "us") collects, uses, and protects your information. By using the App, you agree to the practices described below.</p>

<h4 style="color: white; margin-top: 1.5rem;">1. Information We Collect</h4>

<p><strong>1.1 Information You Provide</strong></p>
<ul>
  <li>Expense details</li>
  <li>Income data</li>
  <li>Savings goals</li>
  <li>Recurring billing entries</li>
  <li>What you ask the AI Advisor</li>
  <li>Profile information (name, email, etc., if provided)</li>
</ul>

<p><strong>1.2 Automatically Collected Data</strong></p>
<ul>
  <li>Device information</li>
  <li>App usage analytics</li>
  <li>Diagnostic/crash logs</li>
</ul>

<p><strong>We do NOT collect:</strong></p>
<ul>
  <li>Bank account passwords</li>
  <li>UPI PINs</li>
  <li>Card numbers</li>
</ul>

<h4 style="color: white; margin-top: 1.5rem;">2. How We Use Your Information</h4>
<p>We use your data to:</p>
<ul>
  <li>Display your dashboard summary</li>
  <li>Track expenses and savings</li>
  <li>Provide insights & AI Advisor suggestions</li>
  <li>Improve app performance and user experience</li>
  <li>Fix bugs and technical issues</li>
</ul>

<h4 style="color: white; margin-top: 1.5rem;">3. AI Advisor</h4>
<ul>
  <li>When you tell the AI Advisor something (e.g., "I want to buy a new phone"), that information is processed only to generate advice.</li>
  <li>We do not sell or share this input with advertisers or third parties.</li>
</ul>

<h4 style="color: white; margin-top: 1.5rem;">4. Data Security</h4>
<ul>
  <li>We follow reasonable security practices to protect your data.</li>
  <li>However, no system is 100% secure, and we cannot guarantee absolute protection.</li>
</ul>

<h4 style="color: white; margin-top: 1.5rem;">5. Sharing of Information</h4>
<p>We do not sell your data.</p>
<p>We only share information when:</p>
<ul>
  <li>Required by law</li>
  <li>Needed for anonymized analytics</li>
  <li>You choose to connect third-party tools (optional future features)</li>
</ul>

<h4 style="color: white; margin-top: 1.5rem;">6. Your Rights</h4>
<p>You may:</p>
<ul>
  <li>Access your data</li>
  <li>Request deletion</li>
  <li>Correct inaccurate entries</li>
  <li>Withdraw consent for optional features</li>
</ul>
<p>Contact us at kycharan3@gmail.com to request any of the above.</p>

<h4 style="color: white; margin-top: 1.5rem;">7. Data Retention</h4>
<ul>
  <li>We store your data as long as your account is active.</li>
  <li>You may request deletion anytime.</li>
</ul>

<h4 style="color: white; margin-top: 1.5rem;">8. Children's Privacy</h4>
<ul>
  <li>SpendWise is not intended for children under 13.</li>
</ul>

<h4 style="color: white; margin-top: 1.5rem;">9. Changes to This Policy</h4>
<ul>
  <li>We may update this Privacy Policy. Changes will be reflected with a new "Last Updated" date.</li>
</ul>

<h4 style="color: white; margin-top: 1.5rem;">10. Contact Us</h4>
<p>For privacy inquiries:<br/>
📧 <a href="mailto:kycharan3@gmail.com" style="color: #818CF8;">kycharan3@gmail.com</a></p>
`;

