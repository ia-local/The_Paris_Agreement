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

    try {
        // L'endpoint est maintenant `/chatbot` et la persona est envoyée dans le corps
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

        displayMessage(aiResponse, 'ai');
        // Ajouter la réponse de l'IA à l'historique
        conversationHistory.push({ role: "assistant", content: aiResponse });

    } catch (error) {
        console.error('Erreur lors de l\'envoi du message au chatbot:', error);
        displayMessage(`Désolé, une erreur est survenue lors de la communication avec l'IA. Veuillez réessayer.`, 'ai');
    }
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
        clearChatBtn.addEventListener('click', () => {
            conversationHistory = []; // Effacer l'historique
            activePersona = null; // Réinitialiser la persona
            // Réinitialiser l'affichage du chat
            if (chatHistory) {
                chatHistory.innerHTML = `
                    <div class="ai-message message">
                        <p>Bienvenue ! Je suis votre assistant bioclimatique. Choisissez une persona pour commencer à discuter.</p>
                    </div>
                `;
            }
            // Désactiver visuellement les boutons de persona
            personaButtons.forEach(btn => {
                btn.classList.remove('active-persona');
                btn.classList.remove('bg-blue-500', 'text-white');
                btn.classList.add('bg-gray-200', 'hover:bg-gray-300');
            });
            console.log("Chat effacé et persona réinitialisée.");
        });
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
