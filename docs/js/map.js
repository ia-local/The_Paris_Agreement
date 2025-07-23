// public/js/map.js
// Ce module gère l'initialisation et l'affichage de la carte Leaflet,
// ainsi que la récupération dynamique des événements chronologiques depuis le backend.

let mymap = null; // Variable globale au module pour stocker l'instance de la carte Leaflet.
                  // Permet de la manipuler (ex: la détruire) si la fonction initializeMap est appelée plusieurs fois.

/**
 * Initialise une carte Leaflet dans un conteneur spécifié et y affiche les événements.
 * Cette fonction est exportée pour être utilisée par d'autres modules (ex: investigator.js).
 * @param {string} mapContainerId - L'ID de l'élément DIV où la carte doit être initialisée (par défaut 'mapid' pour index.html).
 * @param {string} eventsListId - L'ID de l'élément UL où la liste des événements doit être affichée (par défaut 'observedEventsList').
 */
export function initializeMap(mapContainerId = 'mapid', eventsListId = 'observedEventsList') {
    // Vérifier si Leaflet (L) est chargé avant d'essayer de l'utiliser.
    // C'est une sécurité, car le chargement de leaflet.js est asynchrone.
    if (typeof window.L === 'undefined') {
        console.error("Leaflet (L) n'est pas défini. Assurez-vous que leaflet.js est chargé AVANT map.js.");
        return;
    }

    const mapContainer = document.getElementById(mapContainerId);
    const observedEventsList = document.getElementById(eventsListId);

    // Vérifier si le conteneur de la carte existe dans le DOM.
    if (!mapContainer) {
        console.warn(`L'élément '${mapContainerId}' pour la carte n'a pas été trouvé. La carte ne sera pas initialisée.`);
        return;
    }

    // Si une instance de carte Leaflet existe déjà pour ce conteneur, la détruire.
    // Cela est crucial pour éviter les problèmes lors de la navigation entre les sections
    // qui réinitialisent la carte (ex: dans le dashboard enquêteur).
    if (mymap && mymap.getContainer().id === mapContainerId) {
        console.log(`Carte existante trouvée pour ${mapContainerId}. Suppression.`);
        mymap.remove(); // Supprime la carte de l'DOM et nettoie les écouteurs d'événements Leaflet.
        mymap = null; // Réinitialise la variable globale.
    }
    
    // S'assurer que le conteneur est vide avant d'initialiser une nouvelle carte.
    // Cela évite les résidus d'anciennes initialisations.
    mapContainer.innerHTML = ''; 

    // --- Initialisation de la carte Leaflet ---
    // Coordonnées initiales centrées sur la France (pour une vue générale).
    const initialLat = 46.603354;
    const initialLng = 1.888334;
    const initialZoom = 6; // Niveau de zoom initial.

    // Crée une nouvelle instance de carte Leaflet et la centre sur les coordonnées initiales.
    mymap = window.L.map(mapContainerId).setView([initialLat, initialLng], initialZoom);

    // Ajout d'une couche de tuiles (OpenStreetMap par défaut).
    // C'est la base visuelle de la carte.
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mymap); // Ajoute la couche à la carte.

    /**
     * Ajoute un marqueur sur la carte pour un événement donné et l'ajoute à la liste textuelle.
     * Inclut un lien vers une vidéo si disponible.
     * @param {object} event - L'objet événement contenant les propriétés (title, type, location, latitude, longitude, timestamp, description, videoUrl?).
     */
    function addEventMarker(event) {
        if (!mymap) return; // S'assurer que la carte existe avant d'ajouter un marqueur.

        // Crée un marqueur Leaflet aux coordonnées de l'événement.
        const marker = window.L.marker([event.latitude, event.longitude]).addTo(mymap);
        
        // Contenu HTML pour la popup du marqueur
        let popupContent = `
            <b>${event.title}</b><br>
            Type: ${event.type}<br>
            Localisation: ${event.location}<br>
            Date: ${new Date(event.timestamp).toLocaleString('fr-FR')}<br>
            Description: ${event.description}
        `;

        // NOUVEAU : Ajouter un lien vidéo si videoUrl est présent
        if (event.videoUrl) {
            popupContent += `<br><br><a href="${event.videoUrl}" target="_blank" style="color: #007bff; text-decoration: underline;">Voir la vidéo de l'événement</a>`;
            // Note: Pour une lecture directe sur la carte ou une modale, il faudrait un lecteur vidéo intégré
            // ou une fonction pour ouvrir une modale spécifique. Pour l'instant, un lien ouvre dans un nouvel onglet.
        }

        // Attache la popup au marqueur qui s'affiche au clic.
        marker.bindPopup(popupContent);

        // Ajoute l'événement à la liste textuelle affichée à côté de la carte.
        if (observedEventsList) {
            const listItem = document.createElement('li');
            listItem.innerHTML = `
                <strong>${event.title}</strong> (${new Date(event.timestamp).toLocaleDateString('fr-FR')}) - 
                ${event.description} à ${event.location}
                <button class="btn-view-on-map" data-lat="${event.latitude}" data-lng="${event.longitude}">Voir sur la carte</button>
                ${event.videoUrl ? `<a href="${event.videoUrl}" target="_blank" class="btn-view-video ml-2">Voir Vidéo</a>` : ''}
            `;
            observedEventsList.appendChild(listItem);

            // Ajoute un écouteur d'événement pour le bouton "Voir sur la carte".
            // Au clic, la carte se centre sur l'événement et ouvre sa popup.
            listItem.querySelector('.btn-view-on-map').addEventListener('click', () => {
                mymap.setView([event.latitude, event.longitude], 12); // Zoom sur l'événement (niveau 12 pour un bon détail).
                marker.openPopup(); // Ouvre la popup du marqueur.
            });
        }
    }

    /**
     * Charge les événements chronologiques depuis le backend via l'API.
     * Nettoie la carte et la liste existantes avant d'afficher les nouvelles données.
     */
    async function loadChronologicalEvents() {
        try {
            // Afficher un message de chargement dans la liste des événements.
            if (observedEventsList) {
                observedEventsList.innerHTML = '<li>Chargement des événements...</li>';
            }

            // Effectuer la requête GET vers l'API des événements chronologiques.
            const response = await fetch('/api/events/chronological');
            if (!response.ok) {
                // Gérer les erreurs HTTP (ex: 404, 500).
                throw new Error(`Erreur HTTP! Statut: ${response.status}`);
            }
            // Parser la réponse JSON.
            const events = await response.json();

            // Nettoyer la carte : supprimer tous les marqueurs existants.
            mymap.eachLayer(layer => {
                if (layer instanceof window.L.Marker) { // Vérifie si la couche est un marqueur Leaflet.
                    mymap.removeLayer(layer);
                }
            });
            
            // Nettoyer la liste des événements affichée.
            if (observedEventsList) {
                observedEventsList.innerHTML = '';
            }

            // Si aucun événement n'est retourné, afficher un message.
            if (events.length === 0) {
                if (observedEventsList) {
                    observedEventsList.innerHTML = '<li>Aucun événement chronologique trouvé.</li>';
                }
                return;
            }

            // Trier les événements par timestamp (du plus récent au plus ancien) pour l'affichage.
            events.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

            // Ajouter chaque événement à la carte et à la liste.
            events.forEach(event => addEventMarker(event));
            console.log('Événements chronologiques chargés depuis le backend:', events);
        } catch (error) {
            console.error('Erreur lors du chargement des événements chronologiques:', error);
            // Afficher un message d'erreur dans la liste des événements si la récupération échoue.
            if (observedEventsList) {
                observedEventsList.innerHTML = `<li style="color: #dc3545;">Erreur lors du chargement des événements: ${error.message}</li>`;
            }
        } finally {
            // Invalider la taille de la carte pour s'assurer qu'elle s'affiche correctement.
            // Ceci est important si le conteneur de la carte était initialement masqué ou de taille 0.
            if (mymap) {
                mymap.invalidateSize();
            }
        }
    }

    // Appeler la fonction pour charger les événements dès que la carte est initialisée.
    loadChronologicalEvents();
}
