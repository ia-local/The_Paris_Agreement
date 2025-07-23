// public/js/chatbot.js

// Variable globale pour stocker l'historique de conversation
let conversationHistory = [];
// Variable pour stocker la persona active
let activePersona = null;

/**
 * Affiche un message dans l'historique du chat.
 * @param {string} message - Le texte du message.
 * @param {string} sender - Le type d'expéditeur ('user' ou 'ai').
 */
function displayMessage(message, sender) {
    const chatHistory = document.getElementById('chatHistory');
    if (!chatHistory) {
        console.error("Élément 'chatHistory' introuvable.");
        return;
    }

    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', `${sender}-message`);
    messageDiv.innerHTML = `<p>${message}</p>`; // Utiliser innerHTML pour permettre le HTML si l'IA en génère
    chatHistory.appendChild(messageDiv);

    // Faire défiler vers le bas pour voir le dernier message
    chatHistory.scrollTop = chatHistory.scrollHeight;
}

/**
 * Ajoute des boutons de transfert à la fin de la conversation.
 * Ces boutons permettent de transférer la conversation actuelle vers une autre persona.
 */
function addTransferButtons() {
    const chatHistory = document.getElementById('chatHistory');
    if (!chatHistory) {
        console.error("Élément 'chatHistory' introuvable pour ajouter les boutons de transfert.");
        return;
    }

    // Supprimer les anciens boutons de transfert s'ils existent
    const existingButtons = chatHistory.querySelector('.transfer-buttons-container');
    if (existingButtons) {
        existingButtons.remove();
    }

    const transferContainer = document.createElement('div');
    transferContainer.classList.add('transfer-buttons-container');

    // Définir les personas cibles
    const personas = [
        { id: 'scientifique', text: 'Scientifique', page: 'scientist.html' },
        { id: 'journaliste', text: 'Journaliste', page: 'journalist.html' },
        { id: 'enquêteur', text: 'Enquêteur', page: 'investigator.html' },
        { id: 'lanceur-alerte', text: 'Lanceur d\'alerte', page: 'whistleblower.html' }
    ];

    personas.forEach(persona => {
        // Ne pas créer de bouton de transfert vers la persona active
        if (persona.id === activePersona) {
            return;
        }

        const button = document.createElement('button');
        button.classList.add('transfer-btn');
        button.textContent = `Transférer à ${persona.text}`;
        button.dataset.targetPersona = persona.id;
        button.title = `Transférer cette conversation à la page ${persona.text}`;

        button.addEventListener('click', () => {
            // Encode l'historique de conversation pour le passer dans l'URL
            const encodedHistory = encodeURIComponent(JSON.stringify(conversationHistory));
            
            // Fermer la modale du chatbot avant de rediriger
            if (typeof window.closeChatbotModal === 'function') {
                window.closeChatbotModal();
            } else {
                console.warn("Fonction closeChatbotModal non disponible. Assurez-vous que modals.js est chargé.");
            }

            // Rediriger vers la page cible avec l'historique en paramètre d'URL
            window.location.href = `pages/${persona.page}?conversation=${encodedHistory}`;
        });
        transferContainer.appendChild(button);
    });

    chatHistory.appendChild(transferContainer);
    chatHistory.scrollTop = chatHistory.scrollHeight; // Faire défiler pour voir les boutons
}


/**
 * Envoie un message au chatbot (backend) et gère la réponse.
 */
async function sendMessage() {
    const chatInput = document.getElementById('chatInput');
    const userMessage = chatInput.value.trim();

    if (userMessage === '') {
        return; // Ne rien envoyer si le message est vide
    }

    if (!activePersona) {
        displayMessage("Veuillez choisir une persona avant de commencer à discuter.", "ai");
        return;
    }

    displayMessage(userMessage, 'user');
    chatInput.value = ''; // Effacer l'input après envoi

    // Ajouter le message de l'utilisateur à l'historique
    conversationHistory.push({ role: "user", content: userMessage });

    // Afficher un indicateur de chargement
    displayMessage("...", "ai-loading"); // Une classe CSS pour un loader simple

    try {
        // L'endpoint est `/chatbot` et la persona est envoyée dans le corps
        const endpoint = `/chatbot`;
        console.log(`Envoi du message à l'endpoint: ${endpoint} avec persona: ${activePersona}`);

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: userMessage,
                persona: activePersona, // Envoyer la persona active
                history: conversationHistory // Envoyer l'historique complet
            })
        });

        if (!response.ok) {
            const errorText = await response.text(); // Tenter de lire le corps de l'erreur
            throw new Error(`Erreur HTTP: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        const aiResponse = data.reply; // La réponse de l'IA est dans 'reply'

        // Supprimer l'indicateur de chargement avant d'afficher la vraie réponse
        const loadingMessage = document.querySelector('.ai-loading');
        if (loadingMessage) {
            loadingMessage.remove();
        }

        displayMessage(aiResponse, 'ai');
        // Ajouter la réponse de l'IA à l'historique
        conversationHistory.push({ role: "assistant", content: aiResponse });

        // AJOUT : Ajouter les boutons de transfert après la réponse de l'IA
        addTransferButtons();

    } catch (error) {
        console.error('Erreur lors de l\'envoi du message au chatbot:', error);
        // Supprimer l'indicateur de chargement en cas d'erreur
        const loadingMessage = document.querySelector('.ai-loading');
        if (loadingMessage) {
            loadingMessage.remove();
        }
        displayMessage(`Désolé, une erreur est survenue lors de la communication avec l'IA. Veuillez réessayer.`, 'ai');
    }
}

/**
 * Efface l'historique du chat et réinitialise la conversation.
 */
function clearChat() {
    const chatHistory = document.getElementById('chatHistory');
    if (chatHistory) {
        chatHistory.innerHTML = '';
    }
    conversationHistory = [];
    activePersona = null; // Réinitialiser la persona

    // Supprimer les boutons de transfert s'ils existent
    const existingButtons = chatHistory.querySelector('.transfer-buttons-container');
    if (existingButtons) {
        existingButtons.remove();
    }

    // Réinitialiser l'affichage du chat avec le message de bienvenue
    displayMessage(`Bienvenue ! Je suis votre assistant bioclimatique. Choisissez une persona pour commencer à discuter.`, "ai");
    
    // Désactiver visuellement les boutons de persona
    const personaButtons = document.querySelectorAll('.persona-btn');
    personaButtons.forEach(btn => {
        btn.classList.remove('active-persona');
        btn.classList.remove('bg-blue-500', 'text-white');
        btn.classList.add('bg-gray-200', 'hover:bg-gray-300');
    });
    console.log("Chat effacé et persona réinitialisée.");
}

/**
 * Initialise les écouteurs d'événements pour le chatbot.
 * Cette fonction est rendue globale pour être appelée depuis scripts.js
 */
window.initializeChatbotUI = function() {
    const sendBtn = document.getElementById('sendBtn');
    const chatInput = document.getElementById('chatInput');
    const clearChatBtn = document.getElementById('clearChatBtn');
    const personaButtons = document.querySelectorAll('.persona-btn');
    const chatHistory = document.getElementById('chatHistory');

    if (sendBtn) {
        sendBtn.addEventListener('click', sendMessage);
    }
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
    if (clearChatBtn) {
        clearChatBtn.addEventListener('click', clearChat);
    }

    personaButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Réinitialiser l'historique et l'affichage lors du changement de persona
            conversationHistory = [];
            if (chatHistory) {
                chatHistory.innerHTML = '';
            }

            // Mettre à jour la persona active
            activePersona = button.dataset.persona;
            console.log(`Persona activée: ${activePersona}`);

            // Mettre à jour l'état visuel des boutons de persona
            personaButtons.forEach(btn => {
                btn.classList.remove('active-persona');
                btn.classList.remove('bg-blue-500', 'text-white');
                btn.classList.add('bg-gray-200', 'hover:bg-gray-300');
            });
            button.classList.add('active-persona');
            button.classList.remove('bg-gray-200', 'hover:bg-gray-300');
            button.classList.add('bg-blue-500', 'text-white');

            displayMessage(`Vous discutez maintenant en tant que "${button.textContent}". Comment puis-je vous aider ?`, "ai");

            // Supprimer les boutons de transfert s'ils existent lors du changement de persona
            const existingButtons = chatHistory.querySelector('.transfer-buttons-container');
            if (existingButtons) {
                existingButtons.remove();
            }
        });
    });

    // Initialisation : sélectionner le bouton de la persona par défaut
    // Utilisation de 'scientifique' comme persona par défaut
    const defaultPersonaButton = document.querySelector(`[data-persona="scientifique"]`);
    if (defaultPersonaButton) {
        defaultPersonaButton.classList.add('active-persona');
        defaultPersonaButton.classList.remove('bg-gray-200', 'hover:bg-gray-300');
        defaultPersonaButton.classList.add('bg-blue-500', 'text-white');
        activePersona = "scientifique"; // Définir la persona active initialement

        // Message initial
        displayMessage(`Bienvenue ! Je suis votre assistant bioclimatique. J'opère en tant que "${defaultPersonaButton.textContent}". Posez-moi vos questions.`, "ai");
    }

    console.log("Chatbot UI initialisé.");
};

// Pas besoin d'appeler initializeChatbotUI ici directement,
// car il sera appelé par scripts.js après le chargement du DOM.
