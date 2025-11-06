// ==UserScript==
// @name         Test external style loading
// @namespace    http://tampermonkey.net/
// @version      4.2
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
/*
https://raw.githubusercontent.com/adastra1826/test-gh-repo/refs/heads/main/userscripts/style-loading/styles.css
*/

// Floating Shadow DOM Widget Template
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
                background: transparent !important;
                color: white !important;
                padding: 0 !important;
                border-radius: 0.5em !important;
                font-family: Arial, sans-serif !important;
                font-size: 14px !important;
                box-shadow: 0 0.25em 1em rgba(0,0,0,0.3) !important;
                overflow: hidden !important;
                min-width: 15em !important;
                display: flex !important;
                flex-direction: column !important;
            }
            .error-indicator {
                font-weight: bold !important;
                color: #ffff00 !important;
                padding: 0.75em !important;
                text-align: center !important;
                background: rgba(0,0,0,0.3) !important;
                border-bottom: 2px solid rgba(255,255,255,0.2) !important;
            }
            .widget-content {
                background: #ff0000 !important;
                padding: 1em !important;
                min-height: 7em !important;
                flex: 1 !important;
                border: 2px solid #ffffff !important;
                border-bottom: none !important;
                border-radius: 0.5em 0.5em 0 0 !important;
            }
            .widget-help {
                background: #cc0000 !important;
                color: white !important;
                padding: 1em !important;
                border-left: 2px solid #ffffff !important;
                border-right: 2px solid #ffffff !important;
                font-size: 0.9em !important;
                line-height: 1.6 !important;
            }
            .help-title {
                font-weight: bold !important;
                margin-bottom: 0.5em !important;
                font-size: 1.1em !important;
            }
            .help-item {
                margin-bottom: 0.3em !important;
                padding-left: 1em !important;
            }
            .help-shortcut {
                margin-top: 0.75em !important;
                padding-top: 0.5em !important;
                border-top: 1px solid rgba(255,255,255,0.3) !important;
                color: #ffcccc !important;
            }
            .widget-menubar {
                background: #990000 !important;
                padding: 0.5em !important;
                text-align: left !important;
                border: 2px solid #ffffff !important;
                border-top: none !important;
                border-radius: 0 0 0.5em 0.5em !important;
            }
            .menu-btn {
                background: rgba(255,255,255,0.2) !important;
                color: white !important;
                border: 1px solid rgba(255,255,255,0.3) !important;
                padding: 0.3em 0.6em !important;
                margin-right: 0.3em !important;
                border-radius: 0.2em !important;
                cursor: pointer !important;
                font-size: 1em !important;
            }
            .menu-btn:hover {
                background: rgba(255,255,255,0.3) !important;
            }
            .maximize-btn {
                background: #008000 !important;
                color: white !important;
                border: 2px solid #ffffff !important;
                padding: 0.5em 0.75em !important;
                border-radius: 0.5em !important;
                cursor: pointer !important;
                font-size: 1.2em !important;
            }
            .maximize-btn:hover {
                background: #00a000 !important;
            }
            .minimized {
                padding: 0 !important;
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
    
    // ========== MENU HANDLERS ==========
    function setupMenuHandlers(host, shadow, widget) {
        const hostId = host.id;
        
        // Close button handler
        const closeBtn = shadow.querySelector('.close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', function() {
                console.log(`🗑️ Closing widget: ${hostId}`);
                document.getElementById(hostId)?.remove();
            });
        }
        
        // Minimize/Maximize functionality
        const minimizeBtn = shadow.querySelector('.minimize-btn');
        if (minimizeBtn) {
            minimizeBtn.addEventListener('click', function() {
                const widgetElement = shadow.querySelector('.shadow-widget');
                const content = shadow.querySelector('.widget-content');
                const menubar = shadow.querySelector('.widget-menubar');
                const errorIndicator = shadow.querySelector('.error-indicator');
                
                if (widgetElement.classList.contains('minimized')) {
                    // MAXIMIZE - restore full widget
                    widgetElement.classList.remove('minimized');
                    if (content) content.style.display = '';
                    if (menubar) menubar.style.display = '';
                    if (errorIndicator) errorIndicator.style.display = '';
                    
                    // Remove maximize button
                    const maxBtn = shadow.querySelector('.maximize-btn');
                    if (maxBtn) maxBtn.remove();
                    
                    console.log(`📖 Maximized widget: ${hostId}`);
                } else {
                    // MINIMIZE - collapse to button
                    widgetElement.classList.add('minimized');
                    if (content) content.style.display = 'none';
                    if (menubar) menubar.style.display = 'none';
                    if (errorIndicator) errorIndicator.style.display = 'none';
                    
                    // Create maximize button
                    const maxBtn = document.createElement('button');
                    maxBtn.className = 'maximize-btn';
                    maxBtn.textContent = '📱';
                    maxBtn.title = 'Maximize Widget';
                    maxBtn.addEventListener('click', function() {
                        minimizeBtn.click(); // Reuse minimize handler
                    });
                    
                    widgetElement.appendChild(maxBtn);
                    console.log(`📱 Minimized widget: ${hostId}`);
                }
            });
        }
        
        // Help button handler
        const helpBtn = shadow.querySelector('.help-btn');
        if (helpBtn) {
            helpBtn.addEventListener('click', function() {
                const existingHelp = shadow.querySelector('.widget-help');
                
                if (existingHelp) {
                    // Close existing help
                    existingHelp.remove();
                    console.log('❓ Help closed');
                    return;
                }
                
                // Create help section
                const helpDiv = document.createElement('div');
                helpDiv.className = 'widget-help';
                helpDiv.innerHTML = `
                    <div class="help-title">🎯 Widget Help</div>
                    <div class="help-item">❓ Help - Show/hide this help</div>
                    <div class="help-item">➖ Minimize - Collapse to button</div>
                    <div class="help-item">✕ Close - Remove widget</div>
                    <div class="help-shortcut">⌨️ Ctrl+Alt+W - Toggle visibility</div>
                `;
                
                // Insert help div between content and menubar
                const menubar = shadow.querySelector('.widget-menubar');
                if (menubar) {
                    widget.insertBefore(helpDiv, menubar);
                } else {
                    widget.appendChild(helpDiv);
                }
                
                console.log('❓ Help shown');
            });
        }
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
            
            // Add menu functionality
            setupMenuHandlers(host, shadow, widget);
            
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
        <div class="widget-content">
            <p style="color: #888; font-style: italic; text-align: center; padding: 40px 20px;">
                Your content goes here...
            </p>
        </div>
        <div class="widget-menubar">
            <button class="menu-btn help-btn" title="Show Help">❓</button>
            <button class="menu-btn minimize-btn" title="Minimize">➖</button>
            <button class="menu-btn close-btn" title="Close Widget">✕</button>
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