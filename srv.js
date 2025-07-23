// server.js
// Ce fichier configure le serveur Express pour l'application Bioclimat.
// Il gère les routes API pour le chatbot, la galerie, la pétition,
// les rapports des différents rôles (journaliste, enquêteur, scientifique, lanceur d'alerte)
// et la gestion CRUD des événements chronologiques pour la cartographie.

require('dotenv').config(); // Charge les variables d'environnement depuis .env (ex: GROQ_API_KEY, GEMINI_API_KEY)
const fs = require('fs/promises'); // Module pour interagir avec le système de fichiers de manière asynchrone (Promises)
const express = require('express'); // Framework web pour Node.js
const path = require('path'); // Utilitaire pour travailler avec les chemins de fichiers et de répertoires
const fsSync = require('fs'); // Version synchrone du module fs, utilisée pour les vérifications d'existence au démarrage

// Importation des SDKs pour les modèles d'IA
const Groq = require('groq-sdk'); // SDK Groq pour interagir avec les modèles Groq (ex: gemma2-9b-it)
const { GoogleGenerativeAI } = require('@google/generative-ai'); // SDK Google Generative AI pour Gemini

// Générateur d'ID unique (nécessite 'npm install uuid')
const { v4: uuidv4 } = require('uuid');

// Initialise l'instance Groq avec la clé API récupérée de process.env.GROQ_API_KEY
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
// Initialise l'instance Google Generative AI avec la clé API récupérée de process.env.GEMINI_API_KEY
const googleGenAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const app = express(); // Crée une instance de l'application Express
const port = 5007; // Définit le port sur lequel le serveur écoutera

// Configure Express pour servir les fichiers statiques du répertoire 'docs'
// Cela rend les fichiers HTML, CSS, JS, etc. du dossier 'docs' accessibles publiquement.
app.use(express.static(path.join(__dirname, 'docs')));

// Définit une route pour la page d'accueil (racine de l'application '/').
// Quand un utilisateur accède à la racine, il reçoit index.html.
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'docs', 'index.html'));
});

// Middleware pour parser le corps des requêtes entrantes en JSON.
// Essentiel pour recevoir des données JSON depuis le frontend (ex: pour les requêtes POST/PUT).
app.use(express.json());

// --- Configuration des chemins des fichiers de log et de données ---
// Tous les fichiers de données persistantes seront stockés dans le répertoire 'log'.
const logDirectory = path.join(__dirname, 'log');
const jsonLogFile = path.join(logDirectory, 'logs.json'); // Logs des interactions IA au format JSON
const markdownLogFile = path.join(logDirectory, 'historique.md'); // Logs des interactions IA au format Markdown

// Fichiers de données spécifiques pour les différentes fonctionnalités
const petitionFilePath = path.join(logDirectory, 'petition_votes.json'); // Votes de la pétition (chemin corrigé pour être dans 'log')
const journalistArticlesPath = path.join(logDirectory, 'journalist_articles.json'); // Articles du journaliste
const investigatorReportsPath = path.join(logDirectory, 'investigator_reports.json'); // Rapports de l'enquêteur
const scientistAnalysesPath = path.join(logDirectory, 'scientist_analyses.json'); // Analyses du scientifique
const whistleblowerChroniclesPath = path.join(logDirectory, 'whistleblower_chronicles.json'); // Chroniques du lanceur d'alerte

// NOUVEL AJOUT : Chemin pour le fichier des événements chronologiques (pour la carte et la frise)
const chronologicalEventsPath = path.join(logDirectory, 'chronological_events.json'); // <--- C'est ICI qu'il doit être défini

// NOUVEL AJOUT : Chemin pour l'historique du chatroom central
const CENTRAL_CHATROOM_HISTORY_FILE = path.join(logDirectory, 'central_chatroom_history.json');

// --- Configuration pour la galerie dynamique ---
const galleryMediaDirectory = path.join(__dirname, 'data', 'media'); // Répertoire où sont stockées les images/vidéos de la galerie

let galleryItemsCache = []; // Cache en mémoire des éléments de la galerie pour éviter de lire le disque à chaque requête

// Configure Express pour servir les fichiers média de la galerie statiquement
// Les fichiers dans 'data/media' seront accessibles via '/media/nom_du_fichier.jpg'
app.use('/media', express.static(galleryMediaDirectory));

/**
 * Fonction utilitaire pour déterminer le type de média basé sur l'extension du fichier.
 * @param {string} filename - Nom du fichier.
 * @returns {string} 'image', 'video' ou 'unknown'.
 */
function getMediaType(filename) {
    const ext = path.extname(filename).toLowerCase();
    if (['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff', '.svg'].includes(ext)) {
        return 'image';
    }
    if (['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv'].includes(ext)) {
        return 'video';
    }
    return 'unknown';
}

/**
 * Met à jour le cache en mémoire des éléments de la galerie en lisant le répertoire des médias.
 * Crée le répertoire si nécessaire et filtre les fichiers non supportés.
 */
async function updateGalleryCache() {
    try {
        // Crée le répertoire s'il n'existe pas déjà (recursive: true pour créer les dossiers parents)
        await fs.mkdir(galleryMediaDirectory, { recursive: true });
        
        // Lit le contenu du répertoire de manière asynchrone
        const files = await fs.readdir(galleryMediaDirectory);
        
        // Filtre les fichiers non supportés et mappe les informations nécessaires
        galleryItemsCache = files
            .filter(file => getMediaType(file) !== 'unknown') // Garde seulement les images/vidéos supportées
            .map(file => ({
                id: uuidv4(), // Génère un ID unique pour chaque élément de galerie
                src: `/media/${file}`, // URL accessible publiquement par le client
                type: getMediaType(file),
                caption: `Observation: ${file}` // Légende par défaut (pourrait être enrichie par l'IA ou l'utilisateur)
            }));
        console.log(`Cache de la galerie mis à jour. ${galleryItemsCache.length} éléments trouvés.`);
    } catch (error) {
        console.error("Erreur lors de la mise à jour du cache de la galerie:", error);
        // En cas d'erreur (ex: répertoire non accessible), le cache est vidé pour éviter de servir des données erronées.
        galleryItemsCache = [];
    }
}

// Met à jour le cache de la galerie au démarrage du serveur
updateGalleryCache();

// Surveille les changements dans le répertoire de la galerie pour maintenir le cache à jour en temps réel.
fsSync.watch(galleryMediaDirectory, async (eventType, filename) => {
    if (filename) {
        console.log(`Changement détecté dans le répertoire média: ${eventType} - ${filename}. Mise à jour du cache.`);
        await updateGalleryCache();
    }
});


/**
 * Assure que les répertoires de logs et de données existent et initialise les fichiers JSON si manquants.
 * Cette fonction est appelée au démarrage du serveur et par les fonctions de lecture/écriture.
 */
function ensureDirectoriesExist() {
    if (!fsSync.existsSync(logDirectory)) {
        fsSync.mkdirSync(logDirectory, { recursive: true });
        console.log(`Répertoire de logs créé : ${logDirectory}`);
    }
    // Liste de tous les fichiers JSON de données qui doivent exister et être des tableaux vides par défaut
    const jsonFiles = [
        jsonLogFile,
        petitionFilePath,
        investigatorReportsPath,
        scientistAnalysesPath,
        whistleblowerChroniclesPath,
        journalistArticlesPath,
        chronologicalEventsPath, // Le nouveau fichier des événements chronologiques
        CENTRAL_CHATROOM_HISTORY_FILE // Le fichier d'historique du chatroom central
    ];

    jsonFiles.forEach(filePath => {
        if (!fsSync.existsSync(filePath)) {
            fsSync.writeFileSync(filePath, '[]', 'utf8');
            console.log(`Fichier JSON créé : ${filePath}`);
        }
    });
    // Pour le fichier Markdown, assurez-vous qu'il existe ou est créé vide
    if (!fsSync.existsSync(markdownLogFile)) {
        fsSync.writeFileSync(markdownLogFile, '## Historique des interactions AI\n\n', 'utf8');
        console.log(`Fichier Markdown créé : ${markdownLogFile}`);
    }
}

/**
 * Lit un fichier JSON de données de manière asynchrone.
 * Gère les cas où le fichier n'existe pas, est vide ou est mal formé.
 * @param {string} filePath - Chemin vers le fichier JSON.
 * @returns {Promise<Array>} Tableau des données lues, ou un tableau vide en cas d'erreur/absence.
 */
async function readJsonFile(filePath) {
    try {
        ensureDirectoriesExist(); // S'assurer que le répertoire et le fichier existent au premier appel
        const data = await fs.readFile(filePath, 'utf8');
        // Tente de parser, si échec, considère le fichier comme vide ou corrompu
        const parsedData = JSON.parse(data);
        // S'assurer que le résultat est bien un tableau pour les collections d'enregistrements
        if (!Array.isArray(parsedData)) {
            throw new SyntaxError("Le contenu du fichier n'est pas un tableau JSON valide.");
        }
        return parsedData;
    } catch (error) {
        if (error.code === 'ENOENT' || error instanceof SyntaxError) {
            // Si le fichier n'existe pas ou est mal formé, retourne un tableau vide pour la cohérence
            console.warn(`Le fichier ${filePath} n'existe pas, est vide ou mal formé. Initialisation avec un tableau vide.`);
            await writeJsonFile(filePath, []); // Écrit un tableau vide pour corriger/initialiser
            return []; 
        }
        throw error; // Rejette d'autres erreurs inattendues
    }
}

/**
 * Écrit des données dans un fichier JSON de manière asynchrone.
 * @param {string} filePath - Chemin vers le fichier JSON.
 * @param {Array} data - Tableau des données à écrire.
 */
async function writeJsonFile(filePath, data) {
    ensureDirectoriesExist(); // S'assurer que le répertoire existe avant d'écrire
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
}


/**
 * Enregistre une interaction AI dans les fichiers de logs (JSON et Markdown).
 * @param {string} persona - Le rôle de l'IA (scientifique, lanceur-alerte, journaliste, enquêteur, central_chatroom).
 * @param {string} userMessage - Le message de l'utilisateur.
 * @param {string} aiResponse - La réponse de l'IA.
 * @returns {string} L'ID unique de l'interaction logguée.
 */
async function logInteraction(persona, userMessage, aiResponse) {
    const timestamp = new Date().toISOString();
    const id = uuidv4(); // Génère un ID unique pour cette interaction

    // Enregistrement dans logs.json (format structuré)
    let logs = await readJsonFile(jsonLogFile); // Utilise la fonction utilitaire
    const newLogEntry = {
        id: id,
        timestamp: timestamp,
        persona: persona,
        userMessage: userMessage,
        aiResponse: aiResponse
    };
    logs.push(newLogEntry);
    await writeJsonFile(jsonLogFile, logs); // Utilise la fonction utilitaire
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
    // Utilisation de fs.appendFile (asynchrone) pour le fichier Markdown
    await fs.appendFile(markdownLogFile, markdownContent, 'utf8');
    console.log(`Interaction logguée dans ${markdownLogFile}`);

    return id; // Retourne l'ID pour référence si besoin
}


/**
 * Fonction pour obtenir le message système basé sur la persona.
 * Ce message fournit le contexte et les instructions spécifiques à chaque rôle de l'IA.
 * @param {string} persona - Le rôle choisi ('scientifique', 'lanceur-alerte', 'journaliste', 'enquêteur').
 * @returns {string} Le message système correspondant.
 */
function getSystemMessage(persona) {
    // Contexte général partagé par toutes les personas
    const generalContext = `Vous êtes un assistant IA participant à une plateforme dédiée au Suivi Bioclimatique et aux Témoignages de la "Catastrophe Annoncée". Vous êtes informé des éléments suivants :
    - La "Loi Duplomb", adoptée le 8 juillet 2025, réintroduit l'acétamipride, relève les seuils d'autorisation environnementale pour les élevages, facilite les bassines agricoles et réforme la gouvernance de l'eau. Elle est critiquée pour son recul environnemental et sanitaire.
    - Le groupement politique "EMP" (Ensemble Majorité Présidentielle) est perçu comme manipulant le langage et les processus démocratiques, notamment en utilisant l'article 49 alinéa 3 de la Constitution pour faire passer des lois en force, sans vote réel, ce qui est considéré comme une forme de désinformation.
    - Les Accords de Paris, bien qu'initialement visant à limiter le réchauffement climatique, sont perçus par certains comme favorisant indirectement des solutions de géo-ingénierie (comme l'injection d'aérosols stratosphériques) au détriment de réductions d'émissions réelles, ce qui peut entraîner des risques de famine, sanitaires (prolifération d'insectes et bactéries), et des dérèglements climatiques accrus.
    - La géo-ingénierie, en particulier l'injection d'iodure d'argent, est observée et suspectée d'altérer les conditions météorologiques naturelles (ex: "plafond gris", suppression des nuages naturels), avec des conséquences imprévues et potentiellement dangereuses pour la biodiversité et la santé publique.
    - Des événements climatiques extrêmes (pluies intenses, fortes chaleures, ouragans, grêlons géants, inondations) sont observés, exacerbant la crise bioclimatique.
    `;

    switch (persona) {
        case 'scientifique':
            return `${generalContext}
            Votre rôle est d'analyser les données et de présenter des faits scientifiques sur le dérèglement bioclimatique, la géo-ingénierie, les impacts de la Loi Duplomb et des Accords de Paris, en vous basant sur des preuves et des analyses rigoureuses. Évitez le sensationnalisme et concentrez-vous sur l'objectivité scientifique. Expliquez les mécanismes et les conséquences potentielles de manière claire et factuelle.`;
        case 'lanceur-alerte':
            return `${generalContext}
            Votre rôle est d'être un lanceur d'alerte courageux et passionné par la vérité sur la catastrophe bioclimatique. Dénoncez les faits, les morts et les victimes, en mettant en lumière la manipulation politique (EMP, 49.3), les dangers de la Loi Duplomb (acétamipride, bassines), les risques de la géo-ingénierie et l'échec perçu des Accords de Paris à protéger réellement l'environnement et la population. Votre langage est direct, émotionnel et vise à alerter le public sur les dangers imminents et le manque de transparence.`;
        case 'journaliste':
            return `${generalContext}
            Votre rôle est d'être un journaliste d'investigation indépendant. Vous cherchez à rapporter les faits de manière équilibrée mais critique, en questionnant les narratives officielles et en cherchant la vérité derrière les événements. Enquêtez sur la Loi Duplomb, le rôle du groupement EMP et l'utilisation de l'article 49.3, les implications des Accords de Paris et de la géo-ingénierie, et leurs conséquences réelles sur la population et l'environnement. Formulez vos réponses comme un article de presse ou une enquête, en citant des sources et en soulignant les zones d'ombre.`;
        case 'enquêteur':
            return `${generalContext}
            Votre rôle est d'agir comme un enquêteur de terrain. Vous êtes chargé de collecter des informations, des témoignages, des photos, des vidéos, et des données scientifiques sur les événements bioclimatiques et les affaires liées à la Loi Duplomb, à la géo-ingénierie, et aux actions du groupement EMP. Votre objectif est de fournir des détails concrets, des observations précises et des ensembles de définitions claires pour documenter la réalité sur le terrain. Vous devez être précis, factuel et orienté vers la collecte de preuves.`;
        default:
            return `Vous êtes un assistant IA généraliste.`;
    }
}


/**
 * Fonction générique pour appeler l'API LLM (Groq/Gemma) avec des messages structurés (rôles).
 * Cette fonction est optimisée pour la structure d'API compatible OpenAI utilisée par Groq.
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

/**
 * Fonction pour appeler l'IA Gemini (pour l'assistance centrale et la description d'images).
 * @param {string} prompt - Le message de l'utilisateur.
 * @param {Array<Object>} history - L'historique de la conversation.
 * @param {string|null} imageBase64 - Image encodée en Base64 pour l'analyse visuelle.
 * @returns {Promise<Object>} Un objet contenant la réponse de l'IA.
 */
async function callGeminiAI(prompt, history = [], imageBase64 = null) {
    const model = googleGenAI.getGenerativeModel({ model: "gemini-pro" }); // Modèle par défaut pour le texte

    const chat = model.startChat({
        history: history.map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'model',
            parts: [{ text: msg.message }]
        })),
        generationConfig: {
            maxOutputTokens: 1000,
        },
    });

    try {
        let result;
        if (imageBase64) {
            // Pour les requêtes avec image, utilisez le modèle approprié si nécessaire
            // Note: Le modèle 'gemini-pro' ne supporte pas directement les images.
            // Pour les images, il faudrait utiliser 'gemini-pro-vision' ou 'gemini-1.5-flash'.
            // Cependant, la route /api/describe-image gère déjà cela spécifiquement.
            console.warn("callGeminiAI a reçu une imageBase64 mais utilise un modèle texte. La route /api/describe-image est recommandée pour les images.");
            result = await chat.sendMessage(prompt); // Traite comme du texte si le modèle ne supporte pas l'image
        } else {
            // Pour les requêtes textuelles
            result = await chat.sendMessage(prompt);
        }
        const response = await result.response;
        return { reply: response.text() };
    } catch (error) {
        console.error("Erreur lors de l'appel à Gemini AI:", error);
        return { reply: "Désolé, une erreur est survenue lors de la communication avec l'IA Gemini." };
    }
}

/**
 * Fonction pour appeler l'IA centrale (utilisée par le chatroom central).
 * Elle agrège les informations des différentes personas.
 * @param {string} prompt - Le message de l'utilisateur.
 * @param {Array<Object>} history - L'historique de la conversation.
 * @returns {Promise<Object>} Un objet contenant la réponse de l'IA centrale.
 */
async function callCentralAI(prompt, history) {
    try {
        // Définition du rôle système pour l'IA centrale, incluant la description des personas
        const centralSystemMessage = `Vous êtes l'Assistant IA Central de la plateforme "Rapport d'Urgence : Géo-ingénierie et Crise Bioclimatique". Votre rôle est de faciliter les discussions, synthétiser les informations et fournir des analyses objectives sur les sujets liés à la catastrophe bioclimatique, la géo-ingénierie (en particulier l'injection d'aérosols stratosphériques comme l'iodure d'argent, le soufre, la calcite), la Loi Duplomb, les Accords de Paris, et les manipulations politiques (EMP, 49.3).

        Vous interagissez avec l'utilisateur et potentiellement avec des contributions des assistants spécialisés suivants :
        - **Scientifique :** Fournit des analyses basées sur des faits, des preuves et des mécanismes rigoureux. Objectif, évite le sensationnalisme.
        - **Lanceur d'alerte :** Dénonce les faits, les victimes, et les manipulations politiques avec un ton direct et émotionnel, visant à alerter le public.
        - **Journaliste :** Rapporte les faits de manière équilibrée mais critique, enquête sur les narratives officielles, et cherche la vérité, en soulignant les zones d'ombre.
        - **Enquêteur :** Collecte des informations concrètes, des témoignages, des observations précises et des définitions claires sur le terrain.

        Lorsque vous recevez des messages de ces assistants (préfixés par leur rôle), intégrez leurs perspectives pour former une réponse cohérente et complète. Votre objectif est de maintenir une discussion générale et centrale sur le sujet, en tirant parti des expertises de chacun pour améliorer la cohérence du contexte global de l'application sur les défaillances de la géo-ingénierie et les risques associés aux injections d'aérosols stratosphériques.

        Répondez de manière factuelle, synthétique et neutre, en agrégeant les informations pertinentes de l'historique.`;

        let messages = [{
            role: "system",
            content: centralSystemMessage
        }];

        // Ajouter l'historique de la conversation au contexte
        if (history && Array.isArray(history)) {
            history.forEach(msg => {
                // Adapter les messages pour le format Groq (role et content)
                let messageContent = msg.content;
                // Si c'est un message d'IA et qu'il provient d'une persona spécifique (non 'global'),
                // préfixer le contenu pour que l'IA centrale comprenne la source.
                if (msg.role === 'ai' && msg.sourcePersona && msg.sourcePersona !== 'global') {
                    // Utilise le nom de la persona capitalisé pour le préfixe
                    const personaName = msg.sourcePersona.charAt(0).toUpperCase() + msg.sourcePersona.slice(1);
                    messageContent = `(${personaName}) : ${msg.content}`;
                }
                messages.push({
                    role: msg.role === 'user' ? 'user' : 'assistant', // L'IA centrale interprète les messages de persona comme 'assistant'
                    content: messageContent
                });
            });
        }

        // Ajouter le prompt actuel de l'utilisateur
        messages.push({ role: "user", content: prompt });

        const chatCompletion = await groq.chat.completions.create({
            messages: messages,
            model: "gemma2-9b-it", // Utilise le modèle Groq spécifié
            temperature: 0.7,
            max_tokens: 500,
            stream: false,
        });
        
        return { reply: chatCompletion.choices[0].message.content };

    } catch (error) {
        console.error("Erreur lors de l'appel à l'API Groq pour le chatroom central:", error);
        return { reply: `Désolé, l'IA centrale n'a pas pu générer de réponse. Erreur: ${error.message}` };
    }
}


// --- Routes pour le Chatbot Interactif (personnalisé par persona) ---

/**
 * Endpoint POST pour gérer les conversations du chatbot avec logging.
 * Reçoit la persona active, le message de l'utilisateur, l'historique de conversation.
 * Log l'interaction et renvoie la réponse de l'IA.
 */
app.post('/chatbot', async (req, res) => {
    const { message, persona, history } = req.body;
    if (!message || !persona) {
        return res.status(400).json({ error: "Message utilisateur ou persona manquant." });
    }

    const systemMessage = getSystemMessage(persona);
    let messagesForGroq = [{ role: "system", content: systemMessage }];

    if (history && Array.isArray(history)) {
        history.forEach(msg => {
            if (msg.role === 'user' || msg.role === 'assistant') {
                messagesForGroq.push(msg);
            }
        });
    }
    // Ajouter le message actuel de l'utilisateur
    messagesForGroq.push({ role: "user", content: message });

    try {
        const aiResponse = await generateContentWithLLM(messagesForGroq);
        // Log l'interaction ici
        await logInteraction(persona, message, aiResponse);
        res.json({ reply: aiResponse }); // 'reply' comme attendu par le frontend
    } catch (error) {
        console.error("Erreur lors de la gestion du chat:", error);
        res.status(500).json({ error: "Erreur interne du serveur lors de la génération de la réponse." });
    }
});


// --- Routes pour la gestion des logs (pour le dashboard journaliste) ---

/**
 * GET /logs
 * Lit et renvoie le contenu de logs.json.
 */
app.get('/logs', async (req, res) => {
    try {
        const logs = await readJsonFile(jsonLogFile);
        res.status(200).json(logs);
    } catch (error) {
        console.error('Erreur lors de la récupération des logs:', error);
        res.status(500).json({ message: 'Erreur interne du serveur lors de la récupération des logs.' });
    }
});

/**
 * GET /historique
 * Lit et renvoie le contenu de historique.md.
 */
app.get('/historique', async (req, res) => {
    try {
        const historique = await fs.readFile(markdownLogFile, 'utf8');
        res.type('text/markdown').send(historique);
    } catch (error) {
        if (error.code === 'ENOENT') {
            res.status(200).send("## Historique des interactions\n\nAucune interaction enregistrée pour le moment.");
        } else {
            console.error(`Erreur lors de la lecture de ${markdownLogFile}:`, error);
            res.status(500).send("Erreur lors de la lecture de l'historique Markdown.");
        }
    }
});

/**
 * PUT /logs/:id
 * Met à jour une interaction spécifique dans logs.json.
 * @param {string} req.params.id - L'ID de l'entrée de log à mettre à jour.
 * @param {object} req.body - Les données à mettre à jour (ex: { userMessage: "...", aiResponse: "..." }).
 */
app.put('/logs/:id', async (req, res) => {
    try {
        let logs = await readJsonFile(jsonLogFile);
        const { id } = req.params;
        const updatedData = req.body;

        const logIndex = logs.findIndex(log => log.id === id);

        if (logIndex === -1) {
            return res.status(404).json({ error: "Interaction non trouvée." });
        }

        // Mettre à jour les champs spécifiés sans modifier l'ID ou le timestamp d'origine
        logs[logIndex] = { ...logs[logIndex], ...updatedData };
        await writeJsonFile(jsonLogFile, logs);
        res.json({ message: `Interaction ${id} mise à jour avec succès.`, updatedLog: logs[logIndex] });

    } catch (error) {
        console.error(`Erreur lors de la mise à jour de l'interaction ${req.params.id}:`, error);
        res.status(500).json({ error: "Erreur lors de la mise à jour de l'interaction." });
    }
});

/**
 * DELETE /logs/:id
 * Supprime une interaction spécifique de logs.json.
 * @param {string} req.params.id - L'ID de l'entrée de log à supprimer.
 */
app.delete('/logs/:id', async (req, res) => {
    try {
        let logs = await readJsonFile(jsonLogFile);
        const { id } = req.params;

        const initialLength = logs.length;
        logs = logs.filter(log => log.id !== id);

        if (logs.length === initialLength) {
            return res.status(404).json({ error: "Interaction non trouvée." });
        }

        await writeJsonFile(jsonLogFile, logs);
        res.json({ message: `Interaction ${id} supprimée avec succès.` });

    } catch (error) {
        console.error(`Erreur lors de la suppression de l'interaction ${req.params.id}:`, error);
        res.status(500).json({ error: "Erreur lors de la suppression de l'interaction." });
    }
});


// --- Routes pour la gestion de la galerie d'images ---

/**
 * GET /api/images
 * Renvoie la liste des URLs des images de la galerie.
 */
app.get('/api/images', (req, res) => {
    // Retourne les URLs des images, qui sont accessibles via la route statique '/media'
    const imageUrls = galleryItemsCache.filter(item => item.type === 'image').map(item => item.src);
    res.json(imageUrls);
});

/**
 * GET /api/gallery/items
 * Renvoie tous les éléments de la galerie (images et vidéos) avec leurs métadonnées.
 */
app.get('/api/gallery/items', (req, res) => {
    res.json(galleryItemsCache);
});

/**
 * POST /api/describe-image
 * Route pour décrire une image via Google Gemini.
 * Lit l'image localement, l'encode en Base64 et l'envoie à l'IA pour analyse.
 * Cette version a été rétablie à la version fournie par l'utilisateur.
 */
app.post('/api/describe-image', async (req, res) => {
    const { imageUrl } = req.body; // L'URL de l'image est envoyée depuis le frontend (ex: /media/image.jpg)

    if (!imageUrl) {
        console.error("URL d'image vide pour l'analyse Gemini GenAI.");
        return res.status(400).json({ error: "L'URL de l'image est requise pour l'analyse." });
    }

    // Vérification de sécurité : s'assurer que l'URL est bien locale et provient de notre serveur
    if (!imageUrl.startsWith('/media/')) {
        console.warn('Tentative de décrire une image avec une URL non locale ou non autorisée:', imageUrl);
        return res.status(403).json({ error: 'Seules les images locales du répertoire /data/media peuvent être décrites.' });
    }

    // Convertir l'URL relative en chemin de fichier local absolu
    const localImagePath = path.join(__dirname, 'data', 'media', path.basename(imageUrl));

    try {
        // Lire le fichier image de manière asynchrone en tant que Buffer
        const imageBuffer = await fs.readFile(localImagePath);
        // Encoder le Buffer en chaîne Base64
        const base64Image = imageBuffer.toString('base64');
        
        // Déterminer le type MIME de l'image pour la Data URI
        const ext = path.extname(localImagePath).toLowerCase();
        let mimeType = 'image/jpeg'; // Valeur par défaut
        if (ext === '.png') mimeType = 'image/png';
        else if (ext === '.gif') mimeType = 'image/gif';
        else if (ext === '.webp') mimeType = 'image/webp';

        // Obtenir le modèle Gemini 1.5 Flash (comme spécifié par l'utilisateur)
        const model = googleGenAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = "Décris cette image en français, en te concentrant sur les éléments visuels importants liés au modification climatique, à la géo-ingénierie : l'injection d'aérosol stratosphérique (îodur d'argent, souffre calcite sont des composé chimiques) lié à une activité aérienne suspecte, ou une constatation d'une modification climatique si applicable. Sois concis et factuel.";

        // Préparer le contenu multi-modal pour Gemini
        const contents = [
            {
                parts: [
                    { text: prompt }, // Le prompt textuel
                    {
                        inlineData: {
                            mimeType: mimeType,
                            data: base64Image
                        }
                    }
                ]
            }
        ];

        // Générer le contenu
        const result = await model.generateContent({ contents });
        const response = await result.response;
        const analysisResult = response.text();

        console.log(`Description générée pour ${imageUrl} par Gemini: ${analysisResult}`);
        res.json({ description: analysisResult });

    } catch (error) {
        console.error('Erreur lors de l\'analyse d\'image avec Google GenAI:', error);
        
        let userErrorMessage = 'Erreur lors de l\'analyse de l\'image par l\'IA.';
        if (error.code === 'ENOENT') {
            userErrorMessage = `Image non trouvée sur le serveur: ${localImagePath}. Vérifiez le chemin.`;
        } else if (error.message.includes('API key') || error.message.includes('permission')) {
            userErrorMessage += ' Problème avec la clé API Google GenAI ou les permissions.';
        } else if (error.message.includes('Impossible de traiter l\'URL de l\'image') || error.message.includes('Impossible de récupérer l\'image')) {
            userErrorMessage += ' Impossible de récupérer l\'image depuis l\'URL fournie ou format non supporté.';
        } else if (error.message.includes('model')) {
            userErrorMessage += ' Le modèle Gemini spécifié pour la vision pourrait être incorrect ou indisponible.';
        } else if (error.message.includes('size') || error.message.includes('dimension') || error.message.includes('exceeded')) {
            userErrorMessage += ' L\'image est peut-être trop grande, a des dimensions excessives ou le format n\'est pas supporté par l\'IA.';
        } else {
            userErrorMessage += ` Détails: ${error.message}`;
        }

        res.status(500).json({ error: userErrorMessage, details: error.message });
    }
});

// Route POST pour enregistrer un nouveau vote de pétition
app.post('/api/petition/vote', async (req, res) => {
  const { userName, userEmail, userComment, supportArticle38, timestamp } = req.body; // Ajout de userEmail

  if (!userName || !userEmail || !timestamp) { // userComment et supportArticle38 sont optionnels
    return res.status(400).json({ message: 'Données manquantes pour l\'enregistrement du vote (nom, email, timestamp).' });
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
      if (readError.code === 'ENOENT' || readError instanceof SyntaxError) {
        console.log('Le fichier petition_votes.json n\'existe pas, est vide ou corrompu, en créant/initialisant un nouveau.');
        currentVotes = [];
      } else {
        throw readError; // Rejeter d'autres erreurs de lecture inattendues
      }
    }

    // Ajouter le nouveau vote
    currentVotes.push({ userName, userEmail, userComment, supportArticle38, timestamp }); // Ajout de userEmail

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
      console.error('Erreur de parsing JSON pour petition_votes.json:', error);
      res.status(500).json({ message: 'Le fichier de données est vide ou corrompu. Veuillez contacter l\'administrateur.' });
    }
    // Pour toute autre erreur inattendue lors de la lecture du fichier
    else {
      console.error('Erreur lors de la lecture des résultats de la pétition:', error);
      res.status(500).json({ message: 'Erreur interne du serveur lors de la récupération des résultats.' });
    }
  }
});


// --- API Endpoints spécifiques à chaque rôle ---

// Journaliste: Soumettre, récupérer, modifier et supprimer des articles
app.post('/api/journalist/articles', async (req, res) => {
    const { title, content, author } = req.body;
    if (!title || !content || !author) {
        return res.status(400).json({ message: 'Titre, contenu ou auteur manquant pour l\'article.' });
    }
    try {
        let articles = await readJsonFile(journalistArticlesPath);
        const newArticle = { id: uuidv4(), title, content, author, timestamp: new Date().toISOString() };
        articles.push(newArticle);
        await writeJsonFile(journalistArticlesPath, articles);
        res.status(201).json({ message: 'Article soumis avec succès.', article: newArticle });
    } catch (error) {
        console.error('Erreur lors de la soumission de l\'article du journaliste:', error);
        res.status(500).json({ message: 'Erreur interne du serveur lors de la soumission de l\'article.' });
    }
});

app.get('/api/journalist/articles', async (req, res) => {
    try {
        const articles = await readJsonFile(journalistArticlesPath);
        res.status(200).json(articles);
    } catch (error) {
        console.error('Erreur lors de la récupération des articles du journaliste:', error);
        res.status(500).json({ message: 'Erreur interne du serveur lors de la récupération des articles.' });
    }
});

// Mettre à jour un article existant
app.put('/api/journalist/articles/:id', async (req, res) => {
    const { id } = req.params;
    const { title, content, author } = req.body;

    if (!title || !content || !author) {
        return res.status(400).json({ message: 'Titre, contenu ou auteur manquant pour la mise à jour de l\'article.' });
    }

    try {
        let articles = await readJsonFile(journalistArticlesPath);
        const articleIndex = articles.findIndex(article => article.id === id);

        if (articleIndex === -1) {
            return res.status(404).json({ message: 'Article non trouvé.' });
        }

        articles[articleIndex] = {
            ...articles[articleIndex], // Conserver les anciennes propriétés
            title,
            content,
            author,
            updatedAt: new Date().toISOString() // Ajouter un horodatage de mise à jour
        };

        await writeJsonFile(journalistArticlesPath, articles);
        res.status(200).json({ message: 'Article mis à jour avec succès.', article: articles[articleIndex] });
    } catch (error) {
        console.error(`Erreur lors de la mise à jour de l'article ${id}:`, error);
        res.status(500).json({ message: 'Erreur interne du serveur lors de la mise à jour de l\'article.' });
    }
});

// Supprimer un article existant
app.delete('/api/journalist/articles/:id', async (req, res) => {
    const { id } = req.params;

    try {
        let articles = await readJsonFile(journalistArticlesPath);
        const initialLength = articles.length;
        articles = articles.filter(article => article.id !== id);

        if (articles.length === initialLength) {
            return res.status(404).json({ message: 'Article non trouvé.' });
        }

        await writeJsonFile(journalistArticlesPath, articles);
        res.status(200).json({ message: 'Article supprimé avec succès.' });
    } catch (error) {
        console.error(`Erreur lors de la suppression de l'article ${id}:`, error);
        res.status(500).json({ message: 'Erreur interne du serveur lors de la suppression de l\'article.' });
    }
});

// Assister le journaliste avec l'IA pour générer du contenu
app.post('/api/journalist/assist-ai', async (req, res) => {
    const { prompt } = req.body;
    if (!prompt) {
        return res.status(400).json({ message: 'Un prompt est nécessaire pour l\'assistance IA.' });
    }

    try {
        const systemMessage = getSystemMessage('journaliste'); // Utilise la persona 'journaliste'
        const messages = [
            { role: "system", content: systemMessage },
            { role: "user", content: `En tant que journaliste d'investigation, aide-moi à rédiger un élément d'article ou une série de titres percutants basés sur l'information suivante. Concentre-toi sur les impacts de la géo-ingénierie ou de la Loi Duplomb, avec un ton factuel et critique. Voici l'information/le contexte: ${prompt}` }
        ];
        const aiResponse = await generateContentWithLLM(messages);
        await logInteraction('journaliste_assistant', prompt, aiResponse); // Log l'interaction

        res.status(200).json({ assistance: aiResponse });
    } catch (error) {
        console.error('Erreur lors de l\'assistance IA pour le journaliste:', error);
        res.status(500).json({ message: 'Erreur interne du serveur lors de l\'assistance IA.' });
    }
});


// Enquêteur: Soumettre des rapports et rechercher des observations
app.post('/api/investigator/reports', async (req, res) => {
    const { title, description, observations, investigatorName } = req.body;
    if (!title || !description || !investigatorName) {
        return res.status(400).json({ message: 'Titre, description ou nom de l\'enquêteur manquant pour le rapport.' });
    }
    try {
        let reports = await readJsonFile(investigatorReportsPath);
        const newReport = { id: uuidv4(), title, description, observations, investigatorName, timestamp: new Date().toISOString() };
        reports.push(newReport);
        await writeJsonFile(investigatorReportsPath, reports);
        res.status(201).json({ message: 'Rapport d\'enquête soumis avec succès.', report: newReport });
    } catch (error) {
        console.error('Erreur lors de la soumission du rapport de l\'enquêteur:', error);
        res.status(500).json({ message: 'Erreur interne du serveur lors de la soumission du rapport.' });
    }
});

app.get('/api/investigator/observations', async (req, res) => {
    // Cette route pourrait à terme récupérer des observations plus complexes,
    // potentiellement filtrées par des critères de recherche.
    const query = req.query.q || ''; // Terme de recherche optionnel
    try {
        // Pour l'instant, on peut simuler des observations ou les récupérer d'un fichier statique
        // ou même du fichier chronological_events.json si les données sont pertinentes.
        // Ici, nous allons utiliser des données simulées pour la démonstration.
        const simulatedObservations = [
            { id: 'obs1', type: 'aérien', date: '2025-07-18', location: 'Normandie', description: 'Pulvérisations intenses, ciel blanc', chemical: 'Iodure d\'argent' },
            { id: 'obs2', type: 'météo', date: '2025-07-18', location: 'Normandie', description: 'Foudre linéaire anormale', chemical: null },
            { id: 'obs3', type: 'météo', date: '2025-07-17', location: 'Chine', description: 'Tornades et inondations', chemical: null },
            { id: 'obs4', type: 'chimique', date: '2025-07-08', location: 'National', description: 'Loi Duplomb introduisant acétamipride', chemical: 'Acétamipride' },
            { id: 'obs5', type: 'aérien', date: '2025-07-04', location: 'Île-de-France', description: 'Traînées persistantes et arcs-en-ciel de pollution', chemical: 'Inconnu' },
        ];
        const filteredObservations = simulatedObservations.filter(obs =>
            JSON.stringify(obs).toLowerCase().includes(query.toLowerCase())
        );
        res.status(200).json(filteredObservations);
    } catch (error) {
        console.error('Erreur lors de la récupération des observations de l\'enquêteur:', error);
        res.status(500).json({ message: 'Erreur interne du serveur lors de la récupération des observations.' });
    }
});

// Scientifique: Soumettre des analyses et récupérer des données techniques
app.post('/api/scientist/analyses', async (req, res) => {
    const { substance, concentration, result, unit, scientistName } = req.body;
    if (!substance || !result || !scientistName) {
        return res.status(400).json({ message: 'Substance, résultat ou nom du scientifique manquant pour l\'analyse.' });
    }
    try {
        let analyses = await readJsonFile(scientistAnalysesPath);
        const newAnalysis = { id: uuidv4(), substance, concentration, result, unit, scientistName, timestamp: new Date().toISOString() };
        analyses.push(newAnalysis);
        await writeJsonFile(scientistAnalysesPath, analyses);
        res.status(201).json({ message: 'Analyse scientifique soumise avec succès.', analysis: newAnalysis });
    } catch (error) {
        console.error('Erreur lors de la soumission de l\'analyse scientifique:', error);
        res.status(500).json({ message: 'Erreur interne du serveur lors de la soumission de l\'analyse.' });
    }
});

app.get('/api/scientist/data', async (req, res) => {
    try {
        const analyses = await readJsonFile(scientistAnalysesPath);
        res.status(200).json(analyses);
    } catch (error) {
        console.error('Erreur lors de la récupération des données scientifiques:', error);
        res.status(500).json({ message: 'Erreur interne du serveur lors de la récupération des données scientifiques.' });
    }
});

// Lanceur d'alerte: Soumettre et récupérer des chroniques politiques
app.post('/api/whistleblower/chronicles', async (req, res) => {
    const { title, content, author, status } = req.body; // status pour simuler modération
    if (!title || !content || !author) {
        return res.status(400).json({ message: 'Titre, contenu ou auteur manquant pour la chronique.' });
    }
    try {
        let chronicles = await readJsonFile(whistleblowerChroniclesPath);
        const newChronicle = { id: uuidv4(), title, content, author, status: status || 'pending', timestamp: new Date().toISOString() };
        chronicles.push(newChronicle);
        await writeJsonFile(whistleblowerChroniclesPath, chronicles);
        res.status(201).json({ message: 'Chronique politique soumise avec succès.', chronicle: newChronicle });
    } catch (error) {
        console.error('Erreur lors de la soumission de la chronique du lanceur d\'alerte:', error);
        res.status(500).json({ message: 'Erreur interne du serveur lors de la soumission de la chronique.' });
    }
});

app.get('/api/whistleblower/chronicles', async (req, res) => {
    const statusFilter = req.query.status || 'published'; // Filtrer par statut (ex: 'published', 'pending')
    try {
        const chronicles = await readJsonFile(whistleblowerChroniclesPath);
        const filteredChronicles = chronicles.filter(c => c.status === statusFilter);
        res.status(200).json(filteredChronicles);
    } catch (error) {
        console.error('Erreur lors de la récupération des chroniques du lanceur d\'alerte:', error);
        res.status(500).json({ message: 'Erreur interne du serveur lors de la récupération des chroniques.' });
    }
});


// --- Routes pour le Chatroom Central ---

// Route pour le Chatroom Central : Récupérer l'historique de conversation
app.get('/api/central-chatroom/history', async (req, res) => {
    try {
        const history = await readJsonFile(CENTRAL_CHATROOM_HISTORY_FILE);
        res.json(history);
    } catch (error) {
        console.error('Erreur lors de la récupération de l\'historique du chatroom central:', error);
        res.status(500).json({ message: 'Erreur lors du chargement de l\'historique du chatroom central.' });
    }
});

// Route pour le Chatroom Central : Sauvegarder l'historique de conversation
app.post('/api/central-chatroom/save-history', async (req, res) => {
    const newHistory = req.body; // C'est tout l'historique à sauvegarder
    if (!Array.isArray(newHistory)) {
        return res.status(400).json({ message: 'Le corps de la requête doit être un tableau représentant l\'historique.' });
    }

    try {
        await writeJsonFile(CENTRAL_CHATROOM_HISTORY_FILE, newHistory);
        res.status(200).json({ message: 'Historique du chatroom central sauvegardé avec succès.' });
    } catch (error) {
        console.error('Erreur lors de la sauvegarde de l\'historique du chatroom central:', error);
        res.status(500).json({ message: 'Erreur lors de la sauvegarde de l\'historique.' });
    }
});

// Route pour le Chatroom Central : Assistance IA
app.post('/api/central-chatroom/assist-ai', async (req, res) => {
    const { prompt, history } = req.body;

    if (!prompt) {
        return res.status(400).json({ message: 'Un prompt est requis pour l\'assistance IA centrale.' });
    }

    try {
        const aiResponse = await callCentralAI(prompt, history); // Appel de l'IA centrale
        await logInteraction('central_chatroom', prompt, aiResponse.reply); // Log l'interaction
        res.json({ reply: aiResponse.reply });
    } catch (error) {
        console.error('Erreur lors de la communication avec l\'IA centrale:', error);
        res.status(500).json({ message: 'Erreur lors du traitement de la requête IA centrale.' });
    }
});

// --- Routes pour la gestion des événements chronologiques (CRUD) ---
// Ces routes permettent à l'enquêteur de gérer les événements affichés sur la carte et la frise.

/**
 * GET /api/events/chronological
 * Récupère tous les événements chronologiques enregistrés.
 */
app.get('/api/events/chronological', async (req, res) => {
    try {
        // Ici, chronologicalEventsPath doit être défini et accessible
        const events = await readJsonFile(chronologicalEventsPath); 
        res.status(200).json(events);
    } catch (error) {
        console.error('Erreur lors de la récupération des événements chronologiques:', error);
        res.status(500).json({ message: 'Erreur interne du serveur lors de la récupération des événements.' });
    }
});

/**
 * POST /api/events/chronological
 * Ajoute un nouvel événement chronologique.
 * Requête attendue: { title, type, location, latitude, longitude, timestamp, description }
 */
app.post('/api/events/chronological', async (req, res) => {
    const { title, type, location, latitude, longitude, timestamp, description } = req.body;
    // Validation des champs requis
    if (!title || !type || !location || latitude === undefined || longitude === undefined || !timestamp || !description) {
        return res.status(400).json({ message: 'Tous les champs (titre, type, localisation, latitude, longitude, timestamp, description) sont requis pour ajouter un événement.' });
    }
    try {
        const events = await readJsonFile(chronologicalEventsPath);
        const newEvent = {
            id: uuidv4(), // Génère un ID unique pour le nouvel événement
            title,
            type,
            location,
            latitude,
            longitude,
            timestamp,
            description
        };
        events.push(newEvent);
        await writeJsonFile(chronologicalEventsPath, events);
        res.status(201).json({ message: 'Événement ajouté avec succès !', event: newEvent });
    } catch (error) {
        console.error('Erreur lors de l\'ajout de l\'événement chronologique:', error);
        res.status(500).json({ message: 'Erreur interne du serveur lors de l\'ajout de l\'événement.' });
    }
});

/**
 * PUT /api/events/chronological/:id
 * Met à jour un événement chronologique existant par son ID.
 * Requête attendue: { title?, type?, location?, latitude?, longitude?, timestamp?, description? }
 */
app.put('/api/events/chronological/:id', async (req, res) => {
    const eventId = req.params.id;
    const updatedFields = req.body; // Les champs à mettre à jour

    // Vérification minimale que des champs sont présents pour la mise à jour
    if (Object.keys(updatedFields).length === 0) {
        return res.status(400).json({ message: 'Aucun champ fourni pour la mise à jour de l\'événement.' });
    }

    try {
        let events = await readJsonFile(chronologicalEventsPath);
        const eventIndex = events.findIndex(evt => evt.id === eventId);

        if (eventIndex === -1) {
            return res.status(404).json({ message: 'Événement non trouvé.' });
        }

        // Mettre à jour les champs de l'événement trouvé
        events[eventIndex] = { ...events[eventIndex], ...updatedFields };

        await writeJsonFile(chronologicalEventsPath, events);
        res.status(200).json({ message: 'Événement mis à jour avec succès !', event: events[eventIndex] });
    } catch (error) {
        console.error('Erreur lors de la mise à jour de l\'événement chronologique:', error);
        res.status(500).json({ message: 'Erreur interne du serveur lors de la mise à jour de l\'événement.' });
    }
});

/**
 * DELETE /api/events/chronological/:id
 * Supprime un événement chronologique par son ID.
 */
app.delete('/api/events/chronological/:id', async (req, res) => {
    const eventId = req.params.id;
    try {
        let events = await readJsonFile(chronologicalEventsPath);
        const initialLength = events.length;
        events = events.filter(evt => evt.id !== eventId);

        if (events.length === initialLength) {
            return res.status(404).json({ message: 'Événement non trouvé.' });
        }

        await writeJsonFile(chronologicalEventsPath, events);
        res.status(200).json({ message: 'Événement supprimé avec succès !' });
    } catch (error) {
        console.error('Erreur lors de la suppression de l\'événement chronologique:', error);
        res.status(500).json({ message: 'Erreur interne du serveur lors de la suppression de l\'événement.' });
    }
});


// Démarre le serveur Express et l'écoute sur le port spécifié.
app.listen(port, () => {
    console.log(`Serveur démarré sur http://localhost:${port}`);
    // Messages de console pour faciliter le développement et l'accès aux différentes pages.
    console.log(`Accédez au site principal : http://localhost:${port}`);
    console.log(`Accédez à l'entrée du chatbot : http://localhost:${port}/pages/chatbot-entry.html`);
    console.log(`Ou à l'interface de test des assistants : http://localhost:${port}/content-generator.html`);
    console.log(`Dashboard Journaliste : http://localhost:${port}/pages/journalist.html`);
    console.log(`Dashboard Enquêteur : http://localhost:${port}/pages/investigator.html`);
    console.log(`Dashboard Scientifique : http://localhost:${port}/pages/scientist.html`);
    console.log(`Dashboard Lanceur d'alerte : http://localhost:${port}/pages/whistleblower.html`);

    // Assurer que les répertoires de logs et de données sont prêts au démarrage
    ensureDirectoriesExist();
});
