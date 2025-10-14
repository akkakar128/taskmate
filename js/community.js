
// Animate statistics counter
document.addEventListener('DOMContentLoaded', function () {
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

    // Event reminder functionality
    const reminderButtons = document.querySelectorAll('.btn-outline');
    reminderButtons.forEach(button => {
        button.addEventListener('click', function () {
            const eventTitle = this.closest('.event-card').querySelector('h3').textContent;
            if (confirm(`Would you like to be reminded about "${eventTitle}"?`)) {
                this.textContent = '✅ Reminder Set';
                this.disabled = true;
                // In a real implementation, this would integrate with a calendar service
            }
        });
    });
});