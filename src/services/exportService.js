export const exportService = {
    /**
     * Convert JSON data to CSV and trigger download
     * @param {Array} data - Array of objects to export
     * @param {string} filename - Name of the file to save
     */
    exportToCSV: (data, filename = 'export.csv') => {
        if (!data || !data.length) {
            console.warn('No data to export');
            return;
        }

        // Get headers from first object
        const headers = Object.keys(data[0]);

        // Create CSV content
        const csvContent = [
            headers.join(','), // Header row
            ...data.map(row =>
                headers.map(fieldName => {
                    const value = row[fieldName];
                    // Handle strings with commas or quotes
                    if (typeof value === 'string') {
                        return `"${value.replace(/"/g, '""')}"`;
                    }
                    // Format dates
                    if (value instanceof Date) {
                        return value.toISOString();
                    }
                    return value;
                }).join(',')
            )
        ].join('\n');

        // Create blob and download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');

        // Create download URL
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);

        // Trigger download
        document.body.appendChild(link);
        link.click();

        // Cleanup
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    },

    /**
     * Prepare expense data for export (formatting, selecting fields)
     * @param {Array} expenses - Raw expense objects
     */
    prepareExpensesForExport: (expenses) => {
        return expenses.map(ex => ({
            Date: new Date(ex.date).toLocaleDateString(),
            Title: ex.title,
            Amount: ex.amount,
            Category: ex.category,
            Recurring: ex.is_recurring ? 'Yes' : 'No'
        }));
    }
};
