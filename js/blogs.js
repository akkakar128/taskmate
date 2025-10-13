// Blogs Management System
const BlogsManager = (function() {
    let blogsData = null;
    let currentPage = 1;
    const blogsPerPage = 6;
    let currentCategory = 'all';
    let currentSort = 'newest';
    let currentSearch = '';

    // Initialize blogs system
    async function init() {
        try {
            // Load blogs data
            const response = await fetch('/json/blogs.json');
            blogsData = await response.json();
            
            // Initialize the page
            renderFeaturedBlogs();
            renderCategories();
            renderTags();
            renderBlogsGrid();
            setupEventListeners();
            
        } catch (error) {
            console.error('Error loading blogs:', error);
            showError('Failed to load blogs. Please try again later.');
        }
    }

    // Render featured blogs
    function renderFeaturedBlogs() {
        const featuredGrid = document.getElementById('featured-grid');
        if (!featuredGrid) return;

        const featuredBlogs = blogsData.blogs.filter(blog => blog.featured).slice(0, 3);
        
        if (featuredBlogs.length === 0) {
            featuredGrid.innerHTML = '<p class="no-blogs">No featured blogs available.</p>';
            return;
        }

        featuredGrid.innerHTML = featuredBlogs.map(blog => `
            <article class="featured-card" data-blog-id="${blog.id}">
                <div class="featured-image">
                    ${blog.image ? `<img src="${blog.image}" alt="${blog.alt_text}" loading="lazy">` : '📝'}
                </div>
                <div class="featured-content">
                    <span class="featured-badge">Featured</span>
                    <h3>${blog.title}</h3>
                    <p>${blog.excerpt}</p>
                    <div class="featured-meta">
                        <span>${formatDate(blog.publish_date)}</span>
                        <span>${blog.read_time}</span>
                    </div>
                </div>
            </article>
        `).join('');

        // Add click event to featured cards
        featuredGrid.querySelectorAll('.featured-card').forEach(card => {
            card.addEventListener('click', () => {
                const blogId = card.getAttribute('data-blog-id');
                openBlog(blogId);
            });
        });
    }

    // Render categories filter
    function renderCategories() {
        const categoriesContainer = document.getElementById('category-filters');
        if (!categoriesContainer) return;

        const categoryCounts = {};
        blogsData.blogs.forEach(blog => {
            categoryCounts[blog.category] = (categoryCounts[blog.category] || 0) + 1;
        });

        const categoriesHTML = `
            <div class="category-filter ${currentCategory === 'all' ? 'active' : ''}" data-category="all">
                <span>All Articles</span>
                <span class="category-count">${blogsData.blogs.length}</span>
            </div>
            ${blogsData.categories.map(category => `
                <div class="category-filter ${currentCategory === category ? 'active' : ''}" data-category="${category}">
                    <span>${category}</span>
                    <span class="category-count">${categoryCounts[category] || 0}</span>
                </div>
            `).join('')}
        `;

        categoriesContainer.innerHTML = categoriesHTML;
    }

    // Render tag cloud
    function renderTags() {
        const tagCloud = document.getElementById('tag-cloud');
        if (!tagCloud) return;

        const allTags = [];
        blogsData.blogs.forEach(blog => {
            allTags.push(...blog.tags);
        });

        const tagCounts = {};
        allTags.forEach(tag => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });

        const uniqueTags = [...new Set(allTags)];
        
        tagCloud.innerHTML = uniqueTags.map(tag => `
            <span class="tag" data-tag="${tag}">${tag} (${tagCounts[tag]})</span>
        `).join('');
    }

    // Render blogs grid
    function renderBlogsGrid() {
        const blogsGrid = document.getElementById('blogs-grid');
        if (!blogsGrid) return;

        const filteredBlogs = filterAndSortBlogs();
        const startIndex = (currentPage - 1) * blogsPerPage;
        const paginatedBlogs = filteredBlogs.slice(0, startIndex + blogsPerPage);

        if (paginatedBlogs.length === 0) {
            blogsGrid.innerHTML = `
                <div class="no-blogs-message">
                    <h3>No articles found</h3>
                    <p>Try adjusting your filters or search terms.</p>
                </div>
            `;
            return;
        }

        blogsGrid.innerHTML = paginatedBlogs.map(blog => `
            <article class="blog-card" data-blog-id="${blog.id}">
                <div class="blog-card-image">
                    ${blog.image ? `<img src="${blog.image}" alt="${blog.alt_text}" loading="lazy">` : '📝'}
                </div>
                <div class="blog-card-content">
                    <span class="blog-category">${blog.category}</span>
                    <h3>${blog.title}</h3>
                    <p>${blog.excerpt}</p>
                    <div class="blog-meta">
                        <span>By ${blog.author}</span>
                        <span>${formatDate(blog.publish_date)} • ${blog.read_time}</span>
                    </div>
                    <div class="blog-tags">
                        ${blog.tags.slice(0, 3).map(tag => `<span class="blog-tag">${tag}</span>`).join('')}
                    </div>
                </div>
            </article>
        `).join('');

        // Add click event to blog cards
        blogsGrid.querySelectorAll('.blog-card').forEach(card => {
            card.addEventListener('click', () => {
                const blogId = card.getAttribute('data-blog-id');
                openBlog(blogId);
            });
        });

        // Show/hide load more button
        const loadMoreBtn = document.getElementById('load-more');
        if (loadMoreBtn) {
            if (paginatedBlogs.length < filteredBlogs.length) {
                loadMoreBtn.style.display = 'block';
            } else {
                loadMoreBtn.style.display = 'none';
            }
        }
    }

    // Filter and sort blogs
    function filterAndSortBlogs() {
        let filtered = blogsData.blogs;

        // Filter by category
        if (currentCategory !== 'all') {
            filtered = filtered.filter(blog => blog.category === currentCategory);
        }

        // Filter by search
        if (currentSearch) {
            const searchTerm = currentSearch.toLowerCase();
            filtered = filtered.filter(blog => 
                blog.title.toLowerCase().includes(searchTerm) ||
                blog.excerpt.toLowerCase().includes(searchTerm) ||
                blog.content.toLowerCase().includes(searchTerm) ||
                blog.tags.some(tag => tag.toLowerCase().includes(searchTerm))
            );
        }

        // Sort blogs
        switch (currentSort) {
            case 'newest':
                filtered.sort((a, b) => new Date(b.publish_date) - new Date(a.publish_date));
                break;
            case 'oldest':
                filtered.sort((a, b) => new Date(a.publish_date) - new Date(b.publish_date));
                break;
            case 'popular':
                // For now, sort by featured status and date
                filtered.sort((a, b) => {
                    if (a.featured && !b.featured) return -1;
                    if (!a.featured && b.featured) return 1;
                    return new Date(b.publish_date) - new Date(a.publish_date);
                });
                break;
        }

        return filtered;
    }

    // Setup event listeners
    function setupEventListeners() {
        // Category filters
        document.addEventListener('click', (e) => {
            if (e.target.closest('.category-filter')) {
                const category = e.target.closest('.category-filter').getAttribute('data-category');
                currentCategory = category;
                currentPage = 1;
                renderCategories();
                renderBlogsGrid();
            }

            // Tag filters
            if (e.target.classList.contains('tag')) {
                const tag = e.target.getAttribute('data-tag');
                currentSearch = tag;
                document.getElementById('blog-search').value = tag;
                currentPage = 1;
                renderBlogsGrid();
            }
        });

        // Search functionality
        const searchInput = document.getElementById('blog-search');
        const searchBtn = document.querySelector('.search-btn');

        if (searchInput && searchBtn) {
            const performSearch = () => {
                currentSearch = searchInput.value.trim();
                currentPage = 1;
                renderBlogsGrid();
            };

            searchBtn.addEventListener('click', performSearch);
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') performSearch();
            });
        }

        // Sort functionality
        const sortSelect = document.getElementById('sort-blogs');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                currentSort = e.target.value;
                currentPage = 1;
                renderBlogsGrid();
            });
        }

        // Load more functionality
        const loadMoreBtn = document.getElementById('load-more');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => {
                currentPage++;
                renderBlogsGrid();
            });
        }

        // Contribute modal
        const openContributeBtn = document.getElementById('open-contribute');
        const closeContributeBtn = document.getElementById('close-contribute');
        const cancelContributeBtn = document.getElementById('cancel-contribute');
        const contributeModal = document.getElementById('contribute-modal');
        const contributeForm = document.getElementById('contribute-form');

        if (openContributeBtn && contributeModal) {
            openContributeBtn.addEventListener('click', () => {
                contributeModal.classList.add('active');
            });
        }

        if (closeContributeBtn && contributeModal) {
            closeContributeBtn.addEventListener('click', () => {
                contributeModal.classList.remove('active');
            });
        }

        if (cancelContributeBtn && contributeModal) {
            cancelContributeBtn.addEventListener('click', () => {
                contributeModal.classList.remove('active');
            });
        }

        // Close modal when clicking outside
        if (contributeModal) {
            contributeModal.addEventListener('click', (e) => {
                if (e.target === contributeModal) {
                    contributeModal.classList.remove('active');
                }
            });
        }

        // Contribute form submission
        if (contributeForm) {
            contributeForm.addEventListener('submit', handleContribution);
        }

        // Newsletter subscriptions
        const subscribeForms = document.querySelectorAll('#blog-subscribe, #main-newsletter');
        subscribeForms.forEach(form => {
            form.addEventListener('submit', handleNewsletterSubscription);
        });
    }

    // Handle blog contribution
    function handleContribution(e) {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('author-name').value,
            email: document.getElementById('author-email').value,
            title: document.getElementById('blog-title').value,
            category: document.getElementById('blog-category').value,
            excerpt: document.getElementById('blog-excerpt').value,
            content: document.getElementById('blog-content').value,
            tags: document.getElementById('blog-tags').value.split(',').map(tag => tag.trim()).filter(tag => tag)
        };

        // Here you would typically send this to your backend
        console.log('Blog contribution submitted:', formData);
        
        alert('Thank you for your contribution! We will review your article and get back to you soon.');
        
        // Close modal and reset form
        document.getElementById('contribute-modal').classList.remove('active');
        e.target.reset();
    }

    // Handle newsletter subscription
    function handleNewsletterSubscription(e) {
        e.preventDefault();
        const email = e.target.querySelector('input[type="email"]').value;
        
        // Here you would typically send this to your backend
        console.log('Newsletter subscription:', email);
        alert('Thank you for subscribing to our newsletter!');
        e.target.reset();
    }

    // Open blog (for future implementation - could open in modal or new page)
    function openBlog(blogId) {
        const blog = blogsData.blogs.find(b => b.id == blogId);
        if (blog) {
            // For now, just log to console
            // In a real implementation, you might open a modal or navigate to a blog detail page
            console.log('Opening blog:', blog.title);
            // window.location.href = `/blog/${blog.slug}`;
        }
    }

    // Utility functions
    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    }

    function showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            background: #fee;
            color: #c33;
            padding: 1rem;
            border-radius: 6px;
            margin: 1rem 0;
            text-align: center;
        `;
        
        const main = document.querySelector('main');
        if (main) {
            main.insertBefore(errorDiv, main.firstChild);
        }
    }

    // Public API
    return {
        init
    };
})();

// Initialize blogs when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    BlogsManager.init();
});