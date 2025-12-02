// Auto-categorization service based on expense name keywords
const categoryKeywords = {
    'Food': ['grocery', 'restaurant', 'food', 'lunch', 'dinner', 'breakfast', 'cafe', 'coffee', 'starbucks', 'mcdonalds', 'pizza', 'burger', 'subway', 'kfc', 'dominos', 'meal', 'eat', 'kitchen', 'bakery', 'deli'],
    'Transportation': ['uber', 'lyft', 'gas', 'fuel', 'parking', 'taxi', 'metro', 'bus', 'train', 'flight', 'airline', 'car', 'vehicle', 'transport', 'toll', 'petrol', 'diesel'],
    'Entertainment': ['netflix', 'spotify', 'hulu', 'disney', 'movie', 'cinema', 'game', 'gaming', 'concert', 'music', 'theater', 'entertainment', 'youtube', 'prime', 'subscription', 'stream'],
    'Bills': ['rent', 'electricity', 'water', 'internet', 'wifi', 'phone', 'mobile', 'utility', 'cable', 'insurance', 'mortgage', 'loan', 'payment', 'bill'],
    'Shopping': ['amazon', 'shopping', 'mall', 'clothing', 'clothes', 'shoes', 'walmart', 'target', 'costco', 'shop', 'store', 'retail', 'fashion', 'apparel', 'ebay', 'nike', 'adidas'],
    'Healthcare': ['doctor', 'pharmacy', 'medicine', 'hospital', 'clinic', 'medical', 'health', 'dental', 'dentist', 'prescription', 'drug', 'cvs', 'walgreens'],
    'Education': ['book', 'course', 'tuition', 'school', 'university', 'college', 'education', 'learning', 'class', 'training', 'udemy', 'coursera'],
    'Fitness': ['gym', 'fitness', 'yoga', 'workout', 'sports', 'exercise', 'training', 'membership', 'athletic'],
    'Travel': ['hotel', 'airbnb', 'travel', 'vacation', 'trip', 'booking', 'resort', 'tourism'],
};

/**
 * Suggests a category based on the expense name using keyword matching
 * @param {string} expenseName - The name/title of the expense
 * @returns {string} - Suggested category or 'Other' if no match found
 */
export function suggestCategory(expenseName) {
    if (!expenseName || typeof expenseName !== 'string') {
        return 'Other';
    }

    const name = expenseName.toLowerCase().trim();

    // Check each category's keywords
    for (const [category, keywords] of Object.entries(categoryKeywords)) {
        // Check if any keyword is found in the expense name
        if (keywords.some(keyword => name.includes(keyword))) {
            return category;
        }
    }

    // Default to 'Other' if no match found
    return 'Other';
}

/**
 * Gets all available categories
 * @returns {Array<string>} - Array of category names
 */
export function getCategories() {
    return Object.keys(categoryKeywords);
}

export default {
    suggestCategory,
    getCategories
};
