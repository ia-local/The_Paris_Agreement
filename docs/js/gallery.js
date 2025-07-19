// public/js/gallery.js

console.log("gallery.js chargé."); // Debugging log

/**
 * Ouvre la modale d'affichage de média pour une image donnée et génère une description IA.
 * @param {string} imageUrl - Le chemin de l'image à afficher (ex: '/media/image.jpg').
 */
async function openGalleryImageInModal(imageUrl) {
    const mediaModal = document.getElementById('mediaModal');
    const modalImage = document.getElementById('modalImage');
    const imageDescription = document.getElementById('imageDescription');

    if (!mediaModal || !modalImage || !imageDescription) {
        console.error("Éléments de la modale média (mediaModal, modalImage, imageDescription) introuvables. Vérifiez votre index.html.");
        return;
    }

    // Réinitialiser le contenu précédent
    modalImage.src = '';
    imageDescription.textContent = ''; // Vide la description

    // Définir la source et le texte alternatif de l'image
    modalImage.src = imageUrl;
    modalImage.alt = "Image agrandie de la galerie";

    // Afficher un message de description en attente
    imageDescription.textContent = 'Génération de la description IA...';
    imageDescription.style.color = '#555'; // Couleur neutre pour le message d'attente

    // Ouvrir la modale via la fonction globale fournie par modals.js
    if (typeof window.openMediaModal === 'function') {
        window.openMediaModal(); 
        console.log(`Modale média ouverte pour image: ${imageUrl}`);
    } else {
        console.error("La fonction window.openMediaModal n'est pas définie. Assurez-vous que modals.js est chargé avant gallery.js.");
        imageDescription.textContent = 'Erreur: La modale ne peut pas s\'ouvrir.';
        imageDescription.style.color = 'red';
        return;
    }

    // Appel à l'API pour générer la description de l'image
    try {
        const response = await fetch('/api/describe-image', { // Appel au nouvel endpoint
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ imageUrl: imageUrl })
        });

        if (!response.ok) {
            const errorData = await response.json(); // Tenter de lire le JSON d'erreur
            throw new Error(`Erreur HTTP: ${response.status} - ${errorData.error || response.statusText}`);
        }

        const data = await response.json();
        if (data.description) {
            imageDescription.textContent = data.description;
            imageDescription.style.color = '#333'; // Couleur normale pour la description
        } else {
            imageDescription.textContent = 'Aucune description IA générée.';
            imageDescription.style.color = 'orange';
        }
    } catch (error) {
        console.error('Erreur lors de la génération de la description IA:', error);
        imageDescription.textContent = `Erreur lors du chargement de la description IA: ${error.message}. Veuillez réessayer.`;
        imageDescription.style.color = 'red';
    }
}


/**
 * Charge les images depuis le serveur et les affiche dans la galerie.
 */
window.loadGalleryImages = async function() {
    console.log("loadGalleryImages appelée."); // Debugging log
    const galleryContainer = document.getElementById('galleryContainer'); 

    if (!galleryContainer) {
        console.error("Conteneur de la galerie introuvable. Vérifiez votre index.html.");
        return;
    }

    try {
        const response = await fetch('/api/images');
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
        const imageUrls = await response.json(); 

        galleryContainer.innerHTML = ''; 

        if (imageUrls.length === 0) {
            galleryContainer.innerHTML = '<p>Aucun média disponible pour le moment.</p>';
            return;
        }

        imageUrls.forEach(url => {
            const galleryItemDiv = document.createElement('div');
            galleryItemDiv.classList.add('gallery-item');

            const mediaElement = document.createElement('img'); 
            mediaElement.src = url;
            mediaElement.alt = "Image de la galerie"; 
            mediaElement.loading = 'lazy'; 
            mediaElement.onerror = function() {
                this.src = `https://placehold.co/400x300/cccccc/333333?text=Image+Non+Disponible`;
                this.alt = "Image non disponible";
            };
            mediaElement.classList.add('gallery-media'); 

            const captionDiv = document.createElement('div');
            captionDiv.classList.add('gallery-item-caption');
            captionDiv.textContent = "Cliquez pour voir la description"; 

            galleryItemDiv.appendChild(mediaElement);
            galleryItemDiv.appendChild(captionDiv);

            // Ajouter l'écouteur d'événement pour ouvrir la modale avec la fonction améliorée
            galleryItemDiv.addEventListener('click', () => {
                openGalleryImageInModal(url);
            });

            galleryContainer.appendChild(galleryItemDiv);
        });
        console.log(`Galerie chargée avec ${imageUrls.length} éléments.`);
    } catch (error) {
        console.error('Erreur lors du chargement des éléments de la galerie:', error);
        galleryContainer.innerHTML = `<p style="color: #dc3545;">Erreur lors du chargement de la galerie: ${error.message}</p>`;
    }
};

// Initialisation des écouteurs d'événements pour la modale média (depuis modals.js)
document.addEventListener('DOMContentLoaded', () => {
    // Appel initial pour charger les images de la galerie
    window.loadGalleryImages();
});
