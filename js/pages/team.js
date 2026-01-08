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
});