/**
 * Formats a Unix timestamp into a human-readable date string
 * @param {number} timestamp - Unix timestamp in seconds
 * @param {Object} options - Optional formatting options
 * @param {boolean} options.includeTime - Whether to include time in the output (default: false)
 * @param {boolean} options.shortMonth - Whether to use short month format (default: false)
 * @return {string} Formatted date string
 */
export function formatDate(timestamp, options = {}) {
    const { includeTime = false, shortMonth = false } = options;
    
    // If the timestamp is invalid or missing, return a placeholder
    if (!timestamp || isNaN(timestamp)) {
      return 'Invalid date';
    }
    
    // Convert seconds to milliseconds if needed
    const milliseconds = timestamp * (timestamp < 10000000000 ? 1000 : 1);
    const date = new Date(milliseconds);
    
    // Format month
    const monthFormat = shortMonth ? 'short' : 'long';
    
    // Date formatting options
    const dateOptions = {
      year: 'numeric',
      month: monthFormat,
      day: 'numeric',
    };
    
    // Add time options if requested
    if (includeTime) {
      dateOptions.hour = '2-digit';
      dateOptions.minute = '2-digit';
    }
    
    // Use Intl formatter for localization support
    return new Intl.DateTimeFormat('en-US', dateOptions).format(date);
  }
  
  /**
   * Formats a date range from two Unix timestamps
   * @param {number} startTimestamp - Starting Unix timestamp in seconds
   * @param {number} endTimestamp - Ending Unix timestamp in seconds
   * @return {string} Formatted date range string
   */
  export function formatDateRange(startTimestamp, endTimestamp) {
    if (!startTimestamp || !endTimestamp) {
      return 'Invalid date range';
    }
    
    const startDate = formatDate(startTimestamp, { shortMonth: true });
    const endDate = formatDate(endTimestamp, { shortMonth: true });
    
    return `${startDate} - ${endDate}`;
  }
  
  /**
   * Returns a relative time string (e.g. "2 days ago", "in 3 hours")
   * @param {number} timestamp - Unix timestamp in seconds
   * @return {string} Relative time string
   */
  export function getRelativeTime(timestamp) {
    if (!timestamp || isNaN(timestamp)) {
      return 'Invalid date';
    }
    
    // Convert seconds to milliseconds if needed
    const milliseconds = timestamp * (timestamp < 10000000000 ? 1000 : 1);
    const date = new Date(milliseconds);
    
    // Use Intl.RelativeTimeFormat for localized relative time
    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
    const now = new Date();
    const diffInSeconds = Math.floor((date - now) / 1000);
    
    // Convert to appropriate units
    if (Math.abs(diffInSeconds) < 60) {
      return rtf.format(diffInSeconds, 'second');
    } else if (Math.abs(diffInSeconds) < 3600) {
      return rtf.format(Math.floor(diffInSeconds / 60), 'minute');
    } else if (Math.abs(diffInSeconds) < 86400) {
      return rtf.format(Math.floor(diffInSeconds / 3600), 'hour');
    } else if (Math.abs(diffInSeconds) < 2592000) {
      return rtf.format(Math.floor(diffInSeconds / 86400), 'day');
    } else if (Math.abs(diffInSeconds) < 31536000) {
      return rtf.format(Math.floor(diffInSeconds / 2592000), 'month');
    } else {
      return rtf.format(Math.floor(diffInSeconds / 31536000), 'year');
    }
  }