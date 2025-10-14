class ToolLoader {
    constructor() {
        this.toolData = null;
        this.toolId = this.getToolIdFromURL();
    }

    getToolIdFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('tool') || this.getToolIdFromPath();
    }

    getToolIdFromPath() {
        const path = window.location.pathname;
        const match = path.match(/\/([^\/]+)\.html$/);
        return match ? match[1] : null;
    }

    async loadToolData() {
        try {
            const response = await fetch(`../tools/${this.toolId}.json`);
            if (!response.ok) {
                throw new Error(`Tool data not found for: ${this.toolId}`);
            }
            this.toolData = await response.json();
            this.renderTool();
        } catch (error) {
            console.error('Error loading tool data:', error);
            this.showError('Tool not found or data is corrupted.');
        }
    }

    renderTool() {
        this.updateMetaTags();
        this.updateTextContent();
        this.loadCSS();
        this.loadInputSection();
        this.loadPreviewSection();
        this.loadActionButtons();
        this.loadInstructions();
        this.loadFAQ();
        this.loadHeaderFooter();
        this.loadJavaScript();
    }

    updateMetaTags() {
        // Update title and meta tags
        document.title = this.toolData.meta.title;
        document.querySelector('meta[name="description"]').setAttribute('content', this.toolData.meta.description);
        document.querySelector('meta[name="keywords"]').setAttribute('content', this.toolData.meta.keywords);
    }

    updateTextContent() {
        // Update all elements with data-json attributes
        document.querySelectorAll('[data-json]').forEach(element => {
            const keys = element.getAttribute('data-json').split('.');
            let value = this.toolData;
            
            for (const key of keys) {
                if (value && value[key] !== undefined) {
                    value = value[key];
                } else {
                    value = null;
                    break;
                }
            }
            
            if (value !== null) {
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    element.placeholder = value;
                } else {
                    element.textContent = value;
                }
            }
        });
    }

    loadCSS() {
        const styleElement = document.getElementById('tool-css');
        if (this.toolData.styles && this.toolData.styles.custom) {
            styleElement.textContent = this.toolData.styles.custom;
        }
        
        // Load external CSS files
        if (this.toolData.styles && this.toolData.styles.files) {
            this.toolData.styles.files.forEach(cssFile => {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = cssFile;
                document.head.appendChild(link);
            });
        }
    }

    loadInputSection() {
        const container = document.getElementById('input-container');
        if (this.toolData.sections.input.content) {
            container.innerHTML = this.toolData.sections.input.content;
        }
    }

    loadPreviewSection() {
        const container = document.getElementById('preview-container');
        if (this.toolData.sections.preview.content) {
            container.innerHTML = this.toolData.sections.preview.content;
        }
    }

    loadActionButtons() {
        const container = document.getElementById('action-buttons');
        if (this.toolData.buttons && this.toolData.buttons.actions) {
            container.innerHTML = this.toolData.buttons.actions.map(button => 
                `<button class="btn btn-download" id="${button.id}">${button.text}</button>`
            ).join('');
        }
    }

    loadInstructions() {
        const stepsContainer = document.getElementById('steps-container');
        const tipsContainer = document.getElementById('pro-tips-container');
        
        if (this.toolData.instructions && this.toolData.instructions.steps) {
            stepsContainer.innerHTML = this.toolData.instructions.steps.map((step, index) => `
                <div class="step">
                    <div class="step-number">${index + 1}</div>
                    <div class="step-content">
                        <h3>${step.title}</h3>
                        <p>${step.description}</p>
                    </div>
                </div>
            `).join('');
        }
        
        if (this.toolData.instructions && this.toolData.instructions.tips) {
            tipsContainer.innerHTML = `
                <h3>💡 ${this.toolData.instructions.tips.title || 'Professional Tips'}</h3>
                <div class="tips-grid">
                    ${this.toolData.instructions.tips.items.map(tip => `
                        <div class="tip-card">
                            <h4>${tip.title}</h4>
                            <p>${tip.description}</p>
                        </div>
                    `).join('')}
                </div>
            `;
        }
    }

    loadFAQ() {
        const container = document.getElementById('faq-container');
        if (this.toolData.faq && this.toolData.faq.items) {
            container.innerHTML = this.toolData.faq.items.map(faq => `
                <div class="faq-item">
                    <h3>${faq.question}</h3>
                    <p>${faq.answer}</p>
                </div>
            `).join('');
        }
    }

    async loadHeaderFooter() {
        try {
            // Load header
            const headerResponse = await fetch('../components/header.html');
            if (headerResponse.ok) {
                document.getElementById('header-container').innerHTML = await headerResponse.text();
            }
            
            // Load footer
            const footerResponse = await fetch('../components/footer.html');
            if (footerResponse.ok) {
                document.getElementById('footer-container').innerHTML = await footerResponse.text();
            }
        } catch (error) {
            console.error('Error loading header/footer:', error);
        }
    }

    loadJavaScript() {
        const scriptElement = document.getElementById('tool-js');
        
        // Load external JS files
        if (this.toolData.scripts && this.toolData.scripts.files) {
            this.toolData.scripts.files.forEach(jsFile => {
                const script = document.createElement('script');
                script.src = jsFile;
                document.body.appendChild(script);
            });
        }
        
        // Load custom JavaScript
        if (this.toolData.scripts && this.toolData.scripts.custom) {
            scriptElement.textContent = this.toolData.scripts.custom;
        }
    }

    showError(message) {
        document.body.innerHTML = `
            <div class="container" style="text-align: center; padding: 50px;">
                <h1>Tool Error</h1>
                <p>${message}</p>
                <a href="../index.html" class="btn">Return to Home</a>
            </div>
        `;
    }
}

// Initialize tool loader when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const toolLoader = new ToolLoader();
    toolLoader.loadToolData();
});