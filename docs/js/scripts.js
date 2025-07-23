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
                console.log(`Contenu de la section '${sectionId}' injecté.`);
            }
        }
    }

    /**
     * Affiche une section de contenu spécifique et masque les autres.
     * @param {string} sectionId - L'ID de la section à afficher.
     */
    function showContentSection(sectionId) {
        allContentSections.forEach(section => {
            section.classList.remove('active');
            section.classList.add('hidden'); // Assurez-vous que cette classe est définie dans votre CSS pour masquer
        });

        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
            targetSection.classList.remove('hidden'); // Rendre visible
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
            // NOUVEAU : Si la section est 'observations-discrepances', initialiser la carte
            if (sectionId === 'observations-discrepances') {
                console.log("Initialisation de la carte dans la section 'observations-discrepances'.");
                initializeMap(); // Appel de la fonction d'initialisation de la carte
            }
        } else {
            console.error(`Section avec l'ID '${sectionId}' introuvable.`);
        }
    }

    /**
     * Active le lien de la barre latérale correspondant à la section affichée.
     * @param {HTMLElement} activeLink - Le lien de la barre latérale à activer.
     */
    function activateSidebarLink(activeLink) {
        sidebarLinks.forEach(link => link.classList.remove('active'));
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }

    /**
     * Active le lien de navigation principal correspondant à la page ou section.
     * @param {string} pageId - L'ID de la page (ex: 'home', 'petition-form-nav').
     */
    function activateMainNavLink(pageId) {
        mainNavLinks.forEach(link => link.classList.remove('active'));
        const targetLink = document.querySelector(`.main-nav .nav-link[data-page="${pageId}"]`);
        if (targetLink) {
            targetLink.classList.add('active');
        }
    }

    // Écouteurs d'événements pour les liens de la barre latérale
    sidebarLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const sectionId = link.dataset.sectionId || link.getAttribute('href').substring(1);
            showContentSection(sectionId);
            activateSidebarLink(link);
            // Mettre à jour le lien principal si cela correspond à une page principale
            const mainNavLinkDataPage = link.dataset.mainNavLink || link.dataset.page; // Si un lien latéral est lié à un lien principal
            if (mainNavLinkDataPage) {
                activateMainNavLink(mainNavLinkDataPage);
            }
            // Mettre à jour l'URL sans recharger la page
            history.pushState(null, '', `#${sectionId}`);
        });
    });

    // Écouteurs d'événements pour les liens de la navigation principale
    mainNavLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            // Pour les liens qui mènent à des pages HTML séparées (ex: missions.html),
            // on laisse le comportement par défaut du navigateur.
            if (link.getAttribute('href').startsWith('pages/')) {
                return; // Ne pas empêcher le comportement par défaut
            }

            event.preventDefault();
            const sectionId = link.getAttribute('href').substring(1);
            showContentSection(sectionId);
            activateMainNavLink(link.dataset.page);
            // Désactiver tous les liens de la sidebar, sauf si la section est la page d'accueil
            sidebarLinks.forEach(sidebarLink => sidebarLink.classList.remove('active'));
            const correspondingSidebarLink = document.querySelector(`.sidebar-link[data-section-id="${sectionId}"]`);
            if (correspondingSidebarLink) {
                correspondingSidebarLink.classList.add('active');
            }
            // Mettre à jour l'URL sans recharger la page
            history.pushState(null, '', `#${sectionId}`);
        });
    });

    // Gestion du bouton "Signer la Pétition" dans les sections
    if (goToPetitionBtn) {
        goToPetitionBtn.addEventListener('click', () => {
            console.log("Bouton 'Signer la Pétition' cliqué.");
            // Simuler un clic sur le lien de navigation principal de la pétition
            const petitionNavLink = document.querySelector('.main-nav .nav-link[data-page="petition-form-nav"]');
            if (petitionNavLink) {
                petitionNavLink.click();
            } else {
                console.warn("Lien de navigation de la pétition introuvable.");
            }
        });
    } else {
        console.warn("Bouton #goToPetitionBtn introuvable.");
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
    // Ou la section spécifiée dans l'URL (hash)
    const initialSectionId = window.location.hash ? window.location.hash.substring(1) : 'introduction';
    showContentSection(initialSectionId);
    activateSidebarLink(document.querySelector(`.sidebar-link[data-section-id="${initialSectionId}"]`));
    // Assurez-vous que le lien de navigation principal correspondant est également actif
    // Cela nécessite une logique pour mapper les sections aux pages principales si nécessaire
    // Par exemple, si 'introduction' est la 'home' page
    if (initialSectionId === 'introduction') {
        activateMainNavLink('home');
    } else {
        // Logique pour activer le bon lien principal si le hash correspond à une section
        // qui n'est pas la page d'accueil par défaut
        const mainNavLinkForSection = document.querySelector(`.main-nav .nav-link[href="#${initialSectionId}"]`);
        if (mainNavLinkForSection) {
            activateMainNavLink(mainNavLinkForSection.dataset.page);
        }
    }


    // 4. Initialisation du chatbot UI (appelée après que le DOM est prêt)
    if (window.initializeChatbotUI && typeof window.initializeChatbotUI === 'function') {
        window.initializeChatbotUI();
        console.log("Fonction initializeChatbotUI appelée.");
    } else {
        console.warn("La fonction window.initializeChatbotUI n'est pas définie. Assurez-vous que chatbot.js est chargé et expose cette fonction.");
    }
});
