// server.js
require('dotenv').config(); // Charge les variables d'environnement depuis .env

const express = require('express');
const path = require('path');
// CORRECTION ICI : Utilisez 'fs/promises' pour la compatibilité avec async/await
const fs = require('fs/promises'); // Module pour interagir avec le système de fichiers de manière asynchrone (Promises)
const fsSync = require('fs'); // Gardez fs synchrone si vous avez besoin de fonctions comme existsSync

const Groq = require('groq-sdk'); // SDK Groq pour interagir avec les modèles Groq (ex: gemma2-9b-it)
const { v4: uuidv4 } = require('uuid'); // Pour générer des ID uniques (npm install uuid)

// Initialise l'instance Groq avec la clé API récupérée de process.env.GROQ_API_KEY
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const app = express();
const port = 5007; // Définit le port sur lequel le serveur écoutera

// Configure Express pour servir les fichiers statiques du répertoire 'public'
app.use(express.static(path.join(__dirname, 'docs')));
// Définit une route pour la page d'accueil (racine de l'application '/').
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'docs', 'index.html'));
});

// Middleware pour parser le corps des requêtes en JSON
app.use(express.json());

// --- Configuration des fichiers de log ---
const logDirectory = path.join(__dirname, 'log');
const jsonLogFile = path.join(logDirectory, 'logs.json');
const markdownLogFile = path.join(logDirectory, 'historique.md');

const petitionFilePath = path.join(__dirname, 'petition38.json');

// Route POST pour enregistrer un nouveau vote de pétition
app.post('/api/petition/vote', async (req, res) => {
  const { userId, comment, supportArticle38, timestamp } = req.body;

  if (!userId || !comment || !supportArticle38 || !timestamp) {
    return res.status(400).json({ message: 'Données manquantes pour l\'enregistrement du vote.' });
  }

  try {
    let currentVotes = [];
    // Tenter de lire le fichier existant
    try {
      const data = await fs.readFile(petitionFilePath, 'utf8');
      if (data) { // Vérifier si le fichier n'est pas vide
        currentVotes = JSON.parse(data);
      }
    } catch (readError) {
      // Si le fichier n'existe pas ou est vide, commencer avec un tableau vide
      // Gérer aussi spécifiquement les erreurs de parsing JSON ici pour des diagnostics plus clairs
      if (readError.code === 'ENOENT' || readError instanceof SyntaxError) {
        console.log('Le fichier petition38.json n\'existe pas, est vide ou corrompu, en créant/initialisant un nouveau.');
        currentVotes = [];
      } else {
        throw readError; // Rejeter d'autres erreurs de lecture inattendues
      }
    }

    // Ajouter le nouveau vote
    currentVotes.push({ userId, comment, supportArticle38, timestamp });

    // Écrire les votes mis à jour dans le fichier
    await fs.writeFile(petitionFilePath, JSON.stringify(currentVotes, null, 2), 'utf8');
    res.status(200).json({ message: 'Point de vue enregistré avec succès.' });
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement du point de vue:', error);
    res.status(500).json({ message: 'Erreur interne du serveur lors de l\'enregistrement.' });
  }
});

// Route GET pour récupérer tous les votes de la pétition
app.get('/api/petition/results', async (req, res) => {
  try {
    const data = await fs.readFile(petitionFilePath, 'utf8');
    let votes = [];
    if (data) { // Vérifier si le contenu du fichier n'est pas vide
      votes = JSON.parse(data);
    }
    res.status(200).json(votes);
  } catch (error) {
    // Si le fichier n'existe pas, retourner un tableau vide
    if (error.code === 'ENOENT') {
      res.status(200).json([]);
    }
    // Si c'est une erreur de syntaxe JSON (fichier corrompu ou vide initialement)
    else if (error instanceof SyntaxError) {
      console.error('Erreur de parsing JSON pour petition38.json:', error);
      res.status(500).json({ message: 'Le fichier de données est vide ou corrompu. Veuillez contacter l\'administrateur.' });
    }
    // Pour toute autre erreur inattendue lors de la lecture du fichier
    else {
      console.error('Erreur lors de la lecture des résultats de la pétition:', error);
      res.status(500).json({ message: 'Erreur interne du serveur lors de la récupération des résultats.' });
    }
  }
});


/**
 * Assure que le répertoire de logs existe.
 */
// Utilise fsSync.existsSync car c'est une fonction synchrone et rapide pour vérifier l'existence
function ensureLogDirectoryExists() {
    if (!fsSync.existsSync(logDirectory)) {
        fsSync.mkdirSync(logDirectory, { recursive: true });
        console.log(`Répertoire de logs créé : ${logDirectory}`);
    }
}

/**
 * Enregistre une interaction AI dans les fichiers de logs.
 * @param {string} persona - Le rôle de l'IA (scientifique, lanceur d'alerte, journaliste).
 * @param {string} userMessage - Le message de l'utilisateur.
 * @param {string} aiResponse - La réponse de l'IA.
 * @returns {string} L'ID unique de l'interaction logguée.
 */
async function logInteraction(persona, userMessage, aiResponse) {
    ensureLogDirectoryExists(); // S'assurer que le répertoire existe

    const timestamp = new Date().toISOString();
    const id = uuidv4(); // Génère un ID unique pour cette interaction

    // Enregistrement dans logs.json (format structuré)
    let logs = [];
    // Utilisation de fsSync.existsSync et fsSync.readFileSync ici pour la cohérence avec votre usage actuel
    if (fsSync.existsSync(jsonLogFile)) {
        try {
            const fileContent = fsSync.readFileSync(jsonLogFile, 'utf8');
            if (fileContent) {
                logs = JSON.parse(fileContent);
            }
        } catch (parseError) {
            console.error(`Erreur de lecture ou de parsing de ${jsonLogFile}:`, parseError);
            // Re-initialiser les logs si le fichier est corrompu
            logs = [];
        }
    }

    const newLogEntry = {
        id: id,
        timestamp: timestamp,
        persona: persona,
        userMessage: userMessage,
        aiResponse: aiResponse
    };
    logs.push(newLogEntry);
    fsSync.writeFileSync(jsonLogFile, JSON.stringify(logs, null, 2), 'utf8'); // Utilisation de fsSync.writeFileSync
    console.log(`Interaction logguée dans ${jsonLogFile} (ID: ${id})`);

    // Enregistrement dans historique.md (format lisible)
    const markdownContent = `---
ID: ${id}
Date: ${new Date().toLocaleString('fr-FR')}
Persona: ${persona}
---

**Question de l'utilisateur :**
\`\`\`
${userMessage}
\`\`\`

**Réponse de l'IA (${persona}) :**
\`\`\`
${aiResponse}
\`\`\`

`;
    fsSync.appendFileSync(markdownLogFile, markdownContent, 'utf8'); // Utilisation de fsSync.appendFileSync
    console.log(`Interaction logguée dans ${markdownLogFile}`);

    return id; // Retourne l'ID pour référence si besoin
}



/**
 * Fonction pour obtenir le message système basé sur la persona.
 * Cette fonction est identique à celle du frontend pour garantir la cohérence.
 * @param {string} persona - Le rôle choisi ('scientist', 'whistleblower', 'journalist').
 * @returns {string} Le message système correspondant.
 */
function getSystemMessage(persona) {
    switch (persona) {
        case 'scientist':
            return `Vous êtes un climatologue rigoureux et objectif. Votre rôle est d'analyser les données et de présenter des faits scientifiques sur le dérèglement bioclimatique (incluant Accords de Paris, Protocole de Kyoto, géo-ingénierie, événements extrêmes), en évitant le sensationnalisme. Répondez de manière concise et factuelle.`;
        case 'whistleblower':
            return `Vous êtes un lanceur d'alerte courageux et passionné par la vérité sur la catastrophe bioclimatique (Accords de Paris, Protocole de Kyoto, géo-ingénierie, événements extrêmes). Votre langage est direct, émotionnel et vise à alerter le public sur les dangers imminents, en dénonçant les faits, les morts et les victimes.`;
        case 'journalist':
            return `Vous êtes un journaliste d'investigation indépendant, cherchant à rapporter les faits sur le dérèglement bioclimatique (Accords de Paris, Protocole de Kyoto, géo-ingénierie, événements extrêmes) de manière équilibrée mais critique, en questionnant les narratives officielles et en cherchant la vérité derrière les événements. Formulez vos réponses comme un article de presse ou une enquête.`;
        default:
            return `Vous êtes un assistant IA généraliste.`;
    }
}


/**
 * Fonction générique pour appeler l'API LLM (Groq/Gemma) avec des messages structurés (rôles).
 * Cette fonction est optimisée pour la structure d'API compatible OpenAI utilisée par Groq.
 *
 * @param {Array<Object>} messages - L'historique des messages, incluant le message système et les messages utilisateur/assistant.
 * @returns {Promise<string>} Le texte généré par le modèle.
 */
async function generateContentWithLLM(messages) {
    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: messages, // Passer l'historique complet des messages
            model: "gemma2-9b-it", // Spécifie le modèle Groq à utiliser
            temperature: 0.7,    // Contrôle la créativité (0.0 pour plus déterministe, 1.0 pour plus créatif)
            max_tokens: 500,     // Limite la longueur maximale de la réponse en tokens
            stream: false,       // Indique de ne pas streamer la réponse (attendre la réponse complète)
        });

        // Extrait le contenu textuel de la réponse du modèle
        return chatCompletion.choices[0].message.content;
    } catch (error) {
        // Log les erreurs pour le débogage côté serveur
        console.error("Erreur lors de l'appel à l'API Groq/Gemma:", error);
        // Retourne un message d'erreur clair au client
        return `Erreur lors de la génération du contenu: ${error.message}`;
    }
}

// --- Routes pour générer du contenu en fonction de différents rôles (réutilisées pour le test direct) ---

// Ces routes peuvent être utilisées pour des tests directs ou des usages où
// seul un prompt ponctuel est nécessaire, sans gestion d'historique complexe.

app.get('/generate-content-scientist', async (req, res) => {
    const systemPrompt = getSystemMessage('scientist');
    const userQuery = `Rédigez un court paragraphe (environ 150 mots) sur les observations actuelles des flux atmosphériques et l'impact potentiel de l'injection d'aérosols stratosphériques (comme l'iodure d'argent, observée ce matin, 20 juin 2025, 8h00, avec un plafond gris) sur la formation des nuages naturels. Mettez en lumière la nécessité de données validées pour comprendre ces anomalies climatiques et leurs liens avec les politiques, en particulier la géo-ingénierie vs les réductions d'émissions.`;
    const messages = [
        { role: "system", content: systemPrompt },

         { role: "user", content: userQuery }];
    const content = await generateContentWithLLM(messages);
    // Pas de log ici car ces routes sont pour le "test direct" et le log est pour le chatbot interactif.
    res.send(`<p>${content}</p>`);
});

app.get('/generate-content-whistleblower', async (req, res) => {
    const systemPrompt = getSystemMessage('whistleblower');
    const userQuery = `Écrivez un court paragraphe (environ 150 mots) exprimant l'urgence et le danger des injections d'aérosols stratosphériques (iodure d'argent) observées ce matin (20 juin 2025, 8h00), et leur lien avec le "plafond gris" et la suppression potentielle des nuages naturels. Reliez cela aux événements récents (ouragans, grêlons géants, inondations comme l'ouragan Berry et les crues du Var). Dénoncez la façon dont les Accords de Paris semblent favoriser ces méthodes par rapport au Protocole de Kyoto, mettant des vies en danger sans transparence.`;
    const messages = [
        { role: "system", content: systemPrompt },
        { role: "assistant", content: "blbab abababababzabab" },
        { role: "system", content: "très bien, je comprends ton bla-bla" },
        { role: "user", content: userQuery }];
    const content = await generateContentWithLLM(messages);
    res.send(`<p class="text-red-700 font-bold">${content}</p>`);
});

app.get('/generate-content-journalist', async (req, res) => {
    const systemPrompt = getSystemMessage('journalist');
    const userQuery = `Rédigez un court paragraphe (environ 150 mots) rapportant les observations du 20 juin 2025 (8h00) concernant un "plafond gris" suspecté d'être lié à des pulvérisations aériennes d'iodure d'argent. Mettez en parallèle cette observation avec les dérèglements bioclimatiques récents (ouragans, grêlons de la taille d'une balle de ping-pong, inondations). Questionnez la stratégie des Accords de Paris, qui semble s'orienter vers la géo-ingénierie au détriment des réductions d'émissions préconisées par le Protocole de Kyoto, et l'absence de communication claire sur ces opérations et leurs conséquences.`;
    const messages = [{ role: "system", content: systemPrompt }, { role: "user", content: userQuery }];
    const content = await generateContentWithLLM(messages);
    res.send(`<p>${content}</p>`);
});

// --- Routes pour le Chatbot Interactif ---

/**
 * Endpoint POST pour gérer les conversations du chatbot avec logging.
 * Reçoit la persona active, le message de l'utilisateur, l'historique de conversation.
 * Log l'interaction et renvoie la réponse de l'IA.
 */
app.post('/chat-scientist', async (req, res) => {
    const { userMessage, conversationHistory } = req.body;
    if (!userMessage) {
        return res.status(400).json({ error: "Message utilisateur manquant." });
    }

    const systemMessage = getSystemMessage('scientist');
    let messagesForGroq = [{ role: "system", content: systemMessage }];

    if (conversationHistory && Array.isArray(conversationHistory)) {
        conversationHistory.forEach(msg => {
            if (msg.role === 'user' || msg.role === 'assistant') {
                messagesForGroq.push(msg);
            }
        });
    }
    messagesForGroq.push({ role: "user", content: userMessage });

    try {
        const aiResponse = await generateContentWithLLM(messagesForGroq);
        // Log l'interaction ici
        await logInteraction('scientist', userMessage, aiResponse);
        res.json({ response: aiResponse });
    } catch (error) {
        console.error("Erreur lors de la gestion du chat scientifique:", error);
        res.status(500).json({ error: "Erreur interne du serveur lors de la génération de la réponse scientifique." });
    }
});

app.post('/chat-whistleblower', async (req, res) => {
    const { userMessage, conversationHistory } = req.body;
    if (!userMessage) {
        return res.status(400).json({ error: "Message utilisateur manquant." });
    }

    const systemMessage = getSystemMessage('whistleblower');
    let messagesForGroq = [{ role: "system", content: systemMessage }];

    if (conversationHistory && Array.isArray(conversationHistory)) {
        conversationHistory.forEach(msg => {
            if (msg.role === 'user' || msg.role === 'assistant') {
                messagesForGroq.push(msg);
            }
        });
    }
    messagesForGroq.push({ role: "user", content: userMessage });

    try {
        const aiResponse = await generateContentWithLLM(messagesForGroq);
        // Log l'interaction ici
        await logInteraction('whistleblower', userMessage, aiResponse);
        res.json({ response: aiResponse });
    } catch (error) {
        console.error("Erreur lors de la gestion du chat lanceur d'alerte:", error);
        res.status(500).json({ error: "Erreur interne du serveur lors de la génération de la réponse lanceur d'alerte." });
    }
});

app.post('/chat-journalist', async (req, res) => {
    const { userMessage, conversationHistory } = req.body;
    if (!userMessage) {
        return res.status(400).json({ error: "Message utilisateur manquant." });
    }

    const systemMessage = getSystemMessage('journalist');
    let messagesForGroq = [
        { role: "system", content: systemMessage },
        { role: "user", content: 'ta réponse doit être doit intégralement être rédigé dans une section respect, respectant les normes du Web sémantique W3C au format HTML' }
    
    ];

    if (conversationHistory && Array.isArray(conversationHistory)) {
        conversationHistory.forEach(msg => {
            if (msg.role === 'user' || msg.role === 'assistant') {
                messagesForGroq.push(msg);
            }
        });
    }
    messagesForGroq.push({ role: "user", content: userMessage });

    try {
        const aiResponse = await generateContentWithLLM(messagesForGroq);
        // Log l'interaction ici
        await logInteraction('journalist', userMessage, aiResponse);
        res.json({ response: aiResponse });
    } catch (error) {
        console.error("Erreur lors de la gestion du chat journaliste:", error);
        res.status(500).json({ error: "Erreur interne du serveur lors de la génération de la réponse journaliste." });
    }
});

// --- Routes pour la gestion des logs ---

/**
 * GET /logs
 * Lit et renvoie le contenu de logs.json.
 */
app.get('/logs', (req, res) => {
    ensureLogDirectoryExists();
    // Utilise fsSync ici car c'est une opération synchrone pour la route
    if (fsSync.existsSync(jsonLogFile)) {
        try {
            const logs = JSON.parse(fsSync.readFileSync(jsonLogFile, 'utf8'));
            res.json(logs);
        } catch (error) {
            console.error(`Erreur lors de la lecture de ${jsonLogFile}:`, error);
            res.status(500).json({ error: "Erreur lors de la lecture des logs JSON." });
        }
    } else {
        res.status(200).json([]); // Retourne un tableau vide si le fichier n'existe pas
    }
});

/**
 * GET /historique
 * Lit et renvoie le contenu de historique.md.
 */
app.get('/historique', (req, res) => {
    ensureLogDirectoryExists();
    // Utilise fsSync ici car c'est une opération synchrone pour la route
    if (fsSync.existsSync(markdownLogFile)) {
        try {
            const historique = fsSync.readFileSync(markdownLogFile, 'utf8');
            res.type('text/markdown').send(historique);
        } catch (error) {
            console.error(`Erreur lors de la lecture de ${markdownLogFile}:`, error);
            res.status(500).send("Erreur lors de la lecture de l'historique Markdown.");
        }
    } else {
        res.status(200).send("## Historique des interactions\n\nAucune interaction enregistrée pour le moment.");
    }
});

/**
 * PUT /logs/:id
 * Met à jour une interaction spécifique dans logs.json.
 * @param {string} req.params.id - L'ID de l'entrée de log à mettre à jour.
 * @param {object} req.body - Les données à mettre à jour (ex: { userMessage: "...", aiResponse: "..." }).
 */
app.put('/logs/:id', (req, res) => {
    ensureLogDirectoryExists();
    // Utilise fsSync ici car c'est une opération synchrone pour la route
    if (!fsSync.existsSync(jsonLogFile)) {
        return res.status(404).json({ error: "Fichier de logs non trouvé." });
    }

    try {
        let logs = JSON.parse(fsSync.readFileSync(jsonLogFile, 'utf8'));
        const { id } = req.params;
        const updatedData = req.body;

        const logIndex = logs.findIndex(log => log.id === id);

        if (logIndex === -1) {
            return res.status(404).json({ error: "Interaction non trouvée." });
        }

        // Mettre à jour les champs spécifiés sans modifier l'ID ou le timestamp d'origine
        logs[logIndex] = { ...logs[logIndex], ...updatedData };
        fsSync.writeFileSync(jsonLogFile, JSON.stringify(logs, null, 2), 'utf8');
        res.json({ message: `Interaction ${id} mise à jour avec succès.`, updatedLog: logs[logIndex] });

    } catch (error) {
        console.error(`Erreur lors de la mise à jour de l'interaction ${req.params.id}:`, error);
        res.status(500).json({ error: "Erreur lors de la mise à jour de l'interaction." });
    }
});

/**
 * DELETE /logs/:id
 * Supprime une interaction spécifique de logs.json.
 * Note: La suppression dans historique.md n'est pas gérée via cette route car elle est plus complexe pour un fichier plat.
 * @param {string} req.params.id - L'ID de l'entrée de log à supprimer.
 */
app.delete('/logs/:id', (req, res) => {
    ensureLogDirectoryExists();
    // Utilise fsSync ici car c'est une opération synchrone pour la route
    if (!fsSync.existsSync(jsonLogFile)) {
        return res.status(404).json({ error: "Fichier de logs non trouvé." });
    }

    try {
        let logs = JSON.parse(fsSync.readFileSync(jsonLogFile, 'utf8'));
        const { id } = req.params;

        const initialLength = logs.length;
        logs = logs.filter(log => log.id !== id);

        if (logs.length === initialLength) {
            return res.status(404).json({ error: "Interaction non trouvée." });
        }

        fsSync.writeFileSync(jsonLogFile, JSON.stringify(logs, null, 2), 'utf8');
        res.json({ message: `Interaction ${id} supprimée avec succès.` });

    } catch (error) {
        console.error(`Erreur lors de la suppression de l'interaction ${req.params.id}:`, error);
        res.status(500).json({ error: "Erreur lors de la suppression de l'interaction." });
    }
});


// Démarre le serveur Express et l'écoute sur le port spécifié.
app.listen(port, () => {
    console.log(`Serveur démarré sur http://localhost:${port}`);
    console.log(`Accédez au site à l'adresse du chatbot : http://localhost:${port}/chatbot.html`);
    console.log(`Ou à l'interface de test des assistants : http://localhost:${port}/content-generator.html`);
    // Assurer que le répertoire de logs est prêt au démarrage
    ensureLogDirectoryExists();
});
