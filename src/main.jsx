import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { validateEnvironment } from './utils/envValidator.js'

// Validate environment before rendering
if (import.meta.env.PROD) {
    validateEnvironment();
}

console.log('main.jsx executing');
ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)
