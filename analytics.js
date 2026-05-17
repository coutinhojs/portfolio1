/* ============================================
   VERCEL WEB ANALYTICS INITIALIZATION
   ============================================ */

import { inject } from '@vercel/analytics';

// Initialize Vercel Web Analytics
inject({
    mode: 'auto', // Automatically detect environment (production/development)
    debug: false  // Set to true to see analytics events in console during development
});
