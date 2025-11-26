export function AppearanceScript() {
    // This script runs before React hydrates to prevent flash
    const scriptContent = `
        (function() {
            try {
                // Get userId from token
                function getUserIdFromToken() {
                    try {
                        var token = localStorage.getItem('workly_token');
                        if (!token) return null;
                        var parts = token.split('.');
                        if (parts.length !== 3) return null;
                        var payload = JSON.parse(atob(parts[1]));
                        return payload.id || payload.userId || payload.sub || null;
                    } catch (e) {
                        return null;
                    }
                }
                
                var userId = getUserIdFromToken();
                
                // If no user is logged in, use default settings
                if (!userId) {
                    document.documentElement.classList.add('font-medium', 'accent-green');
                    setTimeout(function() {
                        document.documentElement.classList.add('hydrated');
                    }, 100);
                    return;
                }
                
                // Load user-specific settings
                var storageKey = 'workly_appearance_' + userId;
                var stored = localStorage.getItem(storageKey);
                var settings = stored ? JSON.parse(stored) : { fontSize: 'medium', accentColor: 'green' };
                
                var root = document.documentElement;
                
                // Apply font size
                root.classList.add('font-' + settings.fontSize);
                
                // Apply accent color
                root.classList.add('accent-' + settings.accentColor);
                
                // Mark as hydrated after a short delay
                setTimeout(function() {
                    root.classList.add('hydrated');
                }, 100);
            } catch (e) {
                console.error('Failed to apply appearance settings:', e);
                // Fallback to defaults
                document.documentElement.classList.add('font-medium', 'accent-green', 'hydrated');
            }
        })();
    `;

    return (
        <script
            dangerouslySetInnerHTML={{ __html: scriptContent }}
            suppressHydrationWarning
        />
    );
}

