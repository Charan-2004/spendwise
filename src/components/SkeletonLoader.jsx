import React from 'react';

const SkeletonLoader = ({ type = 'text', width, height, style = {} }) => {
    const baseStyle = {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '0.5rem',
        /* animation: 'pulse 1.5s infinite ease-in-out', */ // Disabled for performance
        ...style
    };

    if (width) baseStyle.width = width;
    if (height) baseStyle.height = height;

    if (type === 'circle') {
        baseStyle.borderRadius = '50%';
    } else if (type === 'text') {
        baseStyle.height = height || '1rem';
        baseStyle.marginBottom = '0.5rem';
    }

    return (
        <>
            {/* Removed pulse animation for performance */}
            <div style={baseStyle} />
        </>
    );
};

export default SkeletonLoader;
