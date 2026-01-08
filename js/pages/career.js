document.addEventListener('DOMContentLoaded', function () {
    // Animate statistics counter
    const statNumbers = document.querySelectorAll('.stat-number');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const stat = entry.target;
                const target = parseInt(stat.getAttribute('data-count'));
                const duration = 2000;
                const step = target / (duration / 16);
                let current = 0;

                const timer = setInterval(() => {
                    current += step;
                    if (current >= target) {
                        current = target;
                        clearInterval(timer);
                    }
                    stat.textContent = Math.floor(current) + (stat.getAttribute('data-count').includes('.') ? '%' : '+');
                }, 16);

                observer.unobserve(stat);
            }
        });
    }, { threshold: 0.5 });

    statNumbers.forEach(stat => observer.observe(stat));

    // Job filtering
    const filterBtns = document.querySelectorAll('.filter-btn');
    const jobCards = document.querySelectorAll('.job-card');
    const noJobsMessage = document.querySelector('.no-jobs-message');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active filter button
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.getAttribute('data-filter');

            // Filter jobs
            let visibleJobs = 0;
            jobCards.forEach(card => {
                if (filter === 'all' || card.getAttribute('data-category') === filter) {
                    card.style.display = 'block';
                    visibleJobs++;
                } else {
                    card.style.display = 'none';
                }
            });

            // Show/hide no jobs message
            noJobsMessage.style.display = visibleJobs === 0 ? 'block' : 'none';
        });
    });

    // Application modal
    const applyBtns = document.querySelectorAll('.btn-apply');
    const applicationModal = document.getElementById('application-modal');
    const closeApplication = document.getElementById('close-application');
    const cancelApplication = document.getElementById('cancel-application');
    const modalJobTitle = document.getElementById('modal-job-title');
    const appliedJobInput = document.getElementById('applied-job');

    applyBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const jobTitle = btn.getAttribute('data-job');
            modalJobTitle.textContent = jobTitle;
            appliedJobInput.value = jobTitle;
            applicationModal.classList.add('active');
        });
    });

    // Close application modal
    [closeApplication, cancelApplication].forEach(btn => {
        btn.addEventListener('click', () => {
            applicationModal.classList.remove('active');
        });
    });

    // Careers feedback modal
    const feedbackOptionBtns = document.querySelectorAll('.btn-feedback-option');
    const careersFeedbackModal = document.getElementById('careers-feedback-modal');
    const closeCareersFeedback = document.getElementById('close-careers-feedback');
    const cancelCareersFeedback = document.getElementById('cancel-careers-feedback');
    const feedbackModalTitle = document.getElementById('feedback-modal-title');
    const feedbackTypeInput = document.getElementById('feedback-type');
    const speculativeBtn = document.getElementById('open-speculative');

    feedbackOptionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const feedbackType = btn.getAttribute('data-type');
            const titles = {
                'application': 'Application Experience Feedback',
                'interview': 'Interview Process Feedback',
                'suggestions': 'General Suggestions'
            };
            feedbackModalTitle.textContent = titles[feedbackType];
            feedbackTypeInput.value = feedbackType;
            careersFeedbackModal.classList.add('active');
        });
    });

    if (speculativeBtn) {
        speculativeBtn.addEventListener('click', () => {
            document.getElementById('applicant-role').scrollIntoView({ behavior: 'smooth' });
        });
    }

    // Close careers feedback modal
    [closeCareersFeedback, cancelCareersFeedback].forEach(btn => {
        btn.addEventListener('click', () => {
            careersFeedbackModal.classList.remove('active');
        });
    });

    // Close modals when clicking outside
    [applicationModal, careersFeedbackModal].forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });

    // Form submissions (for demo purposes)
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            // In a real application, you would send this data to your backend
            alert('Thank you for your submission! This is a demo - in a real application, this would be processed by our recruitment team.');
            form.reset();

            // Close modals if open
            applicationModal.classList.remove('active');
            careersFeedbackModal.classList.remove('active');
        });
    });
});