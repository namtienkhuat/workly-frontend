export type RouteLayoutType = 'empty' | '2-column' | '3-column';

export interface RouteLayoutConfig {
    pattern: string;
    layout: RouteLayoutType;
}

/**
 * Routes with 1-column layout (empty screen - no sidebars, centered content)
 * Add specific routes here that should have full-width, centered layout
 * Note: More specific routes (e.g., /company/new) should be added here
 * to override general patterns (e.g., /company) from other route arrays
 */
export const EMPTY_ROUTES: string[] = ['/manage-company', '/company/new'];

/**
 * Routes with 2-column layout (main content + right sidebar)
 * Routes starting with these patterns will get 2-column layout
 */
export const TWO_COLUMN_ROUTES: string[] = ['/company', '/company/', '/profile'];

/**
 * Routes with 3-column layout (left sidebar + main content + right sidebar)
 * Routes starting with these patterns will get 3-column layout
 */
export const THREE_COLUMN_ROUTES: string[] = ['/', '/feed'];
