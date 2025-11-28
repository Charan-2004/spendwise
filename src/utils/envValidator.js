/**
 * Environment Variable Validation
 * Validates all required environment variables are present
 * Call this at app startup to fail fast if misconfigured
 */

const requiredEnvVars = {
    VITE_SUPABASE_URL: {
        description: 'Supabase project URL',
        example: 'https://xxxxx.supabase.co',
        validate: (val) => val?.startsWith('https://') && val.includes('supabase.co')
    },
    VITE_SUPABASE_ANON_KEY: {
        description: 'Supabase anonymous key',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        validate: (val) => val?.startsWith('eyJ') && val.length > 100
    },
    VITE_GOOGLE_AI_API_KEY: {
        description: 'Google AI API key for advisor feature',
        example: 'AIzaSy...',
        required: false, // Optional - app works without advisor
        validate: (val) => !val || val?.startsWith('AIza')
    }
};

export function validateEnvironment() {
    const errors = [];
    const warnings = [];

    for (const [key, config] of Object.entries(requiredEnvVars)) {
        const value = import.meta.env[key];

        // Check if required variable is missing
        if (!value && config.required !== false) {
            errors.push({
                key,
                message: `Missing required environment variable: ${key}`,
                description: config.description,
                example: config.example
            });
            continue;
        }

        // Validate format if present
        if (value && config.validate && !config.validate(value)) {
            errors.push({
                key,
                message: `Invalid format for ${key}`,
                description: config.description,
                example: config.example
            });
        }

        // Check if optional variable is missing
        if (!value && config.required === false) {
            warnings.push({
                key,
                message: `Optional environment variable not set: ${key}`,
                description: config.description
            });
        }
    }

    // Log results
    if (errors.length > 0) {
        console.error('❌ Environment validation failed:');
        errors.forEach(err => {
            console.error(`\n${err.message}`);
            console.error(`Description: ${err.description}`);
            console.error(`Example: ${err.example}`);
        });
        throw new Error('Environment validation failed. Check console for details.');
    }

    if (warnings.length > 0) {
        console.warn('⚠️  Environment warnings:');
        warnings.forEach(warn => {
            console.warn(`${warn.message} - ${warn.description}`);
        });
    }

    console.log('✅ Environment validation passed');

    // Return environment info (without exposing secrets)
    return {
        mode: import.meta.env.MODE,
        dev: import.meta.env.DEV,
        prod: import.meta.env.PROD,
        supabaseConfigured: !!import.meta.env.VITE_SUPABASE_URL,
        aiConfigured: !!import.meta.env.VITE_GOOGLE_AI_API_KEY
    };
}

// Auto-validate in development
if (import.meta.env.DEV) {
    try {
        validateEnvironment();
    } catch (error) {
        // Show prominent error in development
        document.body.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: #1a1a1a;
        color: #ff6b6b;
        padding: 2rem;
        font-family: monospace;
        overflow: auto;
        z-index: 999999;
      ">
        <h1 style="color: #ff6b6b;">⚠️ Environment Configuration Error</h1>
        <pre style="background: #2a2a2a; padding: 1rem; border-radius: 8px; overflow: auto;">
${error.message}

Check your .env file and ensure all required variables are set correctly.
        </pre>
      </div>
    `;
        throw error;
    }
}
