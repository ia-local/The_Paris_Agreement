// server.js
require('dotenv').config(); // Charge les variables d'environnement depuis .env
const fs = require('fs/promises'); // Module pour interagir avec le système de fichiers de manière asynchrone (Promises)
const express = require('express');
const path = require('path');
const fsSync = require('fs'); // Gardez fs synchrone si vous avez besoin de fonctions comme existsSync

const Groq = require('groq-sdk'); // SDK Groq pour interagir avec les modèles Groq (ex: gemma2-9b-it)
const { GoogleGenerativeAI } = require('@google/generative-ai');
const googleGenAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const { v4: uuidv4 } = require('uuid'); // Pour générer des ID uniques (npm install uuid)



// Initialise l'instance Groq avec la clé API récupérée de process.env.GROQ_API_KEY
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const app = express();
const port = 5007; // Définit le port sur lequel le serveur écoutera

// Configure Express pour servir les fichiers statiques du répertoire 'docs'
app.use(express.static(path.join(__dirname, 'docs')));
// Définit une route pour la page d'accueil (racine de l'application '/').
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'docs', 'index.html'));
});

// Middleware pour parser le corps des requêtes en JSON
app.use(express.json());

// --- Configuration des fichiers de log et de données ---
const logDirectory = path.join(__dirname, 'log');
const jsonLogFile = path.join(logDirectory, 'logs.json');
const markdownLogFile = path.join(logDirectory, 'historique.md');

const dataDirectory = path.join(__dirname, 'data'); // Nouveau répertoire pour les fichiers de données

const petitionFilePath = path.join(dataDirectory, 'petition38.json');
const journalistArticlesPath = path.join(dataDirectory, 'journalist_articles.json');
const investigatorReportsPath = path.join(dataDirectory, 'investigator_reports.json');
const scientistAnalysesPath = path.join(dataDirectory, 'scientist_analyses.json');
const whistleblowerChroniclesPath = path.join(dataDirectory, 'whistleblower_chronicles.json');

// --- Configuration pour la galerie dynamique ---
const galleryMediaDirectory = path.join(__dirname, 'data', 'media');


let galleryItemsCache = []; // Cache en mémoire des éléments de la galerie

/**
 * Fonction utilitaire pour déterminer le type de média basé sur l'extension.
 * @param {string} filename - Nom du fichier.
 * @returns {string} 'image' ou 'video'.
 */

app.use('/media', express.static(path.join(__dirname, 'data', 'media')));

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
 * Met à jour le cache des éléments de la galerie en lisant le répertoire.
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
                id: uuidv4(), // Génère un ID unique pour chaque élément
                src: `/media/${file}`, // URL accessible publiquement par le client
                type: getMediaType(file),
                caption: `Observation: ${file}` // Légende par défaut (sera remplacée par l'IA)
            }));
        console.log(`Cache de la galerie mis à jour. ${galleryItemsCache.length} éléments trouvés.`);
    } catch (error) {
        console.error("Erreur lors de la mise à jour du cache de la galerie:", error);
        // En cas d'erreur (ex: répertoire non accessible), le cache est vidé pour éviter de servir des données erronées.
        galleryItemsCache = [];
    }
}

// Mettre à jour le cache de la galerie au démarrage du serveur
updateGalleryCache();


// Surveiller les changements dans le répertoire de la galerie
fsSync.watch(galleryMediaDirectory, async (eventType, filename) => {
    if (filename) {
        console.log(`Changement détecté dans le répertoire média: ${eventType} - ${filename}. Mise à jour du cache.`);
        await updateGalleryCache();
    }
});



// Endpoint API pour récupérer la liste des éléments de la galerie
app.get('/api/images', (req, res) => {
    // Retourne les URLs des images, qui sont accessibles via la route statique '/media'
    const imageUrls = galleryItemsCache.filter(item => item.type === 'image').map(item => item.src);
    res.json(imageUrls);
});


// NOUVELLE ROUTE : API pour décrire une image via Google Gemini 1.5 Flash
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
    // Exemple: /media/photo.jpg -> /Volumes/devOps/projets/geoTracker-app/data/media/photo.jpg
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

        // Obtenir le modèle Gemini 1.5 Flash
        const model = googleGenAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = "Décris cette image en français, en te concentrant sur les éléments visuels importants liés au modification climatique, à la géo-ingénierie : l'injection d'aérosol stratosphérique (îodur d'argent, souffre calcite sont des composé chimiques) lié à une activité aérienne suspecte ,  ou à la catastrophe bioclimatique si applicable. Sois concis et factuel.";

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
        console.log('Le fichier petition38.json n\'existe pas, est vide ou corrompu, en créant/initialisant un nouveau.');
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

// Nouvelle route pour récupérer les éléments de la galerie
app.get('/api/gallery/items', (req, res) => {
    res.json(galleryItemsCache);
});


/**
 * Assure que le répertoire de logs et de données existent.
 */
function ensureDirectoriesExist() {
    if (!fsSync.existsSync(logDirectory)) {
        fsSync.mkdirSync(logDirectory, { recursive: true });
        console.log(`Répertoire de logs créé : ${logDirectory}`);
    }
    if (!fsSync.existsSync(dataDirectory)) {
        fsSync.mkdirSync(dataDirectory, { recursive: true });
        console.log(`Répertoire de données créé : ${dataDirectory}`);
    }
}

/**
 * Lit un fichier JSON de données.
 * @param {string} filePath - Chemin vers le fichier JSON.
 * @returns {Promise<Array>} Tableau des données.
 */
async function readJsonFile(filePath) {
    try {
        const data = await fs.readFile(filePath, 'utf8');
        return data ? JSON.parse(data) : [];
    } catch (error) {
        if (error.code === 'ENOENT' || error instanceof SyntaxError) {
            return []; // Retourne un tableau vide si le fichier n'existe pas ou est vide/corrompu
        }
        throw error; // Rejette d'autres erreurs
    }
}

/**
 * Écrit des données dans un fichier JSON.
 * @param {string} filePath - Chemin vers le fichier JSON.
 * @param {Array} data - Tableau des données à écrire.
 */
async function writeJsonFile(filePath, data) {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
}


/**
 * Enregistre une interaction AI dans les fichiers de logs.
 * @param {string} persona - Le rôle de l'IA (scientifique, lanceur-alerte, journaliste, enquêteur).
 * @param {string} userMessage - Le message de l'utilisateur.
 * @param {string} aiResponse - La réponse de l'IA.
 * @returns {string} L'ID unique de l'interaction logguée.
 */
async function logInteraction(persona, userMessage, aiResponse) {
    ensureDirectoriesExist(); // S'assurer que le répertoire existe

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
    fsSync.appendFileSync(markdownLogFile, markdownContent, 'utf8'); // Utilisation de fsSync.appendFileSync
    console.log(`Interaction logguée dans ${markdownLogFile}`);

    return id; // Retourne l'ID pour référence si besoin
}



/**
 * Fonction pour obtenir le message système basé sur la persona.
 * Cette fonction est identique à celle du frontend pour garantir la cohérence.
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
    - Des événements climatiques extrêmes (pluies intenses, fortes chaleurs, ouragans, grêlons géants, inondations) sont observés, exacerbant la crise bioclimatique.
    `;

    switch (persona) {
        case 'scientifique':
            return `${generalContext}
            Votre rôle est d'analyser les données et de présenter des faits scientifiques sur le dérèglement bioclimatique, la géo-ingénierie, les impacts de la Loi Duplomb et des Accords de Paris, en vous basant sur des preuves et des analyses rigoureuses. Évitez le sensationnalisme et concentrez-vous sur l'objectivité scientifique. Expliquez les mécanismes et les conséquences potentielles de manière claire et factuelle.`;
        case 'lanceur-alerte': // Nom de persona corrigé
            return `${generalContext}
            Votre rôle est d'être un lanceur d'alerte courageux et passionné par la vérité sur la catastrophe bioclimatique. Dénoncez les faits, les morts et les victimes, en mettant en lumière la manipulation politique (EMP, 49.3), les dangers de la Loi Duplomb (acétamipride, bassines), les risques de la géo-ingénierie et l'échec perçu des Accords de Paris à protéger réellement l'environnement et la population. Votre langage est direct, émotionnel et vise à alerter le public sur les dangers imminents et le manque de transparence.`;
        case 'journaliste': // Nom de persona corrigé
            return `${generalContext}
            Votre rôle est d'être un journaliste d'investigation indépendant. Vous cherchez à rapporter les faits de manière équilibrée mais critique, en questionnant les narratives officielles et en cherchant la vérité derrière les événements. Enquêtez sur la Loi Duplomb, le rôle du groupement EMP et l'utilisation de l'article 49.3, les implications des Accords de Paris et de la géo-ingénierie, et leurs conséquences réelles sur la population et l'environnement. Formulez vos réponses comme un article de presse ou une enquête, en citant des sources et en soulignant les zones d'ombre.`;
        case 'enquêteur': // Nom de persona corrigé
            return `${generalContext}
            Votre rôle est d'agir comme un enquêteur de terrain. Vous êtes chargé de collecter des informations, des témoignages, des photos, des vidéos, et des données scientifiques sur les événements bioclimatiques et les affaires liées à la Loi Duplomb, à la géo-ingénierie, et aux actions du groupement EMP. Votre objectif est de fournir des détails concrets, des observations précises et des ensembles de définitions claires pour documenter la réalité sur le terrain. Vous devez être précis, factuel et orienté vers la collecte de preuves.`;
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

// --- Routes pour le Chatbot Interactif ---

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


// --- Routes pour la gestion des logs ---

/**
 * GET /logs
 * Lit et renvoie le contenu de logs.json.
 */
app.get('/logs', (req, res) => {
    ensureDirectoriesExist(); // S'assurer que le répertoire existe
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
    ensureDirectoriesExist(); // S'assurer que le répertoire existe
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
    ensureDirectoriesExist(); // S'assurer que le répertoire existe
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
    ensureDirectoriesExist(); // S'assurer que le répertoire existe
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

// --- API Endpoints spécifiques à chaque rôle ---

// Journaliste: Soumettre, récupérer, modifier et supprimer des articles
app.post('/api/journalist/articles', async (req, res) => {
    ensureDirectoriesExist();
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
    ensureDirectoriesExist();
    try {
        const articles = await readJsonFile(journalistArticlesPath);
        res.status(200).json(articles);
    } catch (error) {
        console.error('Erreur lors de la récupération des articles du journaliste:', error);
        res.status(500).json({ message: 'Erreur interne du serveur lors de la récupération des articles.' });
    }
});

// NOUVELLE ROUTE : Mettre à jour un article existant
app.put('/api/journalist/articles/:id', async (req, res) => {
    ensureDirectoriesExist();
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

        // Mettre à jour l'article avec les nouvelles données (et conserver l'ID/timestamp d'origine)
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

// NOUVELLE ROUTE : Supprimer un article existant
app.delete('/api/journalist/articles/:id', async (req, res) => {
    ensureDirectoriesExist();
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

// NOUVELLE ROUTE : Assister le journaliste avec l'IA pour générer du contenu
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


// ... (le reste de votre server.js)
// Enquêteur: Soumettre des rapports et rechercher des observations
app.post('/api/investigator/reports', async (req, res) => {
    ensureDirectoriesExist();
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
    ensureDirectoriesExist();
    // Pour l'instant, on peut simuler des observations ou les récupérer d'un fichier statique
    // Plus tard, cela pourrait interroger une base de données plus complexe
    const query = req.query.q || ''; // Terme de recherche optionnel
    try {
        // Exemple de données d'observations simulées
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
    ensureDirectoriesExist();
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
    ensureDirectoriesExist();
    // Pour l'instant, on peut renvoyer des données d'analyse simulées ou réelles
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
    ensureDirectoriesExist();
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
    ensureDirectoriesExist();
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


// Démarre le serveur Express et l'écoute sur le port spécifié.
app.listen(port, () => {
    console.log(`Serveur démarré sur http://localhost:${port}`);
    // Mise à jour des messages de console pour refléter les nouvelles pages
    console.log(`Accédez au site principal : http://localhost:${port}`);
    console.log(`Accédez à l'entrée du chatbot : http://localhost:${port}/pages/chatbot-entry.html`);
    console.log(`Ou à l'interface de test des assistants : http://localhost:${port}/content-generator.html`);
    // Assurer que les répertoires de logs et de données sont prêts au démarrage
    ensureDirectoriesExist();
});
