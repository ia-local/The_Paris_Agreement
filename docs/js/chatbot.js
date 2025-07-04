// public/js/chatbot.js

// Encapsule toute la logique d'initialisation du chatbot dans une fonction globale
// pour qu'elle puisse être appelée par modals.js ou directement si nécessaire.
function initializeChatbotUI() {
    // Récupération des éléments DOM du chatbot
    const chatHistory = document.getElementById('chatHistory');
    const chatInput = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendBtn');
    const personaButtons = document.querySelectorAll('.persona-btn');
    const clearChatBtn = document.getElementById('clearChatBtn');

    // Vérifie si les éléments DOM nécessaires existent avant de continuer
    if (!chatHistory || !chatInput || !sendBtn || !personaButtons.length || !clearChatBtn) {
        console.error("Erreur: Éléments DOM du chatbot introuvables. L'initialisation a échoué.");
        return;
    }

    // Persona par défaut et historique de conversation
    let currentPersona = 'scientist'; // Persona par défaut
    let conversationHistory = []; // Historique de conversation pour le modèle

    // Fonction pour ajouter un message à l'historique du chat
    function addMessageToHistory(sender, message) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');
        if (sender === 'user') {
            messageDiv.classList.add('user-message');
            messageDiv.innerHTML = `<p>${message}</p>`; // Utiliser innerHTML pour permettre le formatage si le message contient du HTML
        } else {
            messageDiv.classList.add('ai-message');
            messageDiv.innerHTML = message; // La réponse de l'IA peut déjà être formatée en HTML
        }
        chatHistory.appendChild(messageDiv);
        chatHistory.scrollTop = chatHistory.scrollHeight; // Faire défiler vers le bas
    }

    // Fonction pour envoyer un message à l'API du serveur
    async function sendMessage() {
        const userMessage = chatInput.value.trim();
        if (userMessage === '') return;

        addMessageToHistory('user', userMessage);
        conversationHistory.push({ role: 'user', content: userMessage });
        chatInput.value = ''; // Efface l'input après l'envoi

        // Ajoute un indicateur de chargement
        const loadingDiv = document.createElement('div');
        loadingDiv.classList.add('ai-message', 'message');
        loadingDiv.innerHTML = '<p>L\'IA réfléchit... <span class="loading-spinner"></span></p>';
        chatHistory.appendChild(loadingDiv);
        chatHistory.scrollTop = chatHistory.scrollHeight;

        try {
            // Détermine l'endpoint en fonction de la persona
            const endpoint = `/chat-${currentPersona}`;

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userMessage: userMessage,
                    conversationHistory: conversationHistory // Envoie l'historique complet
                })
            });

            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status} - ${response.statusText}`);
            }

            const data = await response.json();
            const aiResponse = data.response;

            // Retire l'indicateur de chargement
            chatHistory.removeChild(loadingDiv);

            addMessageToHistory('ai', aiResponse);
            conversationHistory.push({ role: 'assistant', content: aiResponse });

        } catch (error) {
            console.error('Erreur lors de l\'envoi du message à l\'IA:', error);
            // Retire l'indicateur de chargement et affiche un message d'erreur
            if (chatHistory.contains(loadingDiv)) {
                chatHistory.removeChild(loadingDiv);
            }
            addMessageToHistory('ai', `<p class="text-red-500">Désolé, une erreur est survenue lors de la communication avec l'IA. Veuillez réessayer. (${error.message})</p>`);
        }
    }

    // Gestionnaire d'événements pour le bouton d'envoi
    sendBtn.addEventListener('click', sendMessage);

    // Gestionnaire d'événements pour la touche Entrée dans le champ de saisie
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // Gestionnaire d'événements pour les boutons de persona
    personaButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Retire la classe 'active' de tous les boutons
            personaButtons.forEach(btn => btn.classList.remove('active'));
            // Ajoute la classe 'active' au bouton cliqué
            button.classList.add('active');
            // Met à jour la persona actuelle
            currentPersona = button.dataset.persona;
            // Réinitialise l'historique de conversation lors du changement de persona
            conversationHistory = [];
            // Affiche un message initial spécifique à la nouvelle persona
            chatHistory.innerHTML = `
                <div class="ai-message message">
                    <p>Bienvenue ! Je suis votre assistant en tant que <span class="font-bold">${button.textContent}</span>. Posez-moi vos questions sur les sujets bioclimatiques.</p>
                </div>
            `;
        });
    });

    // Gestionnaire d'événements pour le bouton "Effacer le chat"
    clearChatBtn.addEventListener('click', () => {
        chatHistory.innerHTML = `
            <div class="ai-message message">
                <p>Bienvenue ! Je suis votre assistant bioclimatique. Choisissez une persona pour commencer à discuter.</p>
            </div>
        `;
        conversationHistory = []; // Efface l'historique de conversation
    });

    // Initialisation : sélectionner le bouton de la persona par défaut au chargement
    // et afficher le message initial correspondant.
    const defaultPersonaButton = document.querySelector(`[data-persona="${currentPersona}"]`);
    if (defaultPersonaButton) {
        defaultPersonaButton.classList.add('active');
        chatHistory.innerHTML = `
            <div class="ai-message message">
                <p>Bienvenue ! Je suis votre assistant en tant que <span class="font-bold">${defaultPersonaButton.textContent}</span>. Posez-moi vos questions sur les sujets bioclimatiques.</p>
            </div>
        `;
    }
}

// Rend la fonction d'initialisation disponible globalement
window.initializeChatbotUI = initializeChatbotUI;

// Pour le cas où chatbot.js serait inclus sans être appelé explicitement par modals.js
// (bien que dans votre setup actuel avec index.html, modals.js s'en chargera)
document.addEventListener('DOMContentLoaded', () => {
    // Vérifier si le chatbot n'a pas déjà été initialisé par modals.js
    if (!window.chatbotUIInitialized) {
        initializeChatbotUI();
        window.chatbotUIInitialized = true; // Marquer comme initialisé
    }
});
