document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('.sidebar-nav a');
    const contentSections = document.querySelectorAll('.content-section');
    const openChatbotBtn = document.getElementById('openChatbotBtn'); // Bouton d'ouverture du chatbot

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

    // Gestion de l'ouverture du chatbot
    if (openChatbotBtn) {
        openChatbotBtn.addEventListener('click', () => {
            if (typeof window.openChatbotModal === 'function') {
                window.openChatbotModal(); // Ouvre la modale
                if (typeof window.initializeChatbotUI === 'function') {
                    window.initializeChatbotUI(); // Initialise/réinitialise l'UI du chatbot
                    // Simuler un clic sur le bouton "Lanceur d'alerte" pour activer la persona
                    const chatbotModal = document.getElementById('chatbotModal');
                    if (chatbotModal) {
                        const whistleblowerPersonaButton = chatbotModal.querySelector('[data-persona="lanceur-alerte"]');
                        if (whistleblowerPersonaButton && !whistleblowerPersonaButton.classList.contains('active-persona')) {
                            whistleblowerPersonaButton.click(); // Simule le clic
                        }
                    } else {
                        console.error("L'élément 'chatbotModal' est introuvable après l'ouverture. Vérifiez le HTML.");
                    }
                } else {
                    console.error("La fonction initializeChatbotUI n'est pas disponible. Vérifiez le chargement de chatbot.js.");
                }
            } else {
                console.error("La fonction openChatbotModal (de modals.js) n'est pas disponible. Vérifiez le chargement de modals.js.");
            }
        });
    }

    // Afficher la première section active au chargement
    if (navLinks.length > 0) {
        const initialTargetId = navLinks[0].getAttribute('href').substring(1);
        showSection(initialTargetId);
        navLinks[0].classList.add('active');
    }
});
