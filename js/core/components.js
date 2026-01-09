// Load components when DOM is ready
document.addEventListener('DOMContentLoaded', function () {
    Components.load();
});



// Components Loader and Manager
const Components = (function () {
    let footerData = null;

    // Load components
    async function loadComponents() {
        try {
            // Load header
            const headerResponse = await fetch('/components/header.html');
            const headerHTML = await headerResponse.text();
            document.body.insertAdjacentHTML('afterbegin', headerHTML);

            // Load footer
            const footerResponse = await fetch('/components/footer.html');
            const footerHTML = await footerResponse.text();
            document.body.insertAdjacentHTML('beforeend', footerHTML);

            // Load footer data
            const dataResponse = await fetch('/data/footer-data.json');
            footerData = await dataResponse.json();

            // Initialize components
            initializeHeader();
            initializeFooter();
            
            // Dispatch event for other scripts that depend on header being loaded
            document.dispatchEvent(new CustomEvent('headerLoaded'));

        } catch (error) {
            console.error('Error loading components:', error);
        }
    }

    // Initialize header functionality
    function initializeHeader() {
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const mobileMenu = document.getElementById('mobileMenu');

        // Mobile menu toggle
        if (mobileMenuBtn && mobileMenu) {
            mobileMenuBtn.addEventListener('click', function (e) {
                e.stopPropagation();
                mobileMenu.classList.toggle('active');;
                mobileMenuBtn.classList.toggle('active');

                // Toggle aria-expanded for accessibility
                const isExpanded = mobileMenu.classList.contains('active');
                mobileMenuBtn.setAttribute('aria-expanded', isExpanded);

                // Prevent body scroll when mobile menu is open
                document.body.classList.toggle('mobile-menu-open', isExpanded);
            });

            // Mobile dropdown functionality
            const mobileDropdowns = mobileMenu.querySelectorAll('.dropdown');
            mobileDropdowns.forEach(dropdown => {
                const dropdownLink = dropdown.querySelector('.nav-link');

                if (dropdownLink) {
                    dropdownLink.addEventListener('click', function (e) {
                        if (window.innerWidth <= 768) { // Only on mobile
                            e.preventDefault();
                            e.stopPropagation();

                            // Close other open dropdowns
                            mobileDropdowns.forEach(otherDropdown => {
                                if (otherDropdown !== dropdown && otherDropdown.classList.contains('active')) {
                                    otherDropdown.classList.remove('active');
                                }
                            });

                            // Toggle current dropdown
                            dropdown.classList.toggle('active');
                        }
                    });
                }
            });

            // Close mobile menu when clicking on a non-dropdown link
            const mobileLinks = mobileMenu.querySelectorAll('.mobile-nav-link:not(.dropdown .nav-link)');
            mobileLinks.forEach(link => {
                link.addEventListener('click', () => {
                    mobileMenu.classList.remove('active');
                    mobileMenuBtn.classList.remove('active');
                    mobileMenuBtn.setAttribute('aria-expanded', 'false');
                    document.body.classList.remove('mobile-menu-open');

                    // Close all dropdowns
                    mobileDropdowns.forEach(dropdown => {
                        dropdown.classList.remove('active');
                    });
                });
            });

            // Close mobile menu when clicking outside
            document.addEventListener('click', function (e) {
                if (mobileMenu.classList.contains('active') &&
                    !e.target.closest('.mobile-menu') &&
                    !e.target.closest('.mobile-menu-btn')) {
                    mobileMenu.classList.remove('active');
                    mobileMenuBtn.classList.remove('active');
                    mobileMenuBtn.setAttribute('aria-expanded', 'false');
                    document.body.classList.remove('mobile-menu-open');

                    // Close all dropdowns
                    mobileDropdowns.forEach(dropdown => {
                        dropdown.classList.remove('active');
                    });
                }
            });

            // Close mobile menu on escape key
            document.addEventListener('keydown', function (e) {
                if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
                    mobileMenu.classList.remove('active');
                    mobileMenuBtn.classList.remove('active');
                    mobileMenuBtn.setAttribute('aria-expanded', 'false');
                    document.body.classList.remove('mobile-menu-open');

                    // Close all dropdowns
                    mobileDropdowns.forEach(dropdown => {
                        dropdown.classList.remove('active');
                    });
                }
            });
        }

        // Handle dropdown menus for desktop
        const dropdowns = document.querySelectorAll('.dropdown');
        dropdowns.forEach(dropdown => {
            dropdown.addEventListener('mouseenter', function () {
                if (window.innerWidth > 768) { // Only on desktop
                    this.querySelector('.dropdown-menu').style.opacity = '1';
                    this.querySelector('.dropdown-menu').style.visibility = 'visible';
                    this.querySelector('.dropdown-menu').style.transform = 'translateY(0)';
                }
            });

            dropdown.addEventListener('mouseleave', function () {
                if (window.innerWidth > 768) { // Only on desktop
                    this.querySelector('.dropdown-menu').style.opacity = '0';
                    this.querySelector('.dropdown-menu').style.visibility = 'hidden';
                    this.querySelector('.dropdown-menu').style.transform = 'translateY(-10px)';
                }
            });
        });

        // Handle window resize
        window.addEventListener('resize', function () {
            if (window.innerWidth > 768) {
                // Close mobile menu when switching to desktop
                if (mobileMenu) {
                    mobileMenu.classList.remove('active');
                }
                if (mobileMenuBtn) {
                    mobileMenuBtn.classList.remove('active');
                    mobileMenuBtn.setAttribute('aria-expanded', 'false');
                }
                document.body.classList.remove('mobile-menu-open');

                // Close all mobile dropdowns
                const mobileDropdowns = document.querySelectorAll('.dropdown.active');
                mobileDropdowns.forEach(dropdown => {
                    dropdown.classList.remove('active');
                });
            }
        });
    }

    // Initialize footer with data
    function initializeFooter() {
        if (!footerData) return;

        // Company info
        document.getElementById('footer-description').textContent = footerData.companyInfo.description;
        document.getElementById('footer-email').textContent = footerData.companyInfo.email;
        document.getElementById('footer-phone').textContent = footerData.companyInfo.phone;

        // Social media links
        const socialLinksContainer = document.getElementById('social-links');
        socialLinksContainer.innerHTML = footerData.socialMedia.map(social => `
            <a href="${social.url}" class="social-link" target="_blank" rel="noopener" title="${social.name}" style="background-color: ${social.color}">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    ${getSocialIcon(social.icon)}
                </svg>
            </a>
        `).join('');

        // Quick links
        const quickLinksContainer = document.getElementById('quick-links');
        quickLinksContainer.innerHTML = footerData.quickLinks.map(section => `
            <div class="footer-links-column">
                <h4>${section.title}</h4>
                <ul class="footer-links-list">
                    ${section.links.map(link => `
                        <li><a href="${link.url}">${link.name}</a></li>
                    `).join('')}
                </ul>
            </div>
        `).join('');

        // Legal links
        const legalLinksContainer = document.getElementById('legal-links');
        legalLinksContainer.innerHTML = footerData.legal.map(link => `
            <a href="${link.url}">${link.name}</a>
        `).join('');

        // Newsletter
        document.getElementById('newsletter-title').textContent = footerData.newsletter.title;
        document.getElementById('newsletter-description').textContent = footerData.newsletter.description;
        document.getElementById('newsletter-email').placeholder = footerData.newsletter.placeholder;
        document.getElementById('newsletter-button-text').textContent = footerData.newsletter.buttonText;

        // Initialize newsletter form
        const newsletterForm = document.getElementById('newsletter-form');
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', handleNewsletterSubmit);
        }

        // Initialize feedback modal
        initializeFeedbackModal();
    }

    function initializeAuthModal() {
        const authModal = document.getElementById('auth-modal');
        const modalClose = document.getElementById('auth-modal-close');
        const modalOverlay = document.querySelector('.modal-overlay');

        // Close modal events
        if (modalClose) {
            modalClose.addEventListener('click', () => {
                authModal.classList.remove('active');
            });
        }

        if (modalOverlay) {
            modalOverlay.addEventListener('click', () => {
                authModal.classList.remove('active');
            });
        }

        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && authModal.classList.contains('active')) {
                authModal.classList.remove('active');
            }
        });

        // Auth button events
        document.addEventListener('click', (e) => {
            // Desktop sign in/up buttons
            if (e.target.matches('.btn-login') || e.target.closest('.btn-login')) {
                e.preventDefault();
                showAuthForm('signin');
                authModal.classList.add('active');
            }

            if (e.target.matches('.btn-signup') || e.target.closest('.btn-signup')) {
                e.preventDefault();
                showAuthForm('signup');
                authModal.classList.add('active');
            }

            // Mobile sign in/up buttons
            if (e.target.matches('.btn-login-mobile') || e.target.closest('.btn-login-mobile')) {
                e.preventDefault();
                showAuthForm('signin');
                authModal.classList.add('active');
                // Close mobile menu
                document.querySelector('.mobile-menu').classList.remove('active');
            }

            if (e.target.matches('.btn-signup-mobile') || e.target.closest('.btn-signup-mobile')) {
                e.preventDefault();
                showAuthForm('signup');
                authModal.classList.add('active');
                // Close mobile menu
                document.querySelector('.mobile-menu').classList.remove('active');
            }

            // Form switching
            if (e.target.matches('.switch-to-signup')) {
                e.preventDefault();
                showAuthForm('signup');
            }

            if (e.target.matches('.switch-to-signin')) {
                e.preventDefault();
                showAuthForm('signin');
            }
        });
    }

    // Show specific auth form
    function showAuthForm(formType) {
        const forms = document.querySelectorAll('.auth-form');
        forms.forEach(form => form.classList.remove('active'));

        const targetForm = document.getElementById(`${formType}-form`);
        if (targetForm) {
            targetForm.classList.add('active');
        }
    }

    // Social media icons
    function getSocialIcon(platform) {
        const icons = {
            linkedin: '<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>',
            twitter: '<path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>',
            facebook: '<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>',
            instagram: '<path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>',
            github: '<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>'
        };
        return icons[platform] || '';
    }

    // Newsletter form handler
    async function handleNewsletterSubmit(e) {
        e.preventDefault();
        const emailInput = document.getElementById('newsletter-email');
        const email = emailInput.value;
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;

        submitBtn.innerHTML = '<span>Subscribing...</span>';
        submitBtn.disabled = true;

        try {
            let result;
            if (window.SupabaseService && window.SupabaseService.isConnected()) {
                result = await SupabaseService.Database.newsletter.subscribe(email);
            } else {
                // Fallback to localStorage
                result = saveNewsletterLocal(email);
            }

            if (result.alreadySubscribed) {
                alert('You are already subscribed to our newsletter!');
            } else if (result.error) {
                throw result.error;
            } else {
                alert('Thank you for subscribing to our newsletter! 🎉');
                e.target.reset();
            }
        } catch (error) {
            console.error('Newsletter subscription error:', error);
            // Fallback save
            saveNewsletterLocal(email);
            alert('Thank you for subscribing! Your subscription has been saved.');
            e.target.reset();
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    // Save newsletter subscription locally (fallback)
    function saveNewsletterLocal(email) {
        try {
            const stored = JSON.parse(localStorage.getItem('taskmate_newsletter') || '[]');
            if (stored.includes(email)) {
                return { data: null, error: null, alreadySubscribed: true };
            }
            stored.push(email);
            localStorage.setItem('taskmate_newsletter', JSON.stringify(stored));
            return { data: { email }, error: null, alreadySubscribed: false };
        } catch (error) {
            return { data: null, error, alreadySubscribed: false };
        }
    }

    // Feedback modal functionality
    function initializeFeedbackModal() {
        const openBtn = document.getElementById('open-feedback');
        const closeBtn = document.getElementById('close-feedback');
        const cancelBtn = document.getElementById('cancel-feedback');
        const modal = document.getElementById('feedback-modal');
        const form = document.getElementById('feedback-form');

        if (openBtn && modal) {
            openBtn.addEventListener('click', () => {
                modal.classList.add('active');
            });
        }

        if (closeBtn && modal) {
            closeBtn.addEventListener('click', () => {
                modal.classList.remove('active');
            });
        }

        if (cancelBtn && modal) {
            cancelBtn.addEventListener('click', () => {
                modal.classList.remove('active');
            });
        }

        // Close modal when clicking outside
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        }

        // Handle form submission
        if (form) {
            form.addEventListener('submit', handleFeedbackSubmit);
        }
    }

    function handleFeedbackSubmit(e) {
        e.preventDefault();

        const type = document.getElementById('feedback-type').value;
        const message = document.getElementById('feedback-message').value;
        const email = document.getElementById('feedback-email').value;

        // Send to backend API in production
        alert('Thank you for your feedback! We appreciate your input.');

        // Close modal and reset form
        document.getElementById('feedback-modal').classList.remove('active');
        e.target.reset();
    }

    // Public API
    return {
        loadComponents,
        initializeHeader,
        initializeFooter
    };
})();

// Initialize components when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    Components.loadComponents();
});