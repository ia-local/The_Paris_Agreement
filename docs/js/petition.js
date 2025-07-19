// public/js/petition.js

console.log("petition.js chargé."); // Debugging log

/**
 * Charge et affiche les résultats de la pétition.
 */
export async function loadPetitionResults() { // Exportation nommée
    console.log("loadPetitionResults appelée."); // Debugging log
    const petitionCountSpan = document.getElementById('petitionCount');
    const votesListDiv = document.getElementById('votesList');

    if (!petitionCountSpan || !votesListDiv) {
        console.error('Éléments DOM de la pétition (petitionCount ou votesList) introuvables. Impossible de charger les résultats.');
        return; // Arrêter l'exécution si les éléments ne sont pas là
    }

    try {
        const response = await fetch('/api/petition/results'); // Chemin corrigé
        if (!response.ok) {
            const errorText = await response.text(); // Tenter de lire le corps de l'erreur
            throw new Error(`Erreur de récupération des résultats de la pétition: ${response.status} - ${errorText}`);
        }
        const votes = await response.json();

        petitionCountSpan.textContent = votes.length;
        votesListDiv.innerHTML = ''; // Nettoyer la liste existante

        if (votes.length === 0) {
            votesListDiv.innerHTML = '<p>Aucun vote enregistré pour le moment.</p>';
        } else {
            // Tri par date décroissante (du plus récent au plus ancien)
            votes.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

            votes.forEach(vote => {
                const voteEntry = document.createElement('div');
                voteEntry.classList.add('vote-entry', 'p-3', 'mb-2', 'bg-gray-50', 'rounded-md', 'shadow-sm');
                voteEntry.innerHTML = `
                    <p><strong>Nom :</strong> ${vote.userName}</p>
                    <p><strong>Email :</strong> ${vote.userEmail}</p>
                    <p><strong>Commentaire :</strong> ${vote.userComment || 'Pas de commentaire.'}</p>
                    <p><strong>Soutien Article 38 :</strong> ${vote.supportArticle38 ? 'Oui' : 'Non'}</p>
                    <p><strong>Date :</strong> ${new Date(vote.timestamp).toLocaleString('fr-FR')}</p>
                `;
                votesListDiv.appendChild(voteEntry);
            });
        }
        console.log("Résultats de la pétition chargés avec succès.");
    } catch (error) {
        console.error('Erreur lors du chargement des résultats de la pétition:', error);
        votesListDiv.innerHTML = `<p style="color: #dc3545;">Erreur lors du chargement des résultats: ${error.message}</p>`;
    }
}

/**
 * Configure le formulaire de pétition pour la soumission.
 */
export function setupPetitionForm() { // Exportation nommée
    console.log("setupPetitionForm appelée."); // Debugging log
    const petitionForm = document.getElementById('petitionForm');
    const petitionMessage = document.getElementById('petitionMessage');

    if (!petitionForm || !petitionMessage) {
        console.error('Éléments DOM du formulaire de pétition (petitionForm ou petitionMessage) introuvables. Impossible de configurer le formulaire.');
        return; // Arrêter l'exécution si les éléments ne sont pas là
    }

    petitionForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Empêche le rechargement de la page

        const userName = document.getElementById('userName').value.trim();
        const userEmail = document.getElementById('userEmail').value.trim();
        const userComment = document.getElementById('userComment').value.trim();
        const supportArticle38 = document.getElementById('supportArticle38').checked;
        const timestamp = new Date().toISOString(); // Date et heure actuelles

        if (!userName || !userEmail) {
            petitionMessage.style.color = '#dc3545';
            petitionMessage.textContent = 'Veuillez remplir au moins votre nom/pseudo et votre email.';
            return;
        }

        const data = {
            userName,
            userEmail, // Ajout du champ email
            userComment,
            supportArticle38,
            timestamp
        };

        try {
            const response = await fetch('/api/petition/vote', { // Chemin corrigé
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok) {
                petitionMessage.style.color = '#28a745'; // Vert pour le succès
                petitionMessage.textContent = result.message;
                petitionForm.reset(); // Réinitialise le formulaire
                loadPetitionResults(); // Recharge les résultats pour mettre à jour le compteur
                console.log("Pétition signée avec succès.");
            } else {
                petitionMessage.style.color = '#dc3545'; // Rouge pour l'erreur
                petitionMessage.textContent = `Erreur : ${result.message || 'Une erreur est survenue.'}`;
                console.error("Erreur lors de la signature de la pétition:", result.message);
            }
        } catch (error) {
            console.error('Erreur de soumission de la pétition :', error);
            petitionMessage.style.color = '#dc3545';
            petitionMessage.textContent = 'Une erreur réseau est survenue. Veuillez réessayer.';
        }
    });
}
