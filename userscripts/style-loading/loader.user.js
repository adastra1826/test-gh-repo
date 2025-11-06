// ==UserScript==
// @name         Test external style loading
// @namespace    http://tampermonkey.net/
// @version      2.1
// @description  try to take over the world!
// @updateURL    https://raw.githubusercontent.com/adastra1826/test-gh-repo/refs/heads/main/userscripts/style-loading/loader.user.js
// @downloadURL  https://raw.githubusercontent.com/adastra1826/test-gh-repo/refs/heads/main/userscripts/style-loading/loader.user.js
// @author       You
// @match        *://*/*
// @grant        none
// ==/UserScript==

// Complete production-ready user script// Floating Shadow DOM Widget Template
// Usage: createFloatingWidget(position, cssUrl, content)
// Position: 1-9 (3x3 grid: 1=top-left, 5=center, 9=bottom-right)

(async function() {
    'use strict';
    
    // ========== CONFIGURATION ==========
    const CONFIG = {
        // Your CSS file URL (change this to your GitHub raw URL or jsDelivr CDN)
        CSS_URL: 'https://raw.githubusercontent.com/adastra1826/test-gh-repo/refs/heads/main/userscripts/style-loading/styles.css',
        
        // Grid position (1-9, where 1=top-left, 5=center, 9=bottom-right)
        POSITION: 9, // bottom-right corner
        
        // Fallback CSS (clear error state - red background, white text)
        FALLBACK_CSS: `
            .shadow-widget { 
                background: #ff0000 !important;
                color: white !important;
                padding: 15px !important;
                border-radius: 8px !important;
                font-family: Arial, sans-serif !important;
                font-size: 14px !important;
                border: 2px solid #ffffff !important;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3) !important;
            }
            .error-indicator {
                font-weight: bold !important;
                color: #ffff00 !important;
            }
        `,
        
        // Z-index for floating widget
        Z_INDEX: 10000,
        
        // Margin from screen edges (in pixels)
        MARGIN: 20
    };
    
    // ========== POSITION CALCULATOR ==========
    function getPositionStyles(gridPosition, margin = 20, zIndex = 10000) {
        // Convert 1-9 grid to row/col (0-indexed)
        const row = Math.floor((gridPosition - 1) / 3); // 0, 1, 2
        const col = (gridPosition - 1) % 3; // 0, 1, 2
        
        const styles = {
            position: 'fixed',
            zIndex: zIndex,
            margin: '0',
            pointerEvents: 'auto'
        };
        
        // Vertical positioning
        switch (row) {
            case 0: // Top row (1, 2, 3)
                styles.top = margin + 'px';
                styles.bottom = 'auto';
                break;
            case 1: // Middle row (4, 5, 6)
                styles.top = '50%';
                styles.bottom = 'auto';
                styles.transform = 'translateY(-50%)';
                break;
            case 2: // Bottom row (7, 8, 9)
                styles.top = 'auto';
                styles.bottom = margin + 'px';
                break;
        }
        
        // Horizontal positioning
        switch (col) {
            case 0: // Left column (1, 4, 7)
                styles.left = margin + 'px';
                styles.right = 'auto';
                break;
            case 1: // Center column (2, 5, 8)
                styles.left = '50%';
                styles.right = 'auto';
                if (styles.transform) {
                    styles.transform = 'translate(-50%, -50%)'; // Both centering
                } else {
                    styles.transform = 'translateX(-50%)'; // Just horizontal centering
                }
                break;
            case 2: // Right column (3, 6, 9)
                styles.left = 'auto';
                styles.right = margin + 'px';
                break;
        }
        
        return styles;
    }
    
    // ========== CSS LOADER ==========
    async function loadCSS(cssUrl, fallbackCSS) {
        try {
            console.log('🔄 Loading CSS from:', cssUrl);
            const response = await fetch(cssUrl);
            
            if (response.ok) {
                const cssText = await response.text();
                console.log('✅ External CSS loaded successfully');
                return cssText;
            } else {
                console.warn('⚠️ CSS fetch failed with status:', response.status);
                return fallbackCSS;
            }
        } catch (error) {
            console.warn('⚠️ CSS fetch error:', error.message);
            return fallbackCSS;
        }
    }
    
    // ========== WIDGET CREATOR ==========
    async function createFloatingWidget(position, cssUrl, content, options = {}) {
        const config = { ...CONFIG, ...options };
        
        try {
            // Validate position
            if (position < 1 || position > 9 || !Number.isInteger(position)) {
                console.error('❌ Invalid position. Use 1-9 (1=top-left, 9=bottom-right)');
                return null;
            }
            
            // Create host element
            const host = document.createElement('div');
            host.id = `floating-widget-${Date.now()}`; // Unique ID
            
            // Apply positioning styles
            const positionStyles = getPositionStyles(position, config.MARGIN, config.Z_INDEX);
            Object.assign(host.style, positionStyles);
            
            // Add to page
            document.body.appendChild(host);
            
            // Create shadow root
            const shadow = host.attachShadow({mode: 'open'});
            
            // Load CSS
            const cssText = await loadCSS(cssUrl, config.FALLBACK_CSS);
            const isUsingFallback = cssText === config.FALLBACK_CSS;
            
            // Inject styles
            const style = document.createElement('style');
            style.textContent = cssText;
            shadow.appendChild(style);
            
            // Create widget content
            const widget = document.createElement('div');
            widget.className = 'shadow-widget';
            
            // Add error indicator if using fallback CSS
            const errorIndicator = isUsingFallback ? 
                '<div class="error-indicator">⚠️ CSS LOAD ERROR</div>' : '';
            
            widget.innerHTML = errorIndicator + content;
            shadow.appendChild(widget);
            
            console.log(`✅ Widget created at position ${position} ${isUsingFallback ? '(using fallback CSS)' : ''}`);
            
            return {
                host: host,
                shadow: shadow,
                widget: widget,
                position: position,
                usingFallback: isUsingFallback
            };
            
        } catch (error) {
            console.error('❌ Failed to create floating widget:', error);
            return null;
        }
    }
    
    // ========== DEMO USAGE ==========
    
    // Your widget content (HTML)
    const widgetContent = `
        <div class="widget-title">🎉 My User Script</div>
        <div class="widget-content">
            <p>This widget floats in the corner!</p>
            <p>Position: Bottom-right (#9)</p>
            <button onclick="this.closest('.shadow-widget').parentElement.host.remove()">
                ✕ Close
            </button>
        </div>
    `;
    
    // Create the widget
    const widget = await createFloatingWidget(
        CONFIG.POSITION,           // Grid position (1-9)
        CONFIG.CSS_URL,           // Your CSS URL
        widgetContent             // Widget content HTML
    );
    
    if (widget) {
        // Optional: Add keyboard shortcut to toggle visibility
        document.addEventListener('keydown', function(e) {
            if (e.ctrlKey && e.altKey && e.key === 'w') { // Ctrl+Alt+W
                const isVisible = widget.host.style.display !== 'none';
                widget.host.style.display = isVisible ? 'none' : '';
                console.log(`🔄 Widget ${isVisible ? 'hidden' : 'shown'}`);
            }
        });
        
        console.log('💡 Press Ctrl+Alt+W to toggle widget visibility');
    }
    
    // ========== HELPER FUNCTIONS (for advanced usage) ==========
    
    // Function to move widget to different position
    window.moveWidget = function(widget, newPosition) {
        if (!widget || newPosition < 1 || newPosition > 9) return false;
        
        const newStyles = getPositionStyles(newPosition, CONFIG.MARGIN, CONFIG.Z_INDEX);
        Object.assign(widget.host.style, newStyles);
        widget.position = newPosition;
        
        console.log(`📍 Widget moved to position ${newPosition}`);
        return true;
    };
    
    // Function to create multiple widgets
    window.createMultipleWidgets = async function(widgets) {
        const results = [];
        for (const config of widgets) {
            const w = await createFloatingWidget(
                config.position, 
                config.cssUrl || CONFIG.CSS_URL, 
                config.content,
                config.options || {}
            );
            if (w) results.push(w);
        }
        return results;
    };
    
    // Make functions available globally for debugging
    window.createFloatingWidget = createFloatingWidget;
    window.getPositionStyles = getPositionStyles;
    
})();

/*
GRID POSITION REFERENCE:
┌─────┬─────┬─────┐
│  1  │  2  │  3  │  ← Top row
├─────┼─────┼─────┤
│  4  │  5  │  6  │  ← Middle row  
├─────┼─────┼─────┤
│  7  │  8  │  9  │  ← Bottom row
└─────┴─────┴─────┘
  ↑     ↑     ↑
 Left Center Right

USAGE EXAMPLES:

// Basic usage - bottom right corner
const widget = await createFloatingWidget(9, 'path/to/your.css', '<div>Content</div>');

// Top left corner
const widget = await createFloatingWidget(1, 'path/to/your.css', '<div>Content</div>');

// Center of screen
const widget = await createFloatingWidget(5, 'path/to/your.css', '<div>Content</div>');

// With custom options
const widget = await createFloatingWidget(9, 'path/to/your.css', '<div>Content</div>', {
    MARGIN: 50,        // 50px from edges instead of default 20px
    Z_INDEX: 99999     // Higher z-index
});

// Multiple widgets
const widgets = await createMultipleWidgets([
    { position: 1, content: '<div>Top Left</div>' },
    { position: 9, content: '<div>Bottom Right</div>' }
]);
*/