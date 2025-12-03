/**
 * Password validation utility
 */

export const validatePassword = (password) => {
    const checks = {
        minLength: password.length >= 8,
        hasUpperCase: /[A-Z]/.test(password),
        hasLowerCase: /[a-z]/.test(password),
        hasNumber: /[0-9]/.test(password),
        hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    const passedChecks = Object.values(checks).filter(Boolean).length;

    let strength = 'weak';
    let color = '#EF4444'; // red

    if (passedChecks >= 5) {
        strength = 'strong';
        color = '#10B981'; // green
    } else if (passedChecks >= 3) {
        strength = 'medium';
        color = '#F59E0B'; // orange
    }

    return {
        isValid: Object.values(checks).every(Boolean),
        checks,
        strength,
        color,
        message: getPasswordMessage(checks)
    };
};

const getPasswordMessage = (checks) => {
    const failed = [];

    if (!checks.minLength) failed.push('8 characters');
    if (!checks.hasUpperCase) failed.push('uppercase letter');
    if (!checks.hasLowerCase) failed.push('lowercase letter');
    if (!checks.hasNumber) failed.push('number');
    if (!checks.hasSpecialChar) failed.push('special character');

    if (failed.length === 0) return 'Strong password!';
    if (failed.length <= 2) return `Add: ${failed.join(', ')}`;
    return `Password must contain: ${failed.join(', ')}`;
};
