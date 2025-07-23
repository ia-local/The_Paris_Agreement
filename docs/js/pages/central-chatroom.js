// public/js/pages/central-chatroom.js

document.addEventListener('DOMContentLoaded', async () => {
    const centralChatHistoryDiv = document.getElementById('centralChatHistory');
    const centralChatInput = document.getElementById('centralChatInput');
    const sendGlobalMessageBtn = document.getElementById('sendGlobalMessageBtn');
    const personaButtons = document.querySelectorAll('.persona-selection .persona-btn');
    const newConversationBtn = document.getElementById('newConversationBtn');
    const conversationListUl = document.querySelector('#conversationList ul');
    const clearCurrentConversationBtn = document.getElementById('clearCurrentConversationBtn');
    const askCentralAIBtn = document.getElementById('askCentralAIBtn');

    // Structure pour stocker toutes les conversations
    let conversations = {}; // { conversationId: { id, title, persona, history: [] } }
    let currentConversationId = 'default-global-chat'; // ID de la conversation active
    let activePersona = 'general'; // Persona actuellement sélectionnée pour les nouveaux messages

    // --- Fonctions utilitaires pour le stockage local ---
    function saveConversations() {
        localStorage.setItem('centralChatConversations', JSON.stringify(conversations));
        localStorage.setItem('currentConversationId', currentConversationId);
    }

    function loadConversations() {
        const savedConversations = localStorage.getItem('centralChatConversations');
        const savedCurrentId = localStorage.getItem('currentConversationId');

        if (savedConversations) {
            conversations = JSON.parse(savedConversations);
            // S'assurer que 'default-global-chat' existe toujours si les autres ont été supprimées
            if (Object.keys(conversations).length === 0 && !conversations['default-global-chat']) {
                 conversations['default-global-chat'] = {
                    id: 'default-global-chat',
                    title: 'Chat Global',
                    persona: 'general',
                    history: []
                };
            }
        } else {
            // Initialisation si aucune conversation n'est trouvée
            conversations = {
                'default-global-chat': {
                    id: 'default-global-chat',
                    title: 'Chat Global',
                    persona: 'general',
                    history: []
                }
            };
        }

        if (savedCurrentId && conversations[savedCurrentId]) {
            currentConversationId = savedCurrentId;
        } else {
            currentConversationId = 'default-global-chat'; // Revenir au chat global par défaut
        }
    }

    // --- Fonctions d'affichage des messages ---

    // Fonction pour créer un ID unique (simple pour le frontend, le backend utilise UUID)
    function generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    function displayMessage(message, type, sourcePersona = null) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', `${type}-message`);

        let content = message;
        if (sourcePersona && type === 'ai' && sourcePersona !== 'global') { // Ajouter la persona source pour les messages transférés
            content = `<span class="message-source">(${sourcePersona.charAt(0).toUpperCase() + sourcePersona.slice(1)})</span> ${message}`;
        }
        messageElement.innerHTML = content;
        centralChatHistoryDiv.appendChild(messageElement);
        centralChatHistoryDiv.scrollTop = centralChatHistoryDiv.scrollHeight; // Scroll to bottom
    }

    function displayConversationSeparator(title) {
        const separator = document.createElement('div');
        separator.classList.add('conversation-separator');
        separator.innerHTML = `<span>${title}</span>`;
        centralChatHistoryDiv.appendChild(separator);
        centralChatHistoryDiv.scrollTop = centralChatHistoryDiv.scrollHeight;
    }

    function renderCurrentConversation() {
        centralChatHistoryDiv.innerHTML = ''; // Clear current history display
        const currentConv = conversations[currentConversationId];
        if (!currentConv) {
            displayMessage("Sélectionnez ou créez une conversation.", "system");
            return;
        }

        displayConversationSeparator(currentConv.title);

        if (currentConv.history.length === 0) {
            if (currentConv.persona === 'general') {
                displayMessage("Ceci est un nouveau chat central. Posez une question globale ou transférez un message.", "system");
            } else {
                displayMessage(`Ceci est une nouvelle conversation avec la persona ${currentConv.persona.charAt(0).toUpperCase() + currentConv.persona.slice(1)}.`, "system");
            }
        } else {
            currentConv.history.forEach(msg => {
                displayMessage(msg.content, msg.role, msg.sourcePersona);
            });
        }
    }

    // --- Gestion des conversations (UI et Logique) ---

    function createNewConversation(title, persona = 'general', initialMessage = null) {
        const newId = generateUUID();
        conversations[newId] = {
            id: newId,
            title: title,
            persona: persona,
            history: initialMessage ? [initialMessage] : []
        };
        currentConversationId = newId;
        saveConversations();
        updateConversationListUI();
        renderCurrentConversation();
        highlightActiveConversation();
        highlightActivePersona(persona);
    }

    function switchConversation(convId) {
        if (conversations[convId]) {
            currentConversationId = convId;
            saveConversations();
            renderCurrentConversation();
            highlightActiveConversation();
            highlightActivePersona(conversations[convId].persona);
        }
    }

    function deleteConversation(convId) {
        if (convId === 'default-global-chat') {
            alert("Le chat global par défaut ne peut pas être supprimé.");
            return;
        }
        if (confirm(`Êtes-vous sûr de vouloir supprimer la conversation "${conversations[convId].title}" ?`)) {
            delete conversations[convId];
            if (currentConversationId === convId) {
                currentConversationId = 'default-global-chat'; // Revenir au chat global
            }
            saveConversations();
            updateConversationListUI();
            renderCurrentConversation();
            highlightActiveConversation();
        }
    }

    function updateConversationListUI() {
        conversationListUl.innerHTML = ''; // Clear current list
        for (const id in conversations) {
            const conv = conversations[id];
            const listItem = document.createElement('li');
            listItem.dataset.id = id;
            listItem.textContent = conv.title;

            // Bouton de suppression
            const deleteButton = document.createElement('button');
            deleteButton.classList.add('delete-btn');
            deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
            deleteButton.dataset.id = id; // Store ID for event delegation
            deleteButton.title = `Supprimer la conversation "${conv.title}"`;

            listItem.appendChild(deleteButton);
            conversationListUl.appendChild(listItem);

            listItem.addEventListener('click', (event) => {
                // Empêcher le clic sur le LI de se propager au bouton de suppression
                if (event.target.closest('.delete-btn')) {
                    return;
                }
                switchConversation(conv.id);
            });
            deleteButton.addEventListener('click', (event) => {
                event.stopPropagation(); // Stop propagation to prevent listItem click
                deleteConversation(conv.id);
            });
        }
    }

    function highlightActiveConversation() {
        document.querySelectorAll('#conversationList li').forEach(li => {
            li.classList.remove('active-conversation');
        });
        const activeLi = document.querySelector(`#conversationList li[data-id="${currentConversationId}"]`);
        if (activeLi) {
            activeLi.classList.add('active-conversation');
        }
    }

    function highlightActivePersona(persona) {
        personaButtons.forEach(btn => {
            btn.classList.remove('active-persona');
            if (btn.dataset.persona === persona) {
                btn.classList.add('active-persona');
            }
        });
    }

    // --- Logique d'envoi de messages ---

    async function sendMessage(message, sourcePersonaOverride = null) {
        if (!message.trim()) return;

        const currentConv = conversations[currentConversationId];
        if (!currentConv) {
            displayMessage("Erreur: Aucune conversation active.", "system");
            return;
        }

        const userMessage = { id: generateUUID(), role: 'user', content: message, timestamp: new Date().toISOString() };
        currentConv.history.push(userMessage);
        displayMessage(message, 'user');
        centralChatInput.value = '';
        saveConversations();

        // Déterminer quelle IA appeler
        const personaToSend = sourcePersonaOverride || currentConv.persona;

        try {
            let aiResponseText = "Désolé, je n'ai pas pu générer de réponse.";
            let apiEndpoint = '';
            let requestBody = {};

            if (personaToSend === 'general') {
                // Appel à l'IA centrale
                apiEndpoint = '/api/central-chatroom/assist-ai';
                requestBody = {
                    prompt: message,
                    // Adapter l'historique pour l'IA centrale
                    // L'IA centrale interprète les messages de persona comme 'assistant'
                    history: currentConv.history.map(msg => ({
                        role: msg.role === 'user' ? 'user' : 'assistant',
                        // Préfixe le contenu avec la persona source pour que l'IA centrale comprenne d'où vient le message
                        content: (msg.role === 'ai' && msg.sourcePersona && msg.sourcePersona !== 'global')
                                ? `(${msg.sourcePersona.charAt(0).toUpperCase() + msg.sourcePersona.slice(1)}) ${msg.content}`
                                : msg.content,
                        sourcePersona: msg.sourcePersona || (msg.role === 'ai' ? currentConv.persona : 'global') // Marquer la source de la persona
                    }))
                };
            } else {
                // Appel à l'IA spécifique de la persona
                apiEndpoint = '/chatbot';
                // Adapter l'historique pour l'API /chatbot (attends role: user/assistant, content)
                // CLÉ DE LA CORRECTION : Préfixer les messages de l'IA avec leur source persona
                requestBody = {
                    message: message,
                    persona: personaToSend,
                    history: currentConv.history.filter(msg => msg.role !== 'system').map(msg => {
                        let contentToUse = msg.content;
                        if (msg.role === 'ai' && msg.sourcePersona && msg.sourcePersona !== personaToSend) {
                            // Si c'est un message d'IA et qu'il provient d'une *autre* persona (ou de l'IA générale),
                            // préfixer le contenu pour que l'IA ciblée comprenne le contexte.
                            let prefix = msg.sourcePersona === 'general' ? 'IA Centrale' : (msg.sourcePersona.charAt(0).toUpperCase() + msg.sourcePersona.slice(1));
                            contentToUse = `(${prefix}) ${msg.content}`;
                        }
                        return { role: msg.role === 'ai' ? 'assistant' : msg.role, content: contentToUse };
                    })
                };
            }

            const response = await fetch(apiEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Erreur HTTP: ${response.status}`);
            }

            const data = await response.json();
            aiResponseText = data.reply || data.assistance || aiResponseText;

            const aiMessage = {
                id: generateUUID(),
                role: 'ai',
                content: aiResponseText,
                timestamp: new Date().toISOString(),
                sourcePersona: personaToSend // Marquer la persona qui a répondu
            };
            currentConv.history.push(aiMessage);
            displayMessage(aiResponseText, 'ai', personaToSend);
            saveConversations();

        } catch (error) {
            console.error('Erreur lors de l\'envoi du message à l\'IA:', error);
            const errorMessage = `Désolé, une erreur est survenue lors de la communication avec l'IA (${personaToSend}). ${error.message}`;
            const errorAiMessage = { id: generateUUID(), role: 'ai', content: errorMessage, timestamp: new Date().toISOString(), sourcePersona: personaToSend };
            currentConv.history.push(errorAiMessage);
            displayMessage(errorMessage, 'ai', personaToSend); // Afficher l'erreur dans le chat
            saveConversations();
        }
    }

    // --- Gestion des événements ---

    sendGlobalMessageBtn.addEventListener('click', () => {
        sendMessage(centralChatInput.value);
    });

    centralChatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage(centralChatInput.value);
        }
    });

    personaButtons.forEach(button => {
        button.addEventListener('click', () => {
            const newPersona = button.dataset.persona;
            if (activePersona !== newPersona) {
                activePersona = newPersona;
                highlightActivePersona(activePersona);
                
                // Si la conversation active est le chat global par défaut et qu'une persona est sélectionnée,
                // proposer de créer une nouvelle conversation pour cette persona.
                if (currentConversationId === 'default-global-chat' && newPersona !== 'general') {
                    const confirmNew = confirm(`Vous avez sélectionné la persona "${activePersona.charAt(0).toUpperCase() + activePersona.slice(1)}". Voulez-vous créer une nouvelle conversation pour cette persona ?`);
                    if (confirmNew) {
                        createNewConversation(`Chat avec ${activePersona.charAt(0).toUpperCase() + activePersona.slice(1)}`, activePersona);
                    } else {
                        // Rester sur le chat global mais la persona est 'activePersona' pour les prochains envois
                        displayMessage(`Vous êtes sur le Chat Global. Les prochains messages seront envoyés à l'IA "${activePersona.charAt(0).toUpperCase() + activePersona.slice(1)}" (si vous cliquez sur 'Envoyer' ou 'Demander à l'IA').`, 'system');
                    }
                } else {
                    // Si on change de persona mais qu'on est déjà dans une conversation spécifique
                    // Ou si on revient à 'general'
                    conversations[currentConversationId].persona = newPersona; // Met à jour la persona pour la conversation active
                    saveConversations();
                    displayMessage(`Persona active pour cette conversation : ${newPersona.charAt(0).toUpperCase() + newPersona.slice(1)}.`, 'system');
                }
            }
        });
    });


    newConversationBtn.addEventListener('click', () => {
        const title = prompt("Nom de la nouvelle conversation :", `Nouvelle conversation ${Object.keys(conversations).length + 1}`);
        if (title) {
            // Par défaut, une nouvelle conversation est "générale" mais peut être changée par l'utilisateur via les boutons persona
            createNewConversation(title, 'general');
            highlightActivePersona('general'); // Reset active persona for new chat
        }
    });

    clearCurrentConversationBtn.addEventListener('click', () => {
        if (conversations[currentConversationId]) {
            if (confirm(`Êtes-vous sûr de vouloir effacer l'historique de la conversation "${conversations[currentConversationId].title}" ?`)) {
                conversations[currentConversationId].history = [];
                saveConversations();
                renderCurrentConversation();
                displayMessage("Historique de la conversation effacé.", "system");
            }
        }
    });

    askCentralAIBtn.addEventListener('click', () => {
        const currentConv = conversations[currentConversationId];
        if (!currentConv || currentConv.history.length === 0) {
            alert("Il n'y a pas d'historique dans cette conversation pour demander une synthèse à l'IA centrale.");
            return;
        }

        const promptSummary = prompt("Entrez une question pour l'IA centrale (facultatif, sinon l'IA synthétisera l'historique) :", "Veuillez synthétiser et analyser l'historique de cette conversation.");

        // Ici, nous utilisons la fonction sendMessage avec un override de persona vers 'general'
        // et le prompt généré ou fourni par l'utilisateur.
        sendMessage(promptSummary, 'general');
    });

    // --- Fonction de réception des transferts de messages (simulée pour l'instant) ---
    // Cette partie dépendra de comment vous implémentez les transferts depuis d'autres pages.
    // Idéalement, les autres pages appelleraient une API ou utiliseraient des web sockets.
    // Pour un test local, vous pouvez simuler en envoyant un événement ou en ajoutant directement.

    // Exemple de fonction pour ajouter un message transféré (à appeler depuis d'autres scripts ou via une API)
    window.addTransferredMessage = (message, sourcePersona) => {
        if (!message || !sourcePersona) {
            console.warn("Message ou persona manquant pour le transfert.");
            return;
        }

        const currentConv = conversations[currentConversationId];
        if (!currentConv) {
             // Si aucune conversation n'est active, on transfère au chat global par défaut
             switchConversation('default-global-chat');
             const transferredMessage = {
                id: generateUUID(),
                role: 'ai', // Les messages transférés sont des réponses AI (synthétisées)
                content: message,
                timestamp: new Date().toISOString(),
                sourcePersona: sourcePersona // La persona d'origine du transfert
            };
            conversations['default-global-chat'].history.push(transferredMessage);
            saveConversations();
            displayMessage(message, 'ai', sourcePersona);
            displayMessage(`Message transféré depuis la persona ${sourcePersona.charAt(0).toUpperCase() + sourcePersona.slice(1)}.`, 'system');

        } else {
            // Ajouter au chatroom central actuel
            const transferredMessage = {
                id: generateUUID(),
                role: 'ai', // Les messages transférés sont des réponses AI (synthétisées)
                content: message,
                timestamp: new Date().toISOString(),
                sourcePersona: sourcePersona // La persona d'origine du transfert
            };
            currentConv.history.push(transferredMessage);
            saveConversations();
            displayMessage(message, 'ai', sourcePersona);
            displayMessage(`Message transféré depuis la persona ${sourcePersona.charAt(0).toUpperCase() + sourcePersona.slice(1)}.`, 'system');
        }
    };


    // --- Initialisation au chargement de la page ---
    loadConversations();
    updateConversationListUI();
    renderCurrentConversation();
    highlightActiveConversation();
    highlightActivePersona(conversations[currentConversationId] ? conversations[currentConversationId].persona : 'general');
});
