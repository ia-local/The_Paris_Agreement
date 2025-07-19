// docs/js/pages/journalist.js

// IMPORTANT: Assurez-vous que chatbot.js et modals.js sont chargés AVANT ce script
// et que leurs fonctions (initializeChatbotUI, openChatbotModal, openMediaModal) sont accessibles globalement (ex: window.functionName)

document.addEventListener('DOMContentLoaded', () => {
    // Éléments du formulaire d'article (Créer/Modifier)
    const articleForm = document.getElementById('articleForm');
    const articleIdInput = document.getElementById('articleId');
    const articleTitleInput = document.getElementById('articleTitle');
    const articleAuthorInput = document.getElementById('articleAuthor');
    const articleContentTextarea = document.getElementById('articleContent');
    const submitArticleBtn = document.getElementById('submitArticleBtn');
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    const articleMessage = document.getElementById('articleMessage');
    const articleFormTitle = document.getElementById('articleFormTitle');

    const articlesList = document.getElementById('articlesList');

    // Éléments de l'assistant IA (section du dashboard)
    const aiAssistantForm = document.getElementById('aiAssistantForm');
    const aiPrompt = document.getElementById('aiPrompt');
    const aiAssistantMessage = document.getElementById('aiAssistantMessage');
    const aiOutput = document.getElementById('aiOutput');
    const transferToArticleBtn = document.getElementById('transferToArticleBtn');
    const transferTitleButtonsContainer = document.getElementById('transferTitleButtons');

    // Éléments de l'historique des logs IA
    const aiLogsList = document.getElementById('aiLogsList');

    // Éléments de navigation du dashboard
    const dashboardLinks = document.querySelectorAll('.dashboard-link');
    const dashboardSections = document.querySelectorAll('.dashboard-section');

    // Éléments pour la Modale Chatbot (ID corrigé)
    const openChatbotBtn = document.getElementById('openChatbotBtn'); // L'ID corrigé est 'openChatbotBtn'

    // Variable pour stocker les titres générés par l'IA
    let aiGeneratedTitles = [];

    // --- Fonctions d'affichage et de navigation du Dashboard ---

    function showDashboardSection(sectionId) {
        dashboardSections.forEach(section => {
            section.classList.remove('active');
        });
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
        } else {
            console.error(`Section du dashboard avec l'ID '${sectionId}' introuvable.`);
        }

        dashboardLinks.forEach(link => {
            if (link.dataset.sectionId === sectionId) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        if (sectionId === 'published-articles-section') {
            loadArticles();
        } else if (sectionId === 'ai-logs-section') {
            loadAiLogs();
        } else if (sectionId === 'write-article-section') {
            resetArticleForm();
        }
    }

    // Gestion des clics sur les liens de navigation du dashboard
    dashboardLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            // Empêcher la navigation par défaut si c'est le bouton de la modale
            if (link.id === 'openChatbotBtn') { // Utilisation de l'ID corrigé
                e.preventDefault();
                // Utiliser la fonction globale openChatbotModal de modals.js
                if (typeof window.openChatbotModal === 'function') {
                    window.openChatbotModal(); // Ouvre la modale
                    // Assurez-vous ensuite que le chatbot UI est initialisé et que la persona est sélectionnée
                    if (typeof window.initializeChatbotUI === 'function') {
                        window.initializeChatbotUI(); // Initialise/réinitialise l'UI du chatbot
                        // Simuler un clic sur le bouton "Journaliste" pour activer la persona
                        const chatbotModal = document.getElementById('chatbotModal');
                        if (chatbotModal) { // S'assurer que la modale est présente
                            const journalistPersonaButton = chatbotModal.querySelector('[data-persona="journaliste"]');
                            if (journalistPersonaButton && !journalistPersonaButton.classList.contains('active-persona')) {
                                journalistPersonaButton.click(); // Simule le clic
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
            } else {
                e.preventDefault();
                const sectionId = link.dataset.sectionId;
                if (sectionId) {
                    showDashboardSection(sectionId);
                }
            }
        });
    });

    // --- Logique de soumission d'article (Créer/Modifier) ---

    articleForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const id = articleIdInput.value;
        const title = articleTitleInput.value;
        const content = articleContentTextarea.value;
        const author = articleAuthorInput.value;

        articleMessage.textContent = 'Envoi de l\'article...';
        articleMessage.style.color = '#5cb85c';

        let url = '/api/journalist/articles';
        let method = 'POST';

        if (id) {
            url = `/api/journalist/articles/${id}`;
            method = 'PUT';
            articleMessage.textContent = 'Mise à jour de l\'article...';
        }

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ title, content, author }),
            });

            const result = await response.json();

            if (response.ok) {
                articleMessage.textContent = result.message;
                articleMessage.style.color = 'green';
                resetArticleForm();
                showDashboardSection('published-articles-section');
            } else {
                articleMessage.textContent = `Erreur: ${result.message}`;
                articleMessage.style.color = 'red';
            }
        } catch (error) {
            console.error(`Erreur lors de l'opération ${method} sur l'article:`, error);
            articleMessage.textContent = 'Une erreur est survenue lors de la connexion au serveur.';
            articleMessage.style.color = 'red';
        }
    });

    function resetArticleForm() {
        articleIdInput.value = '';
        articleTitleInput.value = '';
        articleAuthorInput.value = '';
        articleContentTextarea.value = '';
        submitArticleBtn.textContent = 'Publier l\'Article';
        articleFormTitle.textContent = 'Rédiger un Nouvel Article';
        cancelEditBtn.style.display = 'none';
        articleMessage.textContent = '';
    }

    cancelEditBtn.addEventListener('click', resetArticleForm);

    // --- Logique de chargement des articles (avec Modifier/Supprimer) ---

    async function loadArticles() {
        articlesList.innerHTML = '<p>Chargement des articles...</p>';
        try {
            const response = await fetch('/api/journalist/articles');
            const articles = await response.json();

            if (articles.length === 0) {
                articlesList.innerHTML = '<p>Aucun article publié pour le moment.</p>';
                return;
            }

            articlesList.innerHTML = '';
            articles.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

            articles.forEach(article => {
                const articleDiv = document.createElement('div');
                articleDiv.classList.add('article-item');
                articleDiv.innerHTML = `
                    <h3>${article.title}</h3>
                    <p>${article.content.substring(0, 300)}...</p>
                    <div class="article-meta">Par ${article.author} le ${new Date(article.timestamp).toLocaleDateString('fr-FR')} à ${new Date(article.timestamp).toLocaleTimeString('fr-FR')}</div>
                    <div class="action-buttons">
                        <button class="edit-btn" data-id="${article.id}">
                            <i class="fas fa-edit"></i> Modifier
                        </button>
                        <button class="delete-btn" data-id="${article.id}">
                            <i class="fas fa-trash-alt"></i> Supprimer
                        </button>
                    </div>
                `;
                articlesList.appendChild(articleDiv);
            });

            document.querySelectorAll('.edit-btn').forEach(button => {
                button.addEventListener('click', (e) => editArticle(e.currentTarget.dataset.id));
            });
            document.querySelectorAll('.delete-btn').forEach(button => {
                button.addEventListener('click', (e) => deleteArticle(e.currentTarget.dataset.id));
            });

        } catch (error) {
            console.error('Erreur lors du chargement des articles:', error);
            articlesList.innerHTML = '<p style="color: red;">Impossible de charger les articles. Erreur de serveur.</p>';
        }
    }

    async function editArticle(id) {
        try {
            const response = await fetch('/api/journalist/articles');
            const articles = await response.json();
            const articleToEdit = articles.find(article => article.id === id);

            if (articleToEdit) {
                articleIdInput.value = articleToEdit.id;
                articleTitleInput.value = articleToEdit.title;
                articleAuthorInput.value = articleToEdit.author;
                articleContentTextarea.value = articleToEdit.content;

                submitArticleBtn.textContent = 'Mettre à Jour l\'Article';
                articleFormTitle.textContent = 'Modifier un Article';
                cancelEditBtn.style.display = 'inline-block';

                showDashboardSection('write-article-section');
            } else {
                alert('Article à modifier non trouvé.');
            }
        } catch (error) {
            console.error('Erreur lors de la préparation de l\'édition:', error);
            alert('Impossible de charger les détails de l\'article pour modification.');
        }
    }

    async function deleteArticle(id) {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cet article ? Cette action est irréversible.')) {
            return;
        }

        try {
            const response = await fetch(`/api/journalist/articles/${id}`, {
                method: 'DELETE',
            });

            const result = await response.json();

            if (response.ok) {
                alert(result.message);
                loadArticles();
            } else {
                alert(`Erreur lors de la suppression: ${result.message}`);
            }
        } catch (error) {
            console.error('Erreur lors de la suppression de l\'article:', error);
            alert('Une erreur est survenue lors de la connexion au serveur pour la suppression.');
        }
    }

    // --- Logique de l'assistant IA (section du dashboard) ---

    aiAssistantForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const promptInput = aiPrompt.value;

        aiAssistantMessage.textContent = 'Demande à l\'IA en cours...';
        aiAssistantMessage.style.color = '#5cb85c';
        aiOutput.textContent = 'Génération de la réponse...';
        transferToArticleBtn.style.display = 'none';
        transferTitleButtonsContainer.innerHTML = '';

        try {
            const logsResponse = await fetch('/logs');
            if (!logsResponse.ok) {
                throw new Error(`Erreur lors de la récupération des logs: ${logsResponse.statusText}`);
            }
            const allLogs = await logsResponse.json();

            const relevantLogs = allLogs
                .filter(log => ['chatbot', 'journaliste_assistant', 'scientifique', 'lanceur-alerte', 'enquêteur'].includes(log.persona))
                .slice(-10);

            let historyContext = relevantLogs.map(log => {
                const userMsg = log.userMessage ? `User (${log.persona}): ${log.userMessage}` : '';
                const aiResp = log.aiResponse ? `AI (${log.persona}): ${log.aiResponse}` : '';

                return `${userMsg}\n${aiResp}`.trim();
            }).filter(item => item !== '').join('\n\n');

            if (historyContext) {
                historyContext = `Historique des interactions précédentes :\n\n${historyContext}\n\n`;
            } else {
                historyContext = "Aucun historique d'interaction pertinent trouvé.\n\n";
            }

            const fullPrompt = `En tant que journaliste d'investigation spécialisé dans la géo-ingénierie et la crise bioclimatique, aide-moi à rédiger des éléments d'article, des titres percutants (propose plusieurs titres si possible, un par ligne), ou à synthétiser des informations clés. Base-toi sur le contexte suivant et notre historique de discussions. Le ton doit être factuel, critique et axé sur les implications de la Loi Duplomb et les événements de géo-ingénierie en Normandie.

            ${historyContext}
            Ma demande actuelle : ${promptInput}`;

            const response = await fetch('/api/journalist/assist-ai', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt: fullPrompt }),
            });

            const result = await response.json();

            if (response.ok) {
                aiAssistantMessage.textContent = 'Assistance IA générée !';
                aiAssistantMessage.style.color = 'green';
                aiOutput.textContent = result.assistance;

                transferToArticleBtn.style.display = 'inline-block';

                aiGeneratedTitles = extractTitles(result.assistance);
                displayAiTitlesAsButtons(aiGeneratedTitles);

            } else {
                aiAssistantMessage.textContent = `Erreur de l'IA: ${result.message}`;
                aiAssistantMessage.style.color = 'red';
                aiOutput.textContent = 'Erreur lors de la génération de l\'assistance.';
                transferToArticleBtn.style.display = 'none';
                transferTitleButtonsContainer.innerHTML = '';
            }
        } catch (error) {
            console.error('Erreur de connexion à l\'assistant IA:', error);
            aiAssistantMessage.textContent = 'Une erreur est survenue lors de la connexion à l\'IA ou du chargement de l\'historique.';
            aiAssistantMessage.style.color = 'red';
            aiOutput.textContent = 'Impossible de contacter le service d\'assistance IA.';
            transferToArticleBtn.style.display = 'none';
            transferTitleButtonsContainer.innerHTML = '';
        }
    });

    if (transferToArticleBtn) {
        transferToArticleBtn.addEventListener('click', () => {
            const aiGeneratedContent = aiOutput.textContent;
            if (aiGeneratedContent && aiGeneratedContent !== 'Aucune assistance demandée pour le moment.' && aiGeneratedContent !== 'Erreur lors de la génération de l\'assistance.') {
                if (articleContentTextarea.value.trim() === '') {
                    articleContentTextarea.value = aiGeneratedContent;
                } else {
                    articleContentTextarea.value += `\n\n--- Contenu généré par l'IA ---\n\n${aiGeneratedContent}`;
                }
                showDashboardSection('write-article-section');
                alert("Le contenu généré par l'IA a été transféré dans l'éditeur d'article.");
            } else {
                alert("Aucun contenu valide à transférer de l'assistant IA.");
            }
        });
    }

    function extractTitles(text) {
        const lines = text.split('\n').filter(line => line.trim() !== '');
        return lines.filter(line => line.length < 100 && (line.match(/^\d+\.\s*/) || line.match(/^-+\s*/))).map(line => line.replace(/^\d+\.\s*|-+\s*/, '').trim());
    }

    function displayAiTitlesAsButtons(titles) {
        transferTitleButtonsContainer.innerHTML = '';
        if (titles.length > 0) {
            const label = document.createElement('span');
            label.textContent = "Suggérer le titre : ";
            label.style.fontWeight = 'bold';
            label.style.marginRight = '10px';
            transferTitleButtonsContainer.appendChild(label);

            titles.forEach(title => {
                const button = document.createElement('button');
                button.classList.add('btn-secondary');
                button.textContent = title;
                button.title = "Cliquez pour transférer ce titre";
                button.addEventListener('click', () => {
                    articleTitleInput.value = title;
                    showDashboardSection('write-article-section');
                    alert(`Le titre "${title}" a été transféré.`);
                });
                transferTitleButtonsContainer.appendChild(button);
            });
        }
    }

    // --- Logique de chargement des logs IA ---

    async function loadAiLogs() {
        aiLogsList.innerHTML = '<p>Chargement de l\'historique des interactions IA...</p>';
        try {
            const response = await fetch('/logs');
            const logs = await response.json();

            if (logs.length === 0) {
                aiLogsList.innerHTML = '<p>Aucune interaction IA enregistrée pour le moment.</p>';
                return;
            }

            aiLogsList.innerHTML = '';
            logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

            logs.forEach(log => {
                const logDiv = document.createElement('div');
                logDiv.classList.add('log-entry');
                logDiv.innerHTML = `
                    <h4>Interaction ID: ${log.id.substring(0, 8)}...</h4>
                    <div class="log-meta">Date: ${new Date(log.timestamp).toLocaleString('fr-FR')} | Persona: ${log.persona}</div>
                    <p><strong>Question :</strong> <pre>${log.userMessage || 'N/A'}</pre></p>
                    <p><strong>Réponse IA :</strong> <pre>${log.aiResponse || 'N/A'}</pre></p>
                `;
                aiLogsList.appendChild(logDiv);
            });
        } catch (error) {
            console.error('Erreur lors du chargement des logs IA:', error);
            aiLogsList.innerHTML = '<p style="color: red;">Impossible de charger l\'historique des interactions IA. Erreur de serveur.</p>';
        }
    }

    // --- Initialisation du Dashboard ---
    showDashboardSection('ai-assistant-section'); // Afficher la première section par défaut au chargement
});
