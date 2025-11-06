// ==UserScript==
// @name         Test external style loading
// @namespace    http://tampermonkey.net/
// @version      1.3
// @description  try to take over the world!
// @updateURL    https://raw.githubusercontent.com/adastra1826/test-gh-repo/refs/heads/main/userscripts/style-loading/loader.user.js
// @downloadURL  https://raw.githubusercontent.com/adastra1826/test-gh-repo/refs/heads/main/userscripts/style-loading/loader.user.js
// @author       You
// @match        *
// @grant        none
// ==/UserScript==

// Complete production-ready user script
(async function() {
    'use strict';

    const CSS_URL = 'https://cdn.jsdelivr.net/gh/adastra1826/test-gh-repo/refs/heads/main/userscripts/style-loading/styles.css';
    const FALLBACK_CSS = `
        .shadow-widget {
            background: #333;
            color: white;
            padding: 15px;
            border-radius: 8px;
        }
    `;

    async function createShadowWidget() {
        try {
            // Create host element
            const host = document.createElement('div');
            host.id = 'my-shadow-host';
            document.body.appendChild(host);

            // Create shadow root
            const shadow = host.attachShadow({mode: 'open'});

            // Load external CSS with fallback
            let cssText = FALLBACK_CSS;
            try {
                const response = await fetch(CSS_URL);
                if (response.ok) {
                    cssText = await response.text();
                    console.log('✅ External CSS loaded successfully');
                } else {
                    console.warn('⚠️ Using fallback CSS');
                }
            } catch (error) {
                console.warn('⚠️ CSS fetch failed, using fallback:', error);
            }

            // Inject styles
            const style = document.createElement('style');
            style.textContent = cssText;
            shadow.appendChild(style);

            // Add widget content
            const widget = document.createElement('div');
            widget.className = 'shadow-widget';
            widget.innerHTML = `
                <div class="widget-title">🎉 User Script Widget</div>
                <div class="widget-content">
                    This widget is styled with external CSS loaded into Shadow DOM!
                    <br><br>
                    <button onclick="this.parentElement.parentElement.remove()">
                        Close Widget
                    </button>
                </div>
            `;

            shadow.appendChild(widget);

        } catch (error) {
            console.error('❌ Failed to create shadow widget:', error);
        }
    }

    // Wait for page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createShadowWidget);
    } else {
        createShadowWidget();
    }
})();