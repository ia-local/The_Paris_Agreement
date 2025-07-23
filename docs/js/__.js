// public/js/scripts.js

console.log("scripts.js chargé."); // Debugging log

// Importe les fonctions nécessaires des modules
import { sectionsContent } from './sectionContent.js';
import { loadPetitionResults, setupPetitionForm } from './petition.js';
import { initializeMap } from './map.js'; // NOUVEAU : Import de la fonction d'initialisation de la carte

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOMContentLoaded dans scripts.js."); // Debugging log

    // Récupération des éléments DOM
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    const mainNavLinks = document.querySelectorAll('.main-nav .nav-link');
    const goToPetitionBtn = document.getElementById('goToPetitionBtn');
    const shareObservationBtn = document.getElementById('shareObservationBtn');
    const allContentSections = document.querySelectorAll('.content-section');

    /**
     * Injecte le contenu HTML de sectionContent.js dans les sections correspondantes de index.html.
     * Cette fonction n'est appelée qu'une seule fois au chargement de la page.
     */
    function injectStaticContent() {
        for (const sectionId in sectionsContent) {
            // Seules les sections qui existent dans index.html et ne sont pas 'roles-overview'
            // (qui est dans missions.html) seront injectées ici.
            const targetSection = document.getElementById(sectionId);
            if (targetSection && sectionId !== 'roles-overview') {
                targetSection.innerHTML = sectionsContent[sectionId];
                console.log(`Contenu de la section '${sectionId}' injecté dans le DOM.`);
            }
        }
    }

    /**
     * Affiche la section de contenu spécifiée et masque les autres.
     * @param {string} sectionId - L'ID de la section à afficher.
     */
    function showContentSection(sectionId) {
        // Masquer toutes les sections
        allContentSections.forEach(section => {
            section.classList.remove('active');
        });

        // Afficher la section demandée
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
            console.log(`Section '${sectionId}' rendue active.`);
        } else {
            console.error(`Erreur: La section avec l'ID '${sectionId}' est introuvable dans le DOM.`);
        }

        // Actions spécifiques après l'affichage d'une section
        if (sectionId === 'preuves-visuelles') {
            setTimeout(() => {
                if (typeof window.loadGalleryImages === 'function') {
                    window.loadGalleryImages();
                    console.log("Chargement de la galerie d'images déclenché.");
                } else {
                    console.warn("La fonction window.loadGalleryImages n'est pas définie. Assurez-vous que gallery.js est chargé et expose cette fonction.");
                }
            }, 50);
        } else if (sectionId === 'petition-form') {
            loadPetitionResults();
            console.log("Chargement des résultats de la pétition.");
        }
    }

    /**
     * Active le lien de la barre latérale correspondant à la section active.
     * @param {HTMLElement} linkElement - L'élément de lien à activer.
     */
    function activateSidebarLink(linkElement) {
        // Désactiver tous les liens de la barre latérale
        sidebarLinks.forEach(link => {
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

    /**
     * Active le lien de la navigation principale correspondant à la page/section active.
     * @param {string} dataPageIdentifier - L'identifiant 'data-page' du lien principal à activer.
     */
    function activateMainNavLink(dataPageIdentifier) {
        mainNavLinks.forEach(navLink => {
            navLink.classList.remove('active');
            if (navLink.dataset.page === dataPageIdentifier) {
                navLink.classList.add('active');
            }
        });
    }

    // Gestion des clics sur les liens de la barre latérale
    sidebarLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            const sectionId = link.dataset.sectionId;

            // Si le lien pointe vers une autre page (comme missions.html), laisser le navigateur gérer
            if (link.getAttribute('href') && link.getAttribute('href').endsWith('.html')) {
                return;
            }

            event.preventDefault(); // Empêche le défilement par défaut pour les liens internes
            if (sectionId) {
                showContentSection(sectionId);
                activateSidebarLink(link);
                // Activer le lien "Accueil du Rapport" dans la nav principale pour les sections de la sidebar
                activateMainNavLink('home');
            }
        });
    });

    // Gestion des clics sur les liens de navigation principaux
    mainNavLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            // Pour les liens qui sont des redirections directes (comme missions.html ou ai-tools.html),
            // on ne veut PAS empêcher le comportement par défaut.
            if (link.getAttribute('href') && link.getAttribute('href').endsWith('.html')) {
                return; // Laisse le navigateur gérer la redirection
            }

            event.preventDefault();
            const dataPage = link.dataset.page;

            // Activer le lien de navigation principal cliqué
            activateMainNavLink(dataPage);

            // Gérer l'affichage des sections en fonction du lien principal
            if (dataPage === 'home') {
                showContentSection('introduction'); // Affiche l'introduction
                activateSidebarLink(document.querySelector('.sidebar-link[data-section-id="introduction"]'));
            } else if (dataPage === 'petition-form-nav') { // Nouveau data-page ID pour le lien pétition
                showContentSection('petition-form');
                sidebarLinks.forEach(sidebarLink => sidebarLink.classList.remove('active')); // Désactive les liens de la sidebar
            } else if (dataPage === 'contact-resources-nav') { // Nouveau data-page ID pour le lien contact
                showContentSection('contact-resources');
                sidebarLinks.forEach(sidebarLink => sidebarLink.classList.remove('active')); // Désactive les liens de la sidebar
            }
            // La section 'roles-overview' est maintenant gérée par missions.html
        });
    });

    // Gestion des boutons d'action (Signer la Pétition, Partager une Observation)
    if (goToPetitionBtn) {
        goToPetitionBtn.addEventListener('click', () => {
            showContentSection('petition-form');
            activateMainNavLink('petition-form-nav'); // Active le lien pétition dans la nav principale
            sidebarLinks.forEach(sidebarLink => sidebarLink.classList.remove('active')); // Désactive les liens de la sidebar
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

        // Gestion du bouton "Partager une Observation"
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
    
    // 1. Injecter tout le contenu HTML dans les sections au chargement
    injectStaticContent();
    console.log("Contenu statique injecté.");

    // 2. Initialisation du formulaire de pétition
    setupPetitionForm();
    console.log("setupPetitionForm appelée.");

    // 3. Afficher la section "Introduction" par défaut au chargement
    showContentSection('introduction');
    activateSidebarLink(document.querySelector('.sidebar-link[data-section-id="introduction"]'));
    activateMainNavLink('home');

    // 4. Initialisation du chatbot UI (appelée après que le DOM est prêt)
    if (window.initializeChatbotUI && typeof window.initializeChatbotUI === 'function') {
        window.initializeChatbotUI();
        console.log("Fonction initializeChatbotUI appelée.");
    } else {
        console.warn("La fonction window.initializeChatbotUI n'est pas définie. Assurez-vous que chatbot.js est chargé et expose cette fonction.");
    }
});