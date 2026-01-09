// Contact form functionality
document.addEventListener('DOMContentLoaded', function () {
    const contactForm = document.getElementById('main-contact-form');
    const feedbackModal = document.getElementById('feedback-modal');
    const openFeedbackBtn = document.getElementById('open-feedback-form');
    const closeFeedbackBtn = document.getElementById('close-feedback');
    const cancelFeedbackBtn = document.getElementById('cancel-feedback');
    const feedbackForm = document.getElementById('feedback-form');
    const startChatBtn = document.getElementById('start-chat');

    // Main contact form submission
    if (contactForm) {
        contactForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const submitBtn = this.querySelector('.submit-btn');
            const btnText = submitBtn.querySelector('.btn-text');
            const btnLoading = submitBtn.querySelector('.btn-loading');

            // Show loading state
            btnText.style.display = 'none';
            btnLoading.style.display = 'flex';

            try {
                const formData = new FormData(this);
                const contactData = {
                    name: formData.get('name'),
                    email: formData.get('email'),
                    subject: formData.get('subject'),
                    message: formData.get('message')
                };

                // Try Supabase, fallback to localStorage
                if (window.SupabaseService && window.SupabaseService.isConnected()) {
                    const { error } = await SupabaseService.Database.contacts.create(contactData);
                    if (error) throw error;
                } else {
                    saveContactLocal(contactData);
                }

                // Show success message
                alert('Thank you for your message! We\'ll get back to you within 24 hours.');
                this.reset();
            } catch (error) {
                console.error('Contact form error:', error);
                // Fallback save
                const formData = new FormData(this);
                saveContactLocal({
                    name: formData.get('name'),
                    email: formData.get('email'),
                    subject: formData.get('subject'),
                    message: formData.get('message')
                });
                alert('Thank you for your message! It has been saved and we\'ll respond soon.');
                this.reset();
            } finally {
                btnText.style.display = 'block';
                btnLoading.style.display = 'none';
            }
        });
    }

    // Save contact to localStorage (fallback)
    function saveContactLocal(contact) {
        const stored = JSON.parse(localStorage.getItem('taskmate_contacts') || '[]');
        stored.push({
            ...contact,
            id: `local_${Date.now()}`,
            created_at: new Date().toISOString(),
            status: 'pending_sync'
        });
        localStorage.setItem('taskmate_contacts', JSON.stringify(stored));
    }

    // Feedback modal functionality
    if (openFeedbackBtn) {
        openFeedbackBtn.addEventListener('click', () => {
            feedbackModal.classList.add('active');
        });
    }

    if (closeFeedbackBtn) {
        closeFeedbackBtn.addEventListener('click', () => {
            feedbackModal.classList.remove('active');
        });
    }

    if (cancelFeedbackBtn) {
        cancelFeedbackBtn.addEventListener('click', () => {
            feedbackModal.classList.remove('active');
        });
    }

    // Close modal when clicking outside
    if (feedbackModal) {
        feedbackModal.addEventListener('click', (e) => {
            if (e.target === feedbackModal) {
                feedbackModal.classList.remove('active');
            }
        });
    }

    // Feedback form submission
    if (feedbackForm) {
        feedbackForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const formData = new FormData(this);

            alert('Thank you for your valuable feedback! We appreciate your input in making TASKMATE better.');

            // Close modal and reset form
            feedbackModal.classList.remove('active');
            this.reset();

            // Reset star ratings
            const starInputs = this.querySelectorAll('input[name="rating"]');
            starInputs.forEach(input => input.checked = false);
        });
    }

    // Live chat simulation
    if (startChatBtn) {
        startChatBtn.addEventListener('click', () => {
            const now = new Date();
            const hour = now.getHours();
            const isWeekend = now.getDay() === 0 || now.getDay() === 6;

            if (!isWeekend && hour >= 9 && hour < 18) {
                alert('Connecting you to our live chat support...\n\nOur support team will be with you shortly.');
            } else {
                alert('Our live chat is currently offline.\n\nBusiness Hours: Monday-Friday, 9AM-6PM\n\nPlease email us at support@taskmate.com or use our contact form for immediate assistance.');
            }
        });
    }

    // Star rating interaction
    const starLabels = document.querySelectorAll('.rating-stars label');
    starLabels.forEach(label => {
        label.addEventListener('click', function () {
            const stars = this.parentElement;
            const labels = stars.querySelectorAll('label');
            const clickedIndex = Array.from(labels).indexOf(this);

            labels.forEach((label, index) => {
                if (index <= clickedIndex) {
                    label.style.color = '#ffc107';
                } else {
                    label.style.color = '#e4e5e9';
                }
            });
        });
    });
});