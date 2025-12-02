import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import Advisor from './pages/Advisor';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Recurring from './pages/Recurring';
import Savings from './pages/Savings';
import Analytics from './pages/Analytics';

const PrivateRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
            Loading...
        </div>
    );

    return user ? children : <Navigate to="/auth" />;
};

function AppRoutes() {
    const { user } = useAuth();

    return (
        <Routes>
            <Route path="/auth" element={!user ? <Auth /> : <Navigate to="/" />} />
            <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/expenses" element={<PrivateRoute><Expenses /></PrivateRoute>} />
            <Route path="/recurring" element={<PrivateRoute><Recurring /></PrivateRoute>} />
            <Route path="/savings" element={<PrivateRoute><Savings /></PrivateRoute>} />
            <Route path="/analytics" element={<PrivateRoute><Analytics /></PrivateRoute>} />
            <Route path="/advisor" element={<PrivateRoute><Advisor /></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
            <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
            <Route path="*" element={<div>No Routes Active</div>} />
        </Routes>
    );
}

function App() {
    console.log('App component rendering');
    return (
        <Router>
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
        </Router>
    );
}

export default App;
