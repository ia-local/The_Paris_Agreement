// public/js/modals.js

console.log("modals.js chargé."); // Debugging log

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOMContentLoaded dans modals.js."); // Debugging log

    // Récupérer les éléments DOM de la modale du chatbot
    const chatbotModal = document.getElementById('chatbotModal');
    const openChatbotBtn = document.getElementById('openChatbotBtn');
    const closeChatbotBtn = document.getElementById('closeChatbotBtn');
    
    // Récupérer les éléments DOM de la modale média (galerie)
    const mediaModal = document.getElementById('mediaModal');
    const closeMediaModalBtn = document.getElementById('closeMediaModalBtn');

    // Vérifier si tous les éléments nécessaires pour la modale du chatbot existent
    if (!chatbotModal || !openChatbotBtn || !closeChatbotBtn) {
        console.error('Erreur: Un ou plusieurs éléments DOM pour la modale du chatbot sont introuvables. La fonctionnalité de modale pourrait ne pas fonctionner.');
        // Ne pas retourner ici pour permettre aux autres modales de fonctionner si elles sont présentes
    }

    // Vérifier si tous les éléments nécessaires pour la modale média existent
    if (!mediaModal || !closeMediaModalBtn) {
        console.error('Erreur: Un ou plusieurs éléments DOM pour la modale média sont introuvables. La fonctionnalité de modale média pourrait ne pas fonctionner.');
    }


    /**
     * Ouvre la modale du chatbot en ajoutant la classe 'active'.
     */
    function openChatbotModal() {
        if (chatbotModal) {
            chatbotModal.classList.add('active');
            console.log('Modale du chatbot ouverte.'); // Diagnostic
        } else {
            console.error("Impossible d'ouvrir la modale du chatbot : élément introuvable.");
        }
    }

    /**
     * Ferme la modale du chatbot en retirant la classe 'active'.
     */
    function closeChatbotModal() {
        if (chatbotModal) {
            chatbotModal.classList.remove('active');
            console.log('Modale du chatbot fermée.'); // Diagnostic
        }
    }

    /**
     * Ouvre la modale média en ajoutant la classe 'active'.
     */
    function openMediaModal() {
        if (mediaModal) {
            mediaModal.classList.add('active');
            console.log('Modale média ouverte.'); // Diagnostic
        } else {
            console.error("Impossible d'ouvrir la modale média : élément introuvable.");
        }
    }

    /**
     * Ferme la modale média en retirant la classe 'active'.
     */
    function closeMediaModal() {
        if (mediaModal) {
            mediaModal.classList.remove('active');
            console.log('Modale média fermée.'); // Diagnostic
        }
    }


    // Ajouter les écouteurs d'événements pour le chatbot
    if (openChatbotBtn) {
        openChatbotBtn.addEventListener('click', openChatbotModal);
    }
    if (closeChatbotBtn) {
        closeChatbotBtn.addEventListener('click', closeChatbotModal);
    }
    if (chatbotModal) {
        chatbotModal.addEventListener('click', (event) => {
            if (event.target === chatbotModal) {
                closeChatbotModal();
            }
        });
    }

    // Ajouter les écouteurs d'événements pour la modale média
    if (closeMediaModalBtn) {
        closeMediaModalBtn.addEventListener('click', closeMediaModal);
    }
    if (mediaModal) {
        mediaModal.addEventListener('click', (event) => {
            if (event.target === mediaModal) {
                closeMediaModal();
            }
        });
    }

    // Optionnel: Fermer les modales avec la touche Échap
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            if (chatbotModal && chatbotModal.classList.contains('active')) {
                closeChatbotModal();
            }
            if (mediaModal && mediaModal.classList.contains('active')) {
                closeMediaModal();
            }
        }
    });

    // Exposer les fonctions d'ouverture/fermeture des modales globalement si nécessaire
    // (utilisé par d'autres scripts comme gallery.js ou scripts.js)
    window.openChatbotModal = openChatbotModal;
    window.closeChatbotModal = closeChatbotModal;
    window.openMediaModal = openMediaModal;
    window.closeMediaModal = closeMediaModal;
});
