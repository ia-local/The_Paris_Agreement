document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('.sidebar-nav a');
    const contentSections = document.querySelectorAll('.content-section');

    function showSection(id) {
        contentSections.forEach(section => {
            section.classList.remove('active');
            if (section.id === id) {
                section.classList.add('active');
            }
        });
    }

    navLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const targetId = event.target.getAttribute('href').substring(1); // Remove '#'
            showSection(targetId);

            navLinks.forEach(nav => nav.classList.remove('active'));
            event.target.classList.add('active');
        });
    });

    // Afficher la première section active au chargement
    if (navLinks.length > 0) {
        const initialTargetId = navLinks[0].getAttribute('href').substring(1);
        showSection(initialTargetId);
        navLinks[0].classList.add('active');
    }
});

