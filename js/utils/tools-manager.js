// Tools Page Manager
const ToolsManager = (function() {
    let toolsData = null;
    let allTools = [];

    // Initialize tools page
    async function init() {
        try {
            // Load tools data
            const response = await fetch('/data/tools-data.json');
            toolsData = await response.json();
            
            // Update page meta
            updatePageMeta();
            
            // Initialize all sections
            initializeHeroSection();
            initializeFeaturedTools();
            initializeCategories();
            initializeTestimonials();
            initializeUpcomingTools();
            initializeSearch();
            
        } catch (error) {
            console.error('Error loading tools data:', error);
        }
    }

    // Update page meta tags
    function updatePageMeta() {
        document.getElementById('page-title').textContent = toolsData.pageMeta.title;
        document.getElementById('page-description').setAttribute('content', toolsData.pageMeta.description);
        document.getElementById('page-keywords').setAttribute('content', toolsData.pageMeta.keywords);
        
        // Update Open Graph tags
        document.querySelector('meta[property="og:title"]').setAttribute('content', toolsData.pageMeta.title);
        document.querySelector('meta[property="og:description"]').setAttribute('content', toolsData.pageMeta.description.split('.')[0]);
    }

    // Initialize hero section
    function initializeHeroSection() {
        document.getElementById('hero-title').textContent = toolsData.heroSection.title;
        document.getElementById('hero-subtitle').textContent = toolsData.heroSection.subtitle;
        
        const statsContainer = document.getElementById('hero-stats');
        statsContainer.innerHTML = toolsData.heroSection.stats.map(stat => `
            <div class="stat">
                <div class="stat-number">${stat.number}</div>
                <div class="stat-label">${stat.label}</div>
            </div>
        `).join('');
    }

    // Initialize featured tools
    function initializeFeaturedTools() {
        const featuredContainer = document.getElementById('featured-tools');
        featuredContainer.innerHTML = toolsData.featuredTools.map(tool => `
            <div class="featured-tool-card" data-tool-id="${tool.id}">
                ${tool.isNew ? '<span class="new-badge">NEW</span>' : ''}
                <div class="tool-icon">${tool.icon}</div>
                <h3>${tool.name}</h3>
                <p>${tool.description}</p>
                <div class="tool-features">
                    ${tool.features.map(feature => `<span class="feature-tag">${feature}</span>`).join('')}
                </div>
                <div class="tool-tags">
                    ${tool.tags.map(tag => `<span class="tool-tag">${tag}</span>`).join('')}
                </div>
                <a href="${tool.url}" class="btn-tool">Use Tool</a>
            </div>
        `).join('');
    }

    // Initialize categories and tools
    function initializeCategories() {
        // Build all tools array for search
        allTools = [];
        toolsData.toolCategories.forEach(category => {
            category.tools.forEach(tool => {
                allTools.push({
                    ...tool,
                    category: category.name,
                    categoryId: category.id
                });
            });
        });

        const categoriesContainer = document.getElementById('tools-categories');
        categoriesContainer.innerHTML = toolsData.toolCategories.map(category => `
            <div class="category-section" data-category="${category.id}">
                <div class="category-header">
                    <div class="category-icon">${category.icon}</div>
                    <div>
                        <h3>${category.name}</h3>
                        <p>${category.description}</p>
                    </div>
                </div>
                <div class="tools-grid">
                    ${category.tools.map(tool => `
                        <div class="tool-card" data-tool-id="${tool.id}">
                            ${tool.isNew ? '<span class="new-badge">NEW</span>' : ''}
                            <div class="tool-icon">${tool.icon}</div>
                            <h4>${tool.name}</h4>
                            <p>${tool.description}</p>
                            <a href="${tool.url}" class="btn-tool">Use Tool</a>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');

        // Initialize category filters
        initializeCategoryFilters();
    }

    // Initialize category filters
    function initializeCategoryFilters() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        const categorySections = document.querySelectorAll('.category-section');

        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Update active button
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');

                const category = button.getAttribute('data-category');

                // Show/hide categories
                categorySections.forEach(section => {
                    if (category === 'all' || section.getAttribute('data-category') === category) {
                        section.style.display = 'block';
                    } else {
                        section.style.display = 'none';
                    }
                });
            });
        });
    }

    // Initialize testimonials
    function initializeTestimonials() {
        const testimonialsContainer = document.getElementById('testimonials-grid');
        testimonialsContainer.innerHTML = toolsData.testimonials.map(testimonial => `
            <div class="testimonial-card">
                <div class="testimonial-content">
                    <p>"${testimonial.content}"</p>
                </div>
                <div class="testimonial-author">
                    <div class="author-info">
                        <strong>${testimonial.name}</strong>
                        <span>${testimonial.role}</span>
                    </div>
                    <div class="tool-used">
                        Used: ${testimonial.tool}
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Initialize upcoming tools
    function initializeUpcomingTools() {
        const upcomingContainer = document.getElementById('upcoming-tools');
        upcomingContainer.innerHTML = toolsData.upcomingTools.map(tool => `
            <div class="upcoming-tool-card">
                <div class="upcoming-status ${tool.status}">
                    <span class="status-dot"></span>
                    ${tool.status.replace('-', ' ')}
                </div>
                <h4>${tool.name}</h4>
                <p>${tool.description}</p>
                <div class="upcoming-eta">
                    <strong>ETA:</strong> ${tool.eta}
                </div>
            </div>
        `).join('');
    }

    // Initialize search functionality
    function initializeSearch() {
        const searchInput = document.getElementById('tool-search');
        const suggestionsContainer = document.getElementById('search-suggestions');

        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            
            if (query.length < 2) {
                suggestionsContainer.style.display = 'none';
                return;
            }

            const results = allTools.filter(tool => 
                tool.name.toLowerCase().includes(query) ||
                tool.description.toLowerCase().includes(query) ||
                tool.tags?.some(tag => tag.toLowerCase().includes(query))
            );

            displaySearchSuggestions(results, query);
        });

        // Hide suggestions when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.hero-search')) {
                suggestionsContainer.style.display = 'none';
            }
        });
    }

    // Display search suggestions
    function displaySearchSuggestions(results, query) {
        const suggestionsContainer = document.getElementById('search-suggestions');
        
        if (results.length === 0) {
            suggestionsContainer.innerHTML = '<div class="suggestion-item no-results">No tools found matching your search</div>';
            suggestionsContainer.style.display = 'block';
            return;
        }

        suggestionsContainer.innerHTML = results.slice(0, 5).map(tool => `
            <div class="suggestion-item" data-tool-id="${tool.id}">
                <div class="suggestion-icon">${tool.icon}</div>
                <div class="suggestion-info">
                    <div class="suggestion-name">${highlightMatch(tool.name, query)}</div>
                    <div class="suggestion-category">${tool.category}</div>
                </div>
            </div>
        `).join('');

        // Add click handlers
        suggestionsContainer.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', () => {
                const toolId = item.getAttribute('data-tool-id');
                const tool = allTools.find(t => t.id === toolId);
                if (tool) {
                    window.location.href = tool.url;
                }
            });
        });

        suggestionsContainer.style.display = 'block';
    }

    // Highlight matching text in search results
    function highlightMatch(text, query) {
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }

    // Public API
    return {
        init
    };
})();

// Initialize tools page
document.addEventListener('DOMContentLoaded', function() {
    ToolsManager.init();
});