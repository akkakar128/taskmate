// Homepage functionality
const Homepage = (function() {
    let homeData = null;
    let allTools = [];

    // Initialize homepage
    async function init() {
        try {
            // Load home data from JSON
            const response = await fetch('/json/home-data.json');
            homeData = await response.json();
            
            // Initialize all sections
            loadHeroSection();
            loadFeatures();
            loadTools();
            loadStats();
            loadTestimonials();
            setupEventListeners();
            
        } catch (error) {
            console.error('Error loading homepage data:', error);
        }
    }

    // Load hero section
    function loadHeroSection() {
        const heroSection = document.getElementById('home-hero');
        if (!homeData?.hero) return;

        const { title, subtitle, ctaButtons } = homeData.hero;

        heroSection.innerHTML = `
            <div class="container">
                <div class="hero-content">
                    <h1 class="hero-title">${title}</h1>
                    <p class="hero-subtitle">${subtitle}</p>
                    <div class="hero-actions">
                        ${ctaButtons.map(button => `
                            <a href="${button.url}" class="btn btn-${button.type}">${button.text}</a>
                        `).join('')}
                    </div>
                </div>
                <div class="hero-visual">
                    <div class="tool-preview">
                        <div class="preview-card">
                            <div class="preview-icon">🚀</div>
                            <h4>50+ Free Tools</h4>
                            <p>And counting...</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Load features section
    function loadFeatures() {
        const featuresGrid = document.getElementById('features-grid');
        if (!homeData?.features) return;

        featuresGrid.innerHTML = homeData.features.map(feature => `
            <div class="feature-card">
                <div class="feature-icon">${feature.icon}</div>
                <h3>${feature.title}</h3>
                <p>${feature.description}</p>
            </div>
        `).join('');
    }

    // Load tools section
    function loadTools() {
        if (!homeData?.tools) return;
        
        allTools = homeData.tools;
        createToolFilters();
        renderTools(allTools);
        populateFeedbackTools();
    }

    // Create tool filter buttons
    function createToolFilters() {
        const filterContainer = document.getElementById('tools-filter');
        const categories = ['all', ...new Set(allTools.map(tool => tool.category))];
        
        filterContainer.innerHTML = categories.map(category => `
            <button class="filter-btn ${category === 'all' ? 'active' : ''}" 
                    data-category="${category}">
                ${category === 'all' ? 'All Tools' : category.charAt(0).toUpperCase() + category.slice(1)}
                ${category !== 'all' ? ` (${allTools.filter(tool => tool.category === category).length})` : ''}
            </button>
        `).join('');

        // Add event listeners to filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                const category = btn.dataset.category;
                const filteredTools = category === 'all' 
                    ? allTools 
                    : allTools.filter(tool => tool.category === category);
                
                renderTools(filteredTools);
            });
        });
    }

    // Render tools grid
    function renderTools(tools) {
        const toolsGrid = document.getElementById('tools-grid');
        
        toolsGrid.innerHTML = tools.map(tool => `
            <div class="tool-card ${tool.featured ? 'featured' : ''} ${tool.new ? 'new' : ''}" 
                 data-category="${tool.category}">
                ${tool.new ? '<span class="new-badge">New</span>' : ''}
                ${tool.featured ? '<span class="featured-badge">Featured</span>' : ''}
                <div class="tool-icon">${tool.icon}</div>
                <h3>${tool.name}</h3>
                <p>${tool.description}</p>
                <a href="${tool.url}" class="tool-link">Use Tool →</a>
            </div>
        `).join('');
    }

    // Populate tools in feedback modal
    function populateFeedbackTools() {
        const toolSelect = document.getElementById('feedback-tool');
        if (!toolSelect) return;

        toolSelect.innerHTML = `
            <option value="">Select a tool</option>
            ${allTools.map(tool => `
                <option value="${tool.id}">${tool.name}</option>
            `).join('')}
            <option value="other">Other/General</option>
        `;
    }

    // Load stats section
    function loadStats() {
        const statsGrid = document.getElementById('stats-grid');
        if (!homeData?.stats) return;

        statsGrid.innerHTML = homeData.stats.map(stat => `
            <div class="stat-item">
                <div class="stat-number">${stat.number}</div>
                <div class="stat-label">${stat.label}</div>
            </div>
        `).join('');
    }

    // Load testimonials
    function loadTestimonials() {
        const testimonialsGrid = document.getElementById('testimonials-grid');
        if (!homeData?.testimonials) return;

        testimonialsGrid.innerHTML = homeData.testimonials.map(testimonial => `
            <div class="testimonial-card">
                <div class="testimonial-content">
                    <p>"${testimonial.content}"</p>
                </div>
                <div class="testimonial-author">
                    <div class="author-avatar">${testimonial.avatar}</div>
                    <div class="author-info">
                        <h4>${testimonial.name}</h4>
                        <p>${testimonial.role}</p>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Setup event listeners
    function setupEventListeners() {
        // Feedback modal
        const feedbackModal = document.getElementById('feedback-modal');
        const openBtn = document.getElementById('open-feedback-modal');
        const closeBtn = document.getElementById('close-feedback-modal');
        const cancelBtn = document.getElementById('cancel-feedback');
        const feedbackForm = document.getElementById('feedback-form');

        if (openBtn) {
            openBtn.addEventListener('click', () => {
                feedbackModal.classList.add('active');
            });
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                feedbackModal.classList.remove('active');
            });
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                feedbackModal.classList.remove('active');
            });
        }

        if (feedbackModal) {
            feedbackModal.addEventListener('click', (e) => {
                if (e.target === feedbackModal) {
                    feedbackModal.classList.remove('active');
                }
            });
        }

        if (feedbackForm) {
            feedbackForm.addEventListener('submit', handleFeedbackSubmit);
        }

        // Animate stats on scroll
        setupStatsAnimation();
    }

    // Handle feedback form submission
    function handleFeedbackSubmit(e) {
        e.preventDefault();
        
        const formData = {
            type: document.getElementById('feedback-type').value,
            tool: document.getElementById('feedback-tool').value,
            message: document.getElementById('feedback-message').value,
            email: document.getElementById('feedback-email').value,
            timestamp: new Date().toISOString()
        };

        // Here you would typically send this to your backend
        console.log('Feedback submitted:', formData);
        
        // For now, we'll store in localStorage and show success message
        saveFeedback(formData);
        
        alert('Thank you for your feedback! We appreciate your input and will use it to improve our tools.');
        
        // Close modal and reset form
        document.getElementById('feedback-modal').classList.remove('active');
        e.target.reset();
    }

    // Save feedback to localStorage (temporary solution)
    function saveFeedback(feedback) {
        const existingFeedback = JSON.parse(localStorage.getItem('taskmate-feedback') || '[]');
        existingFeedback.push(feedback);
        localStorage.setItem('taskmate-feedback', JSON.stringify(existingFeedback));
    }

    // Setup stats animation
    function setupStatsAnimation() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateStats();
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        const statsSection = document.querySelector('.stats-section');
        if (statsSection) {
            observer.observe(statsSection);
        }
    }

    // Animate statistics numbers
    function animateStats() {
        const statNumbers = document.querySelectorAll('.stat-number');
        
        statNumbers.forEach(stat => {
            const target = stat.textContent;
            const isPercentage = target.includes('%');
            const numericValue = parseFloat(target);
            
            let current = 0;
            const duration = 2000;
            const step = numericValue / (duration / 16);
            
            const timer = setInterval(() => {
                current += step;
                if (current >= numericValue) {
                    current = numericValue;
                    clearInterval(timer);
                }
                
                stat.textContent = isPercentage 
                    ? Math.floor(current) + '%'
                    : current >= 1000 
                        ? Math.floor(current / 1000) + 'K+'
                        : Math.floor(current) + '+';
            }, 16);
        });
    }

    // Public API
    return {
        init
    };
})();

// Initialize homepage when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    Homepage.init();
});