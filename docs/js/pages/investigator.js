// public/js/pages/investigator.js

// Import de la fonction d'initialisation de la carte depuis map.js
// Assurez-vous que le chemin est correct en fonction de votre structure de dossiers
import { initializeMap } from '../../js/map.js';

document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('.sidebar-nav a');
    const contentSections = document.querySelectorAll('.content-section');

    function showSection(id) {
        contentSections.forEach(section => {
            section.classList.remove('active');
            // Ajoutez une classe 'hidden' si vous utilisez un système de masquage CSS
            // section.classList.add('hidden');
        });

        const targetSection = document.getElementById(id);
        if (targetSection) {
            targetSection.classList.add('active');
            // Si vous utilisez une classe 'hidden', retirez-la ici
            // targetSection.classList.remove('hidden');

            // NOUVEAU : Initialiser la carte si la section est 'carte-evenements'
            if (id === 'carte-evenements') {
                console.log("Initialisation de la carte pour le Dashboard Enquêteur.");
                
                // Vérifier et attendre que Leaflet (L) soit défini
                let retryCount = 0;
                const maxRetries = 50; // Augmenté à 50 tentatives (50 * 100ms = 5 secondes)
                const retryDelay = 100; // Augmenté à 100ms

                const tryInitializeMapInvestigator = () => {
                    if (typeof window.L !== 'undefined') {
                        console.log("Leaflet (L) est défini. Initialisation de la carte de l'enquêteur.");
                        // Appel de la fonction d'initialisation de la carte, en lui passant les IDs spécifiques
                        initializeMap('mapid-investigator', 'observedEventsListInvestigator');
                    } else if (retryCount < maxRetries) {
                        retryCount++;
                        console.warn(`Leaflet (L) n'est pas encore défini dans investigator.js. Nouvelle tentative dans ${retryDelay}ms. Tentative ${retryCount}/${maxRetries}`);
                        setTimeout(tryInitializeMapInvestigator, retryDelay);
                    } else {
                        console.error("Échec de l'initialisation de la carte Leaflet après plusieurs tentatives. Vérifiez que Leaflet est correctement chargé.");
                    }
                };
                tryInitializeMapInvestigator();
            }
        }
    }

    navLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const targetId = event.target.getAttribute('href').substring(1); // Remove '#'
            showSection(targetId);

            navLinks.forEach(nav => nav.classList.remove('active'));
            event.target.classList.add('active');
        });
    });

    // Afficher la première section active au chargement
    if (navLinks.length > 0) {
        const initialTargetId = navLinks[0].getAttribute('href').substring(1);
        showSection(initialTargetId);
        navLinks[0].classList.add('active');
    }

    // Gestion de l'ouverture du chatbot (si applicable dans ce dashboard)
    const openChatbotBtn = document.getElementById('openChatbotBtn');
    if (openChatbotBtn) {
        openChatbotBtn.addEventListener('click', () => {
            if (typeof window.openChatbotModal === 'function') {
                window.openChatbotModal(); // Ouvre la modale
                if (typeof window.initializeChatbotUI === 'function') {
                    window.initializeChatbotUI(); // Initialise/réinitialise l'UI du chatbot
                    // Simuler un clic sur le bouton "Enquêteur" pour activer la persona
                    const chatbotModal = document.getElementById('chatbotModal');
                    if (chatbotModal) {
                        const investigatorPersonaButton = chatbotModal.querySelector('[data-persona="enquêteur"]');
                        if (investigatorPersonaButton && !investigatorPersonaButton.classList.contains('active-persona')) {
                            investigatorPersonaButton.click(); // Simule le clic
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
        });
    }
});
