// public/js/scripts.js

console.log("scripts.js chargé."); // Debugging log

// Importe les fonctions nécessaires des modules
import { sectionsContent } from './sectionContent.js';
// Assurez-vous que loadPetitionResults et setupPetitionForm sont exposées globalement par petition.js
// ou importez-les directement si petition.js est aussi un module.
// Pour l'instant, nous allons les appeler via window si elles sont exposées globalement.

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOMContentLoaded dans scripts.js."); // Debugging log

    // Récupération des éléments DOM
    const contentDisplay = document.getElementById('content-display');
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    const mainNavLinks = document.querySelectorAll('.main-nav .nav-link');
    const goToPetitionBtn = document.getElementById('goToPetitionBtn');
    const shareObservationBtn = document.getElementById('shareObservationBtn');

    // Vérification des éléments critiques
    if (!contentDisplay) {
        console.error("Erreur: L'élément #content-display est introuvable. Le chargement du contenu des sections ne fonctionnera pas.");
        // Ne pas retourner ici pour permettre aux autres scripts de s'initialiser si possible
    }

    /**
     * Charge le contenu d'une section donnée dans l'élément content-display.
     * @param {string} sectionId - L'ID de la section à charger (ex: 'introduction').
     */
    function loadContentSection(sectionId) {
        if (contentDisplay && sectionsContent[sectionId]) {
            contentDisplay.innerHTML = sectionsContent[sectionId];
            console.log(`Contenu de la section '${sectionId}' chargé dans #content-display.`);

            // Si la section "Preuves Visuelles" est chargée, déclencher le chargement de la galerie
            if (sectionId === 'preuves-visuelles') {
                // window.loadGalleryImages est exposée globalement par gallery.js
                if (typeof window.loadGalleryImages === 'function') {
                    window.loadGalleryImages();
                    console.log("Chargement de la galerie d'images déclenché.");
                } else {
                    console.warn("La fonction window.loadGalleryImages n'est pas définie. Assurez-vous que gallery.js est chargé et expose cette fonction.");
                }
            }

        } else if (contentDisplay) {
            contentDisplay.innerHTML = `<p>Contenu pour la section "${sectionId}" non trouvé.</p>`;
            console.warn(`Contenu pour la section '${sectionId}' non trouvé dans sectionContent.js.`);
        }
    }

    /**
     * Affiche la section de contenu spécifiée et masque les autres.
     * Gère également l'activation/désactivation des liens de navigation principaux.
     * @param {string} sectionId - L'ID de la section à afficher.
     */
    function showContentSection(sectionId) {
        // Masquer toutes les sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });

        // Afficher la section demandée
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
            console.log(`Section '${sectionId}' rendue active.`);
        } else {
            console.error(`Erreur: La section avec l'ID '${sectionId}' est introuvable.`);
        }

        // Recharge les résultats de la pétition si la section est la pétition
        if (sectionId === 'petition-form') {
            // window.loadPetitionResults est exposée globalement par petition.js
            if (typeof window.loadPetitionResults === 'function') {
                window.loadPetitionResults();
                console.log("Chargement des résultats de la pétition.");
            } else {
                console.warn("La fonction window.loadPetitionResults n'est pas définie.");
            }
        }
    }

    /**
     * Active le lien de la barre latérale correspondant à la section active.
     * @param {HTMLElement} linkElement - L'élément de lien à activer.
     */
    function activateSidebarLink(linkElement) {
        // Désactiver tous les liens de la barre latérale
        document.querySelectorAll('.sidebar-link').forEach(link => {
            link.classList.remove('active');
        });
        // Activer le lien cliqué
        if (linkElement) {
            linkElement.classList.add('active');
            console.log(`Lien de la barre latérale '${linkElement.textContent}' activé.`);
        } else {
            console.warn("Element de lien de la barre latérale est null lors de l'activation.");
        }
    }

    // Gestion des clics sur les liens de la barre latérale
    sidebarLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault(); // Empêche le défilement par défaut
            const sectionId = link.dataset.sectionId;
            if (sectionId) {
                loadContentSection(sectionId);
                showContentSection('content-display'); // Affiche toujours la div content-display pour les sections de contenu
                activateSidebarLink(link);

                // Désactiver les liens de la navigation principale
                mainNavLinks.forEach(navLink => navLink.classList.remove('active'));
                // Activer le lien "Accueil du Rapport" si on est sur une section de la sidebar
                const homeNavLink = document.querySelector('.main-nav .nav-link[data-page="home"]');
                if (homeNavLink) {
                    homeNavLink.classList.add('active');
                }
            }
        });
    });

    // Gestion des clics sur les liens de navigation principaux
    mainNavLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            // Pour les liens qui sont des redirections directes (comme "Rôles & Missions"),
            // on ne veut PAS empêcher le comportement par défaut.
            if (link.dataset.page === 'roles') {
                return; // Laisse le navigateur gérer la redirection
            }

            event.preventDefault();
            const pageId = link.dataset.page;

            // Désactiver tous les liens de navigation principaux
            mainNavLinks.forEach(navLink => navLink.classList.remove('active'));
            // Activer le lien cliqué
            link.classList.add('active');

            // Gérer l'affichage des sections en fonction du lien principal
            if (pageId === 'home') {
                showContentSection('content-display'); // Affiche la section de contenu dynamique
                loadContentSection('introduction'); // Recharge l'introduction
                activateSidebarLink(document.querySelector('.sidebar-link[data-section-id="introduction"]'));
            } else if (pageId === 'petition-form') {
                showContentSection('petition-form'); // Affiche la section de pétition
                // Désactiver les liens de la sidebar quand on est sur une section principale
                sidebarLinks.forEach(sidebarLink => sidebarLink.classList.remove('active'));
            } else if (pageId === 'contact-resources') {
                showContentSection('contact-resources'); // Affiche la section de contact
                // Désactiver les liens de la sidebar quand on est sur une section principale
                sidebarLinks.forEach(sidebarLink => sidebarLink.classList.remove('active'));
            }
        });
    });

    // Gestion des boutons d'action (Signer la Pétition, Partager une Observation)
    if (goToPetitionBtn) {
        goToPetitionBtn.addEventListener('click', () => {
            showContentSection('petition-form');
            // Désactiver tous les liens de navigation principaux et activer celui de la pétition
            mainNavLinks.forEach(navLink => navLink.classList.remove('active'));
            const petitionNavLink = document.querySelector('.main-nav .nav-link[data-page="petition-form"]');
            if (petitionNavLink) {
                petitionNavLink.classList.add('active');
            }
            // Désactiver les liens de la sidebar
            sidebarLinks.forEach(sidebarLink => sidebarLink.classList.remove('active'));
            console.log("Bouton 'Signer la Pétition' cliqué.");
        });
    } else {
        console.warn("Bouton #goToPetitionBtn introuvable.");
    }

    if (shareObservationBtn) {
        shareObservationBtn.addEventListener('click', () => {
            console.log("Bouton 'Partager une Observation' cliqué.");
            // window.openChatbotModal est exposée globalement par modals.js
            if (typeof window.openChatbotModal === 'function') {
                window.openChatbotModal();
            } else {
                console.warn("La fonction window.openChatbotModal n'est pas définie.");
            }
        });
    } else {
        console.warn("Bouton #shareObservationBtn introuvable.");
    }

    // Initialisation du formulaire de pétition et chargement des résultats
    // Ces appels doivent être faits APRÈS que les éléments DOM sont garantis d'exister
    // window.setupPetitionForm est exposée globalement par petition.js
    if (typeof window.setupPetitionForm === 'function') {
        window.setupPetitionForm();
        console.log("setupPetitionForm appelée.");
    } else {
        console.warn("La fonction window.setupPetitionForm n'est pas définie.");
    }

    // window.loadPetitionResults est appelée par showContentSection('petition-form')
    // mais aussi une fois au démarrage si la section pétition est la première affichée
    // Pour l'initialisation, on charge l'intro par défaut

    // Afficher la section "Introduction" par défaut au chargement
    loadContentSection('introduction');
    showContentSection('content-display'); // S'assure que la div content-display est visible
    activateSidebarLink(document.querySelector('.sidebar-link[data-section-id="introduction"]'));

    // Initialisation du chatbot UI (appelée après que le DOM est prêt)
    // window.initializeChatbotUI est exposée globalement par chatbot.js
    if (window.initializeChatbotUI && typeof window.initializeChatbotUI === 'function') {
        window.initializeChatbotUI();
        console.log("Fonction initializeChatbotUI appelée.");
    } else {
        console.warn("La fonction window.initializeChatbotUI n'est pas définie. Assurez-vous que chatbot.js est chargé et expose cette fonction.");
    }
});
