// public/js/modals.js

document.addEventListener('DOMContentLoaded', () => {
    // Récupérer les éléments DOM de la modale du chatbot
    const chatbotModal = document.getElementById('chatbotModal');
    const openChatbotBtn = document.getElementById('openChatbotBtn');
    const closeChatbotModalBtn = document.getElementById('closeChatbotModalBtn'); // Renommé pour correspondre à l'ID dans index.html

    // Vérifier si tous les éléments nécessaires pour la modale du chatbot existent
    if (!chatbotModal || !openChatbotBtn || !closeChatbotModalBtn) {
        console.error('Erreur: Un ou plusieurs éléments DOM pour la modale du chatbot sont introuvables. La fonctionnalité de modale pourrait ne pas fonctionner.');
        return; // Arrêter l'exécution si les éléments ne sont pas là
    }

    /**
     * Ouvre la modale du chatbot en ajoutant la classe 'active'.
     * Appelle initializeChatbotUI() si ce n'est pas déjà fait.
     */
    function openChatbotModal() {
        chatbotModal.classList.add('active');
        console.log('Modale du chatbot ouverte.'); // Diagnostic

        // Initialise le chatbot UI si ce n'est pas déjà fait
        // Cette vérification est importante si initializeChatbotUI est aussi appelée au DOMContentLoaded
        // pour éviter une double initialisation.
        if (window.initializeChatbotUI && !window.chatbotUIInitialized) {
            window.initializeChatbotUI();
            window.chatbotUIInitialized = true; // Marquer comme initialisé
        }
    }

    /**
     * Ferme la modale du chatbot en retirant la classe 'active'.
     */
    function closeChatbotModal() {
        chatbotModal.classList.remove('active');
        console.log('Modale du chatbot fermée.'); // Diagnostic
    }

    // Ajouter les écouteurs d'événements
    // Écouteur pour le bouton d'ouverture du chatbot
    openChatbotBtn.addEventListener('click', openChatbotModal);

    // Écouteur pour le bouton de fermeture à l'intérieur de la modale
    closeChatbotModalBtn.addEventListener('click', closeChatbotModal);

    // Écouteur pour fermer la modale si l'utilisateur clique en dehors de son contenu
    chatbotModal.addEventListener('click', (event) => {
        // Vérifie si le clic a eu lieu directement sur l'overlay (chatbotModal)
        // et non sur un enfant de modal-content
        if (event.target === chatbotModal) {
            closeChatbotModal();
        }
    });

    // Optionnel: Fermer la modale avec la touche Échap
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && chatbotModal.classList.contains('active')) {
            closeChatbotModal();
        }
    });
});
