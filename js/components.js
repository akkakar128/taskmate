// Components Loader and Manager
const Components = (function() {
    let componentsLoaded = false;
    
    // Load components from external files
    async function loadComponents() {
        if (componentsLoaded) return;
        
        try {
            // Load header
            const headerResponse = await fetch('components/header.html');
            const headerHTML = await headerResponse.text();
            document.body.insertAdjacentHTML('afterbegin', headerHTML);
            
            // Load footer
            const footerResponse = await fetch('components/footer.html');
            const footerHTML = await footerResponse.text();
            document.body.insertAdjacentHTML('beforeend', footerHTML);
            
            componentsLoaded = true;
            initializeComponents();
        } catch (error) {
            console.error('Error loading components:', error);
        }
    }
    
    // Initialize component functionality
    function initializeComponents() {
        initializeHeader();
        initializeFooter();
    }
    
    // Header functionality
    function initializeHeader() {
        const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        const mobileNav = document.querySelector('.mobile-nav');
        
        if (mobileMenuBtn && mobileNav) {
            mobileMenuBtn.addEventListener('click', function() {
                mobileNav.classList.toggle('active');
                this.classList.toggle('active');
            });
        }
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', function(event) {
            if (mobileNav && mobileNav.classList.contains('active') && 
                !event.target.closest('.mobile-nav') && 
                !event.target.closest('.mobile-menu-btn')) {
                mobileNav.classList.remove('active');
                mobileMenuBtn.classList.remove('active');
            }
        });
    }
    
    // Footer functionality
    function initializeFooter() {
        const newsletterForm = document.querySelector('.newsletter-form');
        
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', function(e) {
                e.preventDefault();
                const email = this.querySelector('.newsletter-input').value;
                
                // Simple email validation
                if (validateEmail(email)) {
                    // Here you would typically send to your backend
                    alert('Thank you for subscribing to our newsletter!');
                    this.reset();
                } else {
                    alert('Please enter a valid email address.');
                }
            });
        }
    }
    
    // Email validation helper
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    // Public API
    return {
        load: loadComponents,
        init: initializeComponents
    };
})();

// Load components when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    Components.load();
});