// public/js/sectionContent.js

/**
 * Objet contenant le contenu HTML pour chaque section du rapport.
 * Chaque clé correspond à l'ID de la section, et sa valeur est une chaîne HTML.
 */
export const sectionsContent = {
    "introduction": `
        <h2 class="section-title">Introduction : La Catastrophe Annoncée ⚠️</h2>
        <p>
            Bienvenue sur cette plateforme dédiée au <span class="highlight-keyword">Suivi Bioclimatique et aux Témoignages</span> de la <span class="highlight-event">Catastrophe Annoncée</span>. Depuis le <span class="highlight-date">1er mai 2025</span>, nous observons et documentons une série d'événements climatiques et environnementaux anormaux, dont la fréquence et l'intensité soulèvent de sérieuses questions sur les dérèglements en cours.
        </p>
        <p class="alert-text">
            <span class="highlight-date">Alerte : Le 20 juin 2025, à 10h30 CEST,</span> des observations ont révélé des <span class="highlight-event">injections massives d'aérosols stratosphériques (IAS)</span>, potentiellement à base d'<span class="highlight-keyword">iodure d'argent</span>, débutant à <span class="highlight-date">8h00</span>. En l'espace de <span class="highlight-event">2h30</span>, cette couverture atmosphérique s'est propagée de la <span class="highlight-keyword">Bretagne</span> aux régions de <span class="highlight-keyword">Normandie</span>, l'<span class="highlight-keyword">Île-de-France</span>, les <span class="highlight-keyword">Hauts-de-France</span> et le <span class="highlight-keyword">Grand Est</span>, coïncidant avec la <span class="highlight-event">canicule "Henrion 40°C"</span> en cours. Une surveillance continue est maintenue pour évaluer l'évolution de cette situation.
        </p>
        <img src="intro.jpeg" alt="[Image principale du rapport]" class="content-image">
        <p class="image-caption">Image illustrative des phénomènes atmosphériques observés.</p>
        <p>
            Cette initiative vise à collecter et à analyser des données, des observations et des témoignages pour mieux comprendre les phénomènes en cours et alerter sur leurs conséquences. Nous encourageons chacun à partager ses observations et à contribuer à cette base de connaissances collective.
        </p>
    `,
    "chronologie-evenements": `
        <h2 class="section-title">Chronologie des Événements Clés 🗓️</h2>
        <p>
            Cette section détaille les événements marquants et les observations critiques qui ont jalonné la période de suivi, mettant en lumière l'accélération des phénomènes anormaux.
        </p>
        <h3 class="subsection-title">Été 2024 : Premières Observations Alarmantes</h3>
        <ul class="event-list">
            <li>
                <span class="highlight-date">Juillet 2024 :</span> <span class="highlight-event">Activité Aérienne Suspecte et Oiseaux Morts à Colombelles (Normandie)</span>. Observations d'activité aérienne suspecte et formation de nuages artificiels près du rond-point de Lazaro. Des traces biochimiques clairement visibles laissées par les avions ont été photographiées. En fin d'après-midi, des oiseaux morts ont été retrouvés sur le bord de la route, suggérant un lien avec les pulvérisations chimiques. Cet événement met en évidence une récurrence des phénomènes liés à la géo-ingénierie et ses impacts sur la faune.
            </li>
        </ul>
        <h3 class="subsection-title">Mai 2025 : Premiers Signes Inquiétants</h3>
        <ul class="event-list">
            <li>
                <span class="highlight-date">1er Mai 2025 :</span> Début officiel du suivi des anomalies bioclimatiques. Premières observations de <span class="highlight-keyword">nuages persistants non identifiés</span> au-dessus de l'Atlantique.
            </li>
            <li>
                <span class="highlight-date">5-10 Mai 2025 :</span> Augmentation des <span class="highlight-keyword">températures nocturnes</span> et persistance d'une <span class="highlight-keyword">brume sèche</span> inhabituelle dans le sud-ouest de la France.
            </li>
            <li>
                <span class="highlight-date">15 Mai 2025 :</span> Premiers signalements de <span class="highlight-event">pluies acides</span> légères dans les <span class="highlight-keyword">Vosges</span>, affectant la végétation.
            </li>
        </ul>
        <h3 class="subsection-title">Juin 2025 : Accélération et Phénomènes Extrêmes</h3>
        <ul class="event-list">
            <li>
                <span class="highlight-date">3 Juin 2025 :</span> <span class="highlight-event">Orages d'une violence exceptionnelle</span> dans le <span class="highlight-keyword">Var</span>, provoquant des crues torrentielles et des dégâts considérables. (<a href="https://www.tf1info.fr/meteo/video-il-y-a-eu-des-morts-etait-l-apocalypse-les-images-des-crues-torrentielles-dans-le-var-a-la-suite-des-orages-2372054.html" target="_blank" rel="noopener noreferrer">Source TF1 Info</a>)
            </li>
            <li>
                <span class="highlight-date">10 Juin 2025 :</span> Record de température pour un mois de juin à <span class="highlight-keyword">Paris (35°C)</span>, signe d'une canicule précoce.
            </li>
            <li>
                <span class="highlight-date">12 Juin 2025 :</span> <span class="highlight-event">Tornade de forte intensité</span> signalée en <span class="highlight-keyword">Vendée</span>, causant des destructions localisées.
            </li>
            <li>
                <span class="highlight-date">18 Juin 2025 :</span> Multiples cellules orageuses supercellulaires observées en <span class="highlight-keyword">Nouvelle-Aquitaine</span>, avec des grêlons de grande taille.
            </li>
            <li>
                <span class="highlight-date">20 Juin 2025, 8h00 CEST :</span> Début des <span class="highlight-event">injections massives d'aérosols stratosphériques (IAS)</span> (iodure d'argent suspecté) sur la <span class="highlight-keyword">Bretagne</span>.
            </li>
            <li>
                <span class="highlight-date">20 Juin 2025, 10h30 CEST :</span> Extension de la couverture d'IAS à la <span class="highlight-keyword">Normandie</span>, l'<span class="highlight-keyword">Île-de-France</span>, les <span class="highlight-keyword">Hauts-de-France</span> et le <span class="highlight-keyword">Grand Est</span>, coïncidant avec la <span class="highlight-event">canicule "Henrion 40°C"</span>.
            </li>
        </ul>
        <h3 class="subsection-title">Juillet 2025 : Intensification des Phénomènes et Nouveaux Impacts</h3>
        <ul class="event-list">
            <li>
                <span class="highlight-date">1er Juillet 2025 :</span> Des observations d'<span class="highlight-event">activités aériennes intenses et étendues</span> ont été rapportées, coïncidant avec la formation d'<span class="highlight-keyword">arcs-en-ciel de pollution</span> (phénomènes optiques circulaires) dans l'atmosphère. Ces activités sont suspectées d'être associées à des injections atmosphériques.
            </li>
            <li>
                <span class="highlight-date">2 Juillet 2025 (matin) :</span> Une concentration élevée d'événements de <span class="highlight-event">foudre</span> a été enregistrée en <span class="highlight-keyword">Normandie</span>, survenant le lendemain des activités aériennes intenses observées.
            </li>
            <li>
                <span class="highlight-date">4 Juillet 2025 :</span> Une <span class="highlight-event">activitée aérienne soutenue</span> a été documentée (confirmée par l'application FlightRadar) sur une période de 5 heures. Au cours de cette journée, le ciel a évolué d'un état initial <span class="highlight-keyword">laiteux</span> vers une couverture de pollution visible. Des <span class="highlight-keyword">traînées persistantes</span>, interprétées comme des dispersions chimiques, se sont progressivement étendues dans la stratosphère, donnant lieu à la formation d'<span class="highlight-keyword">arcs-en-ciel de pollution</span>.
            </li>
            <li>
                <span class="highlight-date">6-7 Juillet 2025 :</span> <span class="highlight-event">Deux jours de pluies intenses</span> sur plusieurs régions, coïncidant avec un taux d'humidité ambiant artificiellement élevé, suite à des pratiques suspectées de géo-ingénierie (lancement des nuages ou injection d'aérosols stratosphériques).
            </li>
            <li>
                <span class="highlight-date">8 Juillet 2025 :</span> Adoption définitive par le Parlement français de la <span class="highlight-event">"Loi Duplomb"</span>. Cette loi réintroduit des pesticides comme l'acétamipride et modifie la gouvernance de l'eau, augmentant les risques sanitaires et de famine par la prolifération d'insectes et la contamination des cultures.
            </li>
            <li>
                <span class="highlight-date">Du 8 au 13 Juillet 2025 :</span> Période d'<span class="highlight-event">aucune activité aérienne suspecte</span> observée, suivie d'une <span class="highlight-event">prolifération massive d'insectes</span> (larves, bactéries) dans les zones précédemment affectées par les pluies et l'humidité anormale.
            </li>
            <li>
                <span class="highlight-date">14 Juillet 2025 :</span> Mise à jour de l'interface du rapport pour intégrer ces nouvelles observations et analyses.
            </li>
            <li>
                <span class="highlight-date">18 Juillet 2025 (Vendredi) :</span>
                <ul class="event-list" style="margin-left: 20px;">
                    <li><span class="highlight-keyword">Matin :</span> Aucune activité aérienne suspecte observée.</li>
                    <li><span class="highlight-keyword">13h00 - 18h00 :</span> Reprise des <span class="highlight-event">pulvérisations massives</span> (injections d'aérosols stratosphériques), utilisant des composés chimiques tels que le <span class="highlight-keyword">soufre</span>, la <span class="highlight-keyword">calcite</span>, et surtout l'<span class="highlight-keyword">iodure d'argent</span> (favorisant la formation de cristaux de glace et le refroidissement de la température).</li>
                    <li><span class="highlight-event">Conséquences Observées :</span>
                        <ul>
                            <li>Dégradation rapide du climat : passage d'un ciel bleu à un ciel "tout blanc".</li>
                            <li>Activité orageuse intense pendant plus de 3 à 4 heures, avec des éclairs de foudre présentant une trajectoire très linéaire (visible sur photos).</li>
                            <li>Présence de traces chimiques laissées par les avions.</li>
                            <li>Rappel : La géo-ingénierie est gérée par l'armée, non par des climatologues ou scientifiques.</li>
                        </ul>
                    </li>
                    <li><span class="highlight-event">Événements Mondiaux (soir du 17 juillet) :</span> Des tornades et inondations majeures ont été signalées en Chine.</li>
                </ul>
            </li>
            <li>
                <span class="highlight-date">21 Juillet 2025 :</span> <span class="highlight-event">Tornade à Miramas (Bouches-du-Rhône)</span>. Une tornade a été observée dans la commune de Miramas, soulevant des questions sur la récidive des phénomènes météorologiques extrêmes liés aux activités aériennes suspectes et aux injections d'aérosols stratosphériques.
            </li>
            <li>
                <span class="highlight-date">22 Juillet 2025 :</span> <span class="highlight-event">Inondation Éclair dans l'Aisne</span>. Une ville de l'Aisne a été inondée en quelques minutes suite à de fortes précipitations. L'événement a été diffusé sur TF1.
            </li>
            <li>
                <span class="highlight-date">23 Juillet 2025 :</span> <span class="highlight-event">Récidive d'Injections Aériennes Suspectes et Conséquences Bioclimatiques</span>. Observations d'activités récurrentes d'injections d'aérosols stratosphériques (géo-ingénierie) impliquant des avions de type Boeing Dreamliner et des bombardiers américains. Ces opérations seraient gérées par l'armée française sous l'autorité du Chef d'État, en lien avec l'Article 49 alinéa 3 de la Constitution pour la régulation de la température. Conséquences immédiates et anticipées : inondations (prévues pour ce soir, demain et tout le week-end), prolifération d'insectes, et grêlons de forme anormale (ressemblant à des cristaux de glace 'armes'). Le témoin certifie être sûr de ces observations.
            </li>
            <li>
                <span class="highlight-date">28 Juillet 2025 :</span>
                <ul class="event-list" style="margin-left: 20px;">
                    <li><span class="highlight-keyword">14h00 CEST :</span> Premières observations de pulvérisations aériennes suspectes (géo-ingénierie), potentiellement à base de <span class="highlight-keyword">soufre</span> et de <span class="highlight-keyword">calcite</span>, au-dessus de la <span class="highlight-keyword">Normandie</span>.</li>
                    <li><span class="highlight-keyword">Prévision (dans quelques heures) :</span> Attente d'un lancement de "pseudo nuages" à base d'<span class="highlight-keyword">iodure d'argent</span>, basé sur l'expertise et les observations continues.</li>
                    <li><span class="highlight-keyword">Observations continues :</span> Poursuite des observations et prises de photos tout au long de la journée.</li>
                </ul>
            </li>
            <li>
                <span class="highlight-date">29 Juillet 2025 :</span>
                <ul class="event-list" style="margin-left: 20px;">
                    <li><span class="highlight-keyword">Journée entière :</span> Poursuite des pulvérisations aériennes, principalement d'<span class="highlight-keyword">iodure d'argent</span>, entraînant la formation de nuages artificiels et des précipitations.</li>
                    <li><span class="highlight-event">Conséquences Observées :</span> Pluie persistante, baisse notable de la température, et conditions météorologiques très instables (alternance rapide entre ciel bleu et nuages noirs). Observation d'agrégats de cristaux de glace ressemblant à des grêlons, mais de nature chimique.</li>
                    <li><span class="highlight-event">Impact sur la faune :</span> Signalements de plus de <span class="highlight-keyword">8000 oiseaux morts dans le Marais de Brière (Bretagne)</span>, suite à l'inhalation de ces agrégats chimiques.</li>
                </ul>
            </li>
            <li>
                <span class="highlight-date">30 Juillet 2025 :</span>
                <ul class="event-list" style="margin-left: 20px;">
                    <li><span class="highlight-event">Prolifération Anormale de Champignons</span>. Observation inattendue de champignons sur le bord de la route en plein été, documentée par des photos. Cet événement est une nouvelle preuve de la prolifération biologique anormale, potentiellement liée aux dérèglements climatiques et aux conditions d'humidité créées par la géo-ingénierie et les injections d'aérosols stratosphériques.</li>
                    <li><span class="highlight-event">Tsunami Majeur au Kamtchatka (Russie)</span>. Un puissant séisme de magnitude 8.8 a frappé au large de la péninsule du Kamtchatka, déclenchant un tsunami majeur avec des vagues de plusieurs mètres, causant des dégâts et des blessures. Cet événement souligne l'instabilité géologique et les conséquences potentiellement amplifiées des dérèglements climatiques globaux.</li>
                </ul>
            </li>
        </ul>
        <h3 class="subsection-title">Observations Continues :</h3>
        <ul class="event-list">
            <li>
                <span class="highlight-keyword">Persistance de nuages artificiels :</span> Maintien d'une couverture nuageuse d'apparence non naturelle, affectant la luminosité et la perception du ciel.
            </li>
            <li>
                <span class="highlight-keyword">Anomalies de précipitations :</span> Alternance de périodes de sécheresse intense et d'épisodes de pluies diluviennes, souvent localisés.
            </li>
            <li>
                <span class="highlight-keyword">Dégradation de la qualité de l'air :</span> Signalements accrus de problèmes respiratoires et d'irritations oculaires, potentiellement liés aux aérosols atmosphériques.
            </li>
        </ul>
    `,
    "preuves-visuelles": `
        <h2 class="section-title">Preuves Visuelles : Galerie d'Observations 📸</h2>
        <p>
            Explorez cette collection de photos et vidéos documentant les phénomènes atmosphériques anormaux et les preuves de géo-ingénierie. Cliquez sur une image pour l'agrandir et voir sa description.
        </p>
        <div id="galleryContainer" class="gallery-grid">
            <!-- Les images et vidéos seront chargées ici par JavaScript (via gallery.js) -->
            <p>Chargement de la galerie...</p>
        </div>
    `,
    "impact-nuages": `
        <h2 class="section-title">Impact sur les Nuages et le Cycle de l'Eau 💧☁️</h2>
        <p>
            L'un des aspects les plus préoccupants des observations récentes concerne l'altération visible des formations nuageuses et son impact potentiel sur le cycle hydrologique.
        </p>
        <h3 class="subsection-title">Modifications des Formations Nuageuses :</h3>
        <ul class="event-list">
            <li>
                <span class="highlight-keyword">Cirrus persistants :</span> Observation fréquente de traînées de condensation qui s'étalent et persistent pendant des heures, formant des voiles opaques à haute altitude. Ces formations sont différentes des cirrus naturels.
            </li>
            <li>
                <span class="highlight-keyword">Voiles atmosphériques :</span> Le ciel est souvent recouvert d'un voile laiteux, réduisant l'intensité du rayonnement solaire direct et modifiant la couleur du ciel.
            </li>
            <li>
                <span class="highlight-keyword">Arcs-en-ciel de pollution :</span> Apparition d'arcs-en-ciel complets ou partiels avec des couleurs inhabituelles ou une structure diffuse, souvent associés à la présence de particules dans l'air.
            </li>
            <li>
                <span class="highlight-keyword">Absence de cumulus :</span> Dans certaines régions et périodes, une diminution notable des nuages de type cumulus est observée, remplacés par des formations plus diffuses et stratifiées.
            </li>
        </ul>
        <h3 class="subsection-title">Conséquences sur le Cycle de l'Eau :</h3>
        <ul class="event-list">
            <li>
                <span class="highlight-event">Sécheresses localisées :</span> Malgré la présence de nuages, les précipitations sont parfois insuffisantes ou mal réparties, entraînant des épisodes de sécheresse.
            </li>
            <li>
                <span class="highlight-event">Pluies intenses et orages violents :</span> À l'inverse, lorsque les précipitations se produisent, elles sont souvent sous forme d'averses très intenses et localisées, exacerbant les risques d'inondations.
            </li>
            <li>
                <span class="highlight-keyword">Modification des températures :</span> Les voiles nuageux peuvent piéger la chaleur la nuit (effet de serre additionnel) et réduire l'ensoleillement le jour, influençant les températures au sol de manière imprévisible.
            </li>
            <li>
                <span class="highlight-event">Phénomènes de foudre accrus :</span> Des éclairs de foudre intense sans les orages classiques sont observés, potentiellement liés à des déséquilibres ioniques dans l'atmosphère.
            </li>
        </ul>
        <p>
            Ces modifications du cycle de l'eau ont des répercussions directes sur l'agriculture, les écosystèmes et la disponibilité des ressources hydriques.
        </p>
    `,
    "methodes-suspectees": `
        <h2 class="section-title">Méthodes Suspectées de Géo-ingénierie 🧪✈️</h2>
        <p>
            Face à l'ampleur et à la nature des phénomènes observés, l'hypothèse de programmes de géo-ingénierie non déclarés devient de plus en plus pertinente. Plusieurs méthodes sont suspectées d'être employées.
        </p>
        <h3 class="subsection-title">Les Méthodes Suspectées et Leurs Conséquences 🌫️🚀</h3>
        <p class="mb-4">
            Les observations récentes, notamment la récidive des événements, alimentent les craintes quant à l'utilisation de <span class="highlight-event">méthodes de géo-ingénierie</span> pour réguler la température, dont les impacts sont loin d'être maîtrisés. Ces approches, souvent discutées dans le cadre de la lutte contre le <span class="highlight-keyword">dérèglement climatique d'origine anthropique</span>, peuvent être envisagées en réponse à des cadres politiques comme les <span class="highlight-keyword">Accords de Paris</span> ou des initiatives nationales comme le <span class="highlight-keyword">projet de loi Macron de 2017 sur le climat</span>, qui visent à maîtriser l'effet de serre provoqué par l'homme. Cependant, leurs implications biochimiques et environnementales soulèvent de sérieuses questions.
        </p>
        <h3 class="subsection-title">Substances Potentiellement Dangereuses et leurs impacts biochimiques</h3>
        <p>
            Diverses substances sont suspectées d'être utilisées dans les opérations de géo-ingénierie, chacune présentant des risques distincts et cumulatifs pour la santé humaine et l'environnement.
        </p>
        <ul class="event-list">
            <li>
                <h4 class="subsection-title" style="font-size: 1.2em; margin-top: 10px; margin-bottom: 5px;">Toxicité et Bioaccumulation :</h4>
                <ul class="event-list" style="margin-left: 20px;">
                    <li><span class="highlight-keyword">Retombées au sol :</span> Les aérosols finiraient par retomber au sol et dans les océans, contaminant l'eau potable, les sols agricoles et les écosystèmes.</li>
                    <li><span class="highlight-keyword">Chaîne alimentaire :</span> Bioaccumulation le long de la chaîne alimentaire, exposant les humains via l'ingestion d'aliments contaminés (riz, poissons, crustacés, légumes comme salades, fraises, framboises).</li>
                    <li><span class="highlight-keyword">Voies d'exposition :</span> Inhalation, ingestion, contact cutané.</li>
                </ul>
                <h4 class="subsection-title" style="font-size: 1.2em; margin-top: 10px; margin-bottom: 5px;">Effets sur la Santé Humaine :</h4>
                <ul class="event-list" style="margin-left: 20px;">
                    <li><span class="highlight-event">Cancers :</span> Poumon, vessie, peau (kératoses et hyperpigmentation), reins, foie.</li>
                    <li><span class="highlight-event">Neuropathies :</span> Picotements, engourdissements, douleurs, faiblesse musculaire, troubles cognitifs.</li>
                    <li><span class="highlight-event">Cardiovasculaires :</span> Hypertension, maladies coronariennes, "pieds noirs".</li>
                    <li><span class="highlight-event">Organes vitaux :</span> Dommages hépatiques et rénaux.</li>
                    <li><span class="highlight-event">Reproduction :</span> Effets tératogènes, avortements spontanés, problèmes de fertilité.</li>
                    <li><span class="highlight-event">Immunité :</span> Dépression immunitaire, vulnérabilité aux infections.</li>
                </ul>
                <h4 class="subsection-title" style="font-size: 1.2em; margin-top: 10px; margin-bottom: 5px;">Effets sur la Faune et la Flore :</h4>
                <ul class="event-list" style="margin-left: 20px;">
                    <li><span class="highlight-event">Faune :</span> Toxicité directe, bioaccumulation dans les tissus (affectant les prédateurs), perturbation des écosystèmes, blocage de la reproduction chez les espèces aquatiques.</li>
                    <li><span class="highlight-event">Flore :</span> Phytotoxicité (inhibition de croissance, photosynthèse, rendements), contamination des sols les rendant impropres à l'agriculture.</li>
                </ul>
                <h4 class="subsection-title" style="font-size: 1.2em; margin-top: 10px; margin-bottom: 5px;">Impacts Climatiques et Environnementaux :</h4>
                <ul class="event-list" style="margin-left: 20px;">
                    <li><span class="highlight-keyword">Refroidissement :</span> Potentiel effet réfléchissant des sulfures d'arsenic, contribuant à masquer le réchauffement.</li>
                    <li><span class="highlight-event">Précipitations :</span> Perturbation des régimes, entraînant sécheresses ou inondations imprévisibles.</li>
                    <li><span class="highlight-event">Couche d'ozone :</span> Effets complexes et imprévisibles sur sa chimie.</li>
                    <li><span class="highlight-event">Pluies acides :</span> Formation d'acides (sulfurique, arsénieux) acidifiant sols et eaux.</li>
                    <li><span class="highlight-event">Conséquences à long terme :</span> Non-solution au problème de fond, effets régionaux asymétriques, changements de couleur du ciel.</li>
                </ul>
            </li>
            <li>
                <span class="highlight-event">Soufre (sulfate de silicium)</span> ☢️ :
                <p class="ml-6">Souvent étudié pour l'injection stratosphérique, le soufre (sous forme d'aérosols de sulfate) est censé réfléchir la lumière solaire. <strong class="text-red-600">Risques :</strong> Les nanoparticules peuvent être nocives pour la santé respiratoire. Elles acidifient les sols et les eaux, nuisant à la biodiversité et aux cycles biogéochimiques essentiels. L'impact sur la formation de nuages et les précipitations reste incertain.</p>
            </li>
            <li>
                <span class="highlight-event">Iodure d'argent (AgI)</span> 💊⚠️ :
                <p class="ml-6">Utilisé dans l'ensemencement des nuages ("cloud seeding") pour provoquer des précipitations. <strong class="text-red-600">Risques :</strong> Bien que les quantités soient faibles, l'argent est toxique, en particulier pour les espèces aquatiques (perturbation de la reproduction). Des études suggèrent un assèchement précoce des feuilles de certains arbres. L'ensemencement pourrait également déplacer les précipitations, créant des déséquilibres régionaux. <span class="font-bold text-red-700">De plus, l'iodure d'argent favorise la formation de grêlons, dont la structure cristalline à base d'argent les rend plus denses et dangereux que la grêle normale, aggravant les dégâts matériels et les risques pour la vie.</span></p>
            </li>
            <li>
                <span class="highlight-event">Calcite (carbonate de calcium)</span> 🪨 :
                <p class="ml-6">Naturellement présente, la calcite est également envisagée pour l'injection stratosphérique pour ses propriétés réfléchissantes. <strong class="text-red-600">Risques :</strong> Moins préoccupante en termes de toxicité directe, toute introduction massive de matière dans l'atmosphère peut modifier l'équilibre des écosystèmes, comporter des traces de contaminants et impacter les réactions atmosphériques.</p>
            </li>
            <li>
                <span class="highlight-event">Sulfure d'Arsenic</span> ☢️☣️ :
                <p class="ml-6">L'arsenic est un toxique systémique et un cancérigène avéré. Sa présence dans la stratosphère, même sous forme de sulfures, aurait des conséquences dévastatrices à long terme :</p>
            </li>
        </ul>
        <p class="mt-4 alert-text">
            <span class="font-bold">Aggravation des Risques :</span> L'utilisation combinée de ces substances, en particulier l'ajout de **sulfure d'arsenic** aux pratiques existantes, amplifie exponentiellement les dangers. Une intervention qui chercherait à la fois à refroidir l'atmosphère et à manipuler les précipitations (par exemple, en créant des grêlons ou de la neige contaminés par l'arsenic) serait une forme très efficace de dissémination d'un poison systémique à l'échelle planétaire, avec des conséquences imprévisibles et potentiellement catastrophiques pour tous les écosystèmes et la vie sur Terre.
            <br><br>
            <span class="font-bold text-red-700">Le dérèglement climatique, combiné aux injections stratosphériques qui créent un 'yo-yo' thermique (alternance rapide de chaud et de froid) et augmentent l'humidité, favorise un environnement idéal pour la prolifération des champignons, des bactéries et surtout des insectes. La présence d'un 'plafond toxique' à basse altitude, résultant de l'augmentation de la pression atmosphérique due aux aérosols (principalement argent et calcite), piège cette humidité et ces agents biologiques, créant un cercle vicieux de risques sanitaires et environnementaux.</span>
        </p>
    `,
    "reglementation-geoingenierie": `
 <h2 class="section-title">Accords de Paris et Réglementation de la Géo-ingénierie ⚖️📜</h2>
        <p>
            Le cadre juridique international et les accords climatiques existants peinent à encadrer les pratiques de géo-ingénierie, laissant un vide réglementaire potentiellement dangereux.
        </p>
        <h3 class="subsection-title">Les Accords de Paris (2015) :</h3>
        <ul class="event-list">
            <li>
                <span class="highlight-keyword">Objectif Principal :</span> Maintenir l'augmentation de la température mondiale bien en dessous de 2°C par rapport aux niveaux préindustriels, et si possible la limiter à 1,5°C.
            </li>
            <li>
                <span class="highlight-keyword">Approche :</span> Basée sur les Contributions Déterminées au niveau National (NDC), laissant chaque pays définir ses propres objectifs et moyens.
            </li>
            <li>
                <span class="highlight-event">Manque de Réglementation Spécifique :</span> Les Accords de Paris ne mentionnent pas explicitement la géo-ingénierie. Cela crée une zone grise où les États pourraient être tentés d'explorer ces technologies sans cadre légal clair ni surveillance internationale.
            </li>
        </ul>
        <h4 class="subsection-title">Abrogation de "l'Accord de Paris" par Donald Trump</h4>
        <p class="ml-6">
            Donald Trump a décidé de retirer les États-Unis de l'Accord de Paris à deux reprises. La première fois, en 2017, il a annoncé la sortie du pays du pacte international visant à limiter le réchauffement climatique à moins de 2°C, avec des efforts pour rester en dessous de 1,5°C. Cette décision a été effective après un processus de retrait qui a duré près de quatre ans. La seconde fois, en 2025, Trump a de nouveau signé un ordre pour entamer le processus de retrait, déclarant que l’accord était une "escroquerie" imposant des charges injustes à l’économie américaine, tout en affirmant vouloir renforcer la production de combustibles fossiles et réduire les réglementations environnementales.
            Ce retrait a été effectué rapidement, sans respecter la période de préavis d’un an prévue par l’accord, ce qui a suscité de vives critiques au niveau international. La décision de Trump a été perçue comme un recul pour les efforts mondiaux de lutte contre le changement climatique, en particulier étant donné que les États-Unis sont le deuxième plus grand émetteur mondial de gaz à effet de serre.
        </p>
        <h3 class="subsection-title">Le Protocole de Kyoto (1997) :</h3>
        <ul class="event-list">
            <li>
                <span class="highlight-keyword">Objectif :</span> Réduire les émissions de gaz à effet de serre des pays développés.
            </li>
            <li>
                <span class="highlight-event">Différence avec Paris :</span> Plus contraignant sur les objectifs d'émissions, mais n'a pas non plus abordé la géo-ingénierie, car le concept était moins mature à l'époque.
            </li>
        </ul>
        <h3 class="subsection-title">Le Débat sur la Réglementation :</h3>
        <ul class="event-list">
            <li>
                <span class="highlight-keyword">Vide Juridique :</span> L'absence de régulation claire au niveau international pour la géo-ingénierie est une préoccupation majeure. Qui décide ? Qui est responsable en cas d'effets secondaires imprévus ?
            </li>
            <li>
                <span class="highlight-keyword">Techniques Spécifiques :</span>
                <ul>
                    <li>
                        <span class="highlight-keyword">Injection d'Aérosols Stratosphériques (IAS) :</span> Implique l'injection de particules (soufre, carbonate de calcium, iodure d'argent, sulfure d'arsenic) dans la stratosphère pour réfléchir la lumière solaire. Les risques incluent la perturbation des régimes de précipitations, l'appauvrissement de la couche d'ozone et des effets imprévus sur les écosystèmes.
                        <span class="font-bold text-red-700">Note : Ces injections, particulièrement celles d'iodure d'argent, peuvent induire la formation de grêlons plus denses et dangereux, et contribuer à des variations de pression atmosphérique créant un 'plafond' toxique à basse altitude, favorisant l'humidité et la prolifération biologique.</span>
                    </li>
                    <li>
                        <span class="highlight-keyword">Ensemencement des Nuages (Cloud Seeding) :</span> Consiste à introduire des substances (comme l'iodure d'argent) dans les nuages pour modifier les précipitations. Bien que pratiquée localement depuis des décennies, son application à grande échelle et ses impacts à long terme sont mal compris et peu réglementés.
                    </li>
                </ul>
            </li>
            <li>
                <span class="highlight-event">Appel à la Gouvernance :</span> De nombreux scientifiques et organisations appellent à un moratoire ou à un cadre de gouvernance international strict pour toute expérimentation de géo-ingénierie à grande échelle.
            </li>
        </ul>
        <p>
            La transparence et une gouvernance internationale robuste sont essentielles pour prévenir des conséquences irréversibles et garantir que toute intervention sur le climat soit menée dans l'intérêt de tous.
        </p>
    `,
    "observations-discrepances": `
        <h2 class="section-title">Observations et Discrépances : Le Ciel Nous Parle 🧐</h2>
        <p>
            Au-delà des événements extrêmes, des anomalies subtiles mais persistantes sont observées dans le ciel et l'atmosphère, soulevant des questions sur des manipulations à long terme. Cette section présente également une carte interactive pour visualiser les événements géolocalisés.
        </p>
        <h3 class="subsection-title">Carte des Événements Géolocalisés :</h3>
        <p>
            Visualisez sur la carte les événements notables tels que les tornades, ouragans, inondations, et retombées de grêlons géants, avec un suivi chronologique.
        </p>
        <div id="mapid" style="height: 600px; width: 100%; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);"></div>
        <div id="events-list" style="margin-top: 20px;">
            <h4>Liste des événements observés :</h4>
            <ul id="observedEventsList" class="event-list">
                <!-- Les événements géolocalisés seront listés ici par map.js -->
            </ul>
        </div>
        <h3 class="subsection-title">Changements dans l'Apparence du Ciel :</h3>
        <ul class="event-list">
            <li>
                <span class="highlight-keyword">Ciel laiteux ou "blanc" :</span> Fréquence accrue d'un ciel qui n'est plus d'un bleu profond mais d'un blanc laiteux, même par temps clair. Cela est souvent associé à la présence de fines particules en suspension.
            </li>
            <li>
                <span class="highlight-keyword">Halo solaires et lunaires :</span> Augmentation des observations de halos autour du soleil ou de la lune, indiquant la présence de cristaux de glace ou de particules dans l'atmosphère.
            </li>
            <li>
                <span class="highlight-keyword">Disparition des couleurs du coucher de soleil :</span> Les couchers de soleil semblent moins vifs, les couleurs étant atténuées ou absentes, un effet qui peut être causé par la diffusion de la lumière par des aérosols.
            </li>
            <li>
                <span class="highlight-keyword">Arcs-en-ciel de pollution :</span> Apparition d'arcs-en-ciel anormaux, parfois circulaires, avec des couleurs ternes ou des spectres incomplets, distincts des arcs-en-ciel naturels.
            </li>
        </ul>
        <h3 class="subsection-title">Discrépances Météorologiques :</h3>
        <ul class="event-list">
            <li>
                <span class="highlight-event">Prévisions erronées :</span> Les modèles météorologiques peinent de plus en plus à prévoir avec précision les précipitations et les températures, suggérant des facteurs non pris en compte.
            </li>
            <li>
                <span class="highlight-event">Refroidissement inattendu après chaleur :</span> Des baisses de température soudaines et localisées sont observées après des pics de chaleur, parfois accompagnées de formations nuageuses rapides.
            </li>
            <li>
                <span class="highlight-event">Anomalies de pression atmosphérique :</span> Des variations de pression inhabituelles sont enregistrées, pouvant influencer la dynamique des masses d'air.
            </li>
            <li>
                <span class="highlight-event">Foudre isolée et intense :</span> Des éclairs de foudre intense sans les orages classiques sont observés, potentiellement liés à des déséquilibres électriques atmosphériques.
            </li>
        </ul>
        <p>
            Ces discrépances, bien que parfois subtiles, s'accumulent et pointent vers une possible altération délibérée ou involontaire de notre atmosphère.
        </p>
    `,
    "risques": `
        <h2 class="section-title">Risques : Conséquences Potentielles et Inconnues 😷🌳⚠️</h2>
        <p>
            Les phénomènes bioclimatiques anormaux et les possibles activités de géo-ingénierie, qu'elles soient avouées ou non, présentent une multitude de risques pour la santé humaine, l'environnement et la stabilité sociétale.
        </p>
        <h3 class="subsection-title">Risques Sanitaires :</h3>
        <ul class="event-list">
            <li>
                <span class="highlight-event">Problèmes respiratoires accrus :</span> L'inhalation prolongée de particules fines (issues d'aérosols ou de pollution amplifiée), notamment des métaux lourds comme l'arsenic, peut exacerber l'asthme, les bronchites, et provoquer des affections pulmonaires chroniques, des cancers (poumon, vessie, peau, reins, foie), des neuropathies, et des maladies cardiovasculaires.
            </li>
            <li>
                <span class="highlight-event">Irritations et allergies :</span> Des substances chimiques ou des métaux lourds dispersés dans l'atmosphère peuvent causer des irritations oculaires, cutanées, et déclencher des réactions allergiques.
            </li>
            <li>
                <span class="highlight-event">Impacts neurologiques et systémiques :</span> L'exposition à certains composés (ex: aluminium, baryum, strontium, et surtout l'arsenic) peut avoir des effets à long terme sur le système nerveux central (picotements, engourdissements, troubles cognitifs) et d'autres fonctions corporelles (problèmes hépatiques et rénaux, dépression immunitaire).
            </li>
            <li>
                <span class="highlight-event">Troubles du développement et de la reproduction :</span> L'arsenic est associé à des effets tératogènes (malformations), des avortements spontanés et des problèmes de fertilité.
            </li>
            <li>
                <span class="highlight-event">Stress psychologique :</span> L'incertitude climatique, la perception de manipulations non transparentes et la dégradation de l'environnement génèrent un stress, de l'anxiété et des troubles du sommeil au sein de la population.
            </li>
        </ul>
        <h3 class="subsection-title">Risques FAMINE et Prolifération Biologique :</h3>
        <ul class="event-list">
            <li>
                <span class="highlight-event">Contamination de la chaîne alimentaire, intoxication et famine :</span> Les retombées de produits chimiques issus de la géo-ingénierie (comme l'iodure d'argent, la calcite, le soufre, l'arsenic) et l'usage à outrance de pesticides (fongicides, insecticides, herbicides, et les nouveaux introduits par décret comme l'acétamipride, le sulfoxaflor et le flupyradifuron) depuis des années, aggravé par la "Loi Duplomb", contaminent les sols agricoles et les sources d'eau. L'arsenic, par exemple, serait absorbé par les plantes (ex: salade) et les animaux d'élevage, bioaccumulant le long de la chaîne alimentaire. Cela rendrait les cultures impropres à la consommation, menaçant la sécurité alimentaire et pouvant potentiellement entraîner des famines et des intoxications alimentaires massives.
            </li>
            <li>
                <span class="highlight-event">Prolifération des champignons, bactéries et insectes :</span> Les dérèglements climatiques induits par la géo-ingénierie, caractérisés par un "yo-yo" thermique (alternance rapide de chaud et de froid) et une augmentation significative du taux d'humidité, créent un environnement idéal pour le développement rapide et la multiplication des champignons, des bactéries et des insectes. La présence d'un "plafond toxique" à basse altitude, résultant de l'augmentation de la pression atmosphérique due aux aérosols (principalement argent et calcite), piège cette humidité et ces agents biologiques, créant un cercle vicieux de risques sanitaires et environnementaux. Les grêlons à base de cristaux d'argent, plus solides et dangereux, contribuent également à la dissémination de ces substances toxiques. De plus, le plafond stratosphérique formé par l'iodure d'argent, la calcite et le soufre, empêche les plantes de se nourrir correctement des rayons du soleil (sodium, magnésium essentiels à la photosynthèse), entravant leur croissance et augmentant le risque de famine. <span class="font-bold text-red-700">L'apparition inattendue de champignons en plein été est une illustration concrète de cette prolifération biologique anormale, favorisée par les conditions environnementales modifiées.</span>
            </li>
        </ul>
        <h3 class="subsection-title">Risques Environnementaux :</h3>
        <ul class="event-list">
            <li>
                <span class="highlight-event">Perturbation du cycle de l'eau :</span> La modification des formations nuageuses et des régimes de précipitations peut entraîner des sécheresses prolongées dans certaines régions et des inondations extrêmes dans d'autres, affectant l'agriculture et la disponibilité de l'eau potable. Ces phénomènes peuvent aussi exacerber les risques d'ouragans et de foudre à basse altitude due à des déséquilibres atmosphériques.
            </li>
            <li>
                <span class="highlight-event">Acidification des sols et des eaux :</span> Les pluies chargées de particules ou de substances chimiques (notamment le soufre et l'arsenic) peuvent modifier le pH des sols et des plans d'eau, nuisant gravement à la flore, à la faune aquatique et à la qualité des récoltes.
            </li>
            <li>
                <span class="highlight-event">Impact sur la biodiversité :</span> Les changements rapides et imprévisibles des conditions climatiques et la toxicité directe des substances chimiques menacent la survie des espèces végétales et animales. L'arsenic est très toxique pour les organismes aquatiques, bloquant leur reproduction et perturbant les écosystèmes marins. Cela entraîne une perte accélérée de biodiversité.
            </li>
            <li>
                <span class="highlight-event">Altération des écosystèmes :</span> La modification de la lumière solaire, des températures et des précipitations, combinée à la contamination chimique, peut déséquilibrer des écosystèmes entiers, avec des conséquences imprévisibles sur les chaînes alimentaires et les services écosystémiques. Cela inclut l'augmentation du risque d'incendies dans les zones asséchées et l'aggravation des inondations.
            </li>
        </ul>
        <h3 class="subsection-title">Risques Sociétaux et Géopolitiques :</h3>
        <ul class="event-list">
            <li>
                <span class="highlight-event">Crises alimentaires et hydriques :</span> Les perturbations agricoles et hydrologiques, aggravées par la contamination, peuvent entraîner des pénuries, des famines et des déplacements de populations à grande échelle.
            </li>
            <li>
                <span class="highlight-event">Conflits internationaux :</span> L'expérimentation unilatérale de la géo-ingénierie par un pays pourrait avoir des effets transfrontaliers négatifs (sécheresses chez les voisins, contamination partagée), menant à des tensions et des conflits.
            </li>
            <li>
                <span class="highlight-event">Perte de confiance :</span> Le manque de transparence et la dissimulation d'activités climatiques peuvent éroder la confiance du public envers les gouvernements et les institutions scientifiques.
            </li>
            <li>
                <span class="highlight-event">Conséquences économiques :</span> Les catastrophes naturelles amplifiées et les impacts sur l'agriculture, la santé et la biodiversité peuvent entraîner des coûts économiques massifs et déstabiliser les marchés mondiaux.
            </li>
        </ul>
        <p>
            Il est impératif d'évaluer l'ensemble de ces risques de manière exhaustive et indépendante pour prendre des mesures de protection adéquates et exiger la fin de toute activité nocive non consensuelle.
        </p>
    `,
    "demonstration": `
        <h2 class="section-title">Démonstration : Visualisation des Anomalies en Temps Réel 📡📊</h2>
        <p>
            Cette section est dédiée à la visualisation dynamique des données collectées, offrant un aperçu en temps réel des phénomènes aériens et météorologiques anormaux, ainsi que des anomalies détectées par nos systèmes.
        </p>
        <h3 class="subsection-title">Observation du 28 au 30 Juillet 2025 : De l'Azur aux Précipitations Artificielles Récidivantes et Prolifération Biologique</h3>
        <p>
            En début de matinée du 28 juillet, le ciel était d'un bleu immaculé. Vers 14h00 CEST, des observations ont révélé des <span class="highlight-event">pulvérisations aériennes suspectes</span>, indiquant des injections d'aérosols stratosphériques, principalement à base de <span class="highlight-keyword">soufre</span> et de <span class="highlight-keyword">calcite</span>. Ces opérations ont été suivies, le 29 juillet, par la pulvérisation d'<span class="highlight-keyword">iodure d'argent</span>. Ces composés chimiques, issus de ces injections, provoquent la cristallisation de la vapeur d'eau, menant à des précipitations artificielles et à la formation de <span class="highlight-event">cristaux de glace agrégés</span> (ressemblant à des grêlons, mais de nature chimique). Le résultat est une météo très instable, alternant rapidement entre ciel bleu et nuages noirs, avec des pluies récurrentes et une baisse de température significative. Ces observations sont étayées par des <span class="highlight-keyword">preuves photographiques</span>.
            <br><br>
            Aujourd'hui, 30 juillet, l'observation inattendue de <span class="highlight-event">champignons sur le bord de la route en plein été</span> renforce les préoccupations concernant la prolifération biologique anormale, directement liée aux conditions environnementales modifiées par la géo-ingénierie.
            <br><br>
            Ces événements locaux s'inscrivent dans un contexte mondial d'intensification des catastrophes, comme en témoigne le <span class="highlight-event">tsunami majeur qui a frappé la péninsule du Kamtchatka</span> le 30 juillet, suite à un puissant séisme.
        </p>
        <h3 class="subsection-title">Flux Aérien (FlightRadar24-like) :</h3>
        <p>
            Intégration d'une carte interactive affichant les données de trafic aérien et les trajectoires suspectes.
        </p>
        <div class="demo-placeholder" style="height: 400px; background-color: #e8f5e9; border-radius: 10px; display: flex; justify-content: center; align-items: center; color: #4caf50; font-weight: bold;">
            
        </div>
        <p class="image-caption">Visualisation des trajectoires aériennes et des zones d'intérêt.</p>

        <h3 class="subsection-title">Données Météorologiques (WxCharts-like) :</h3>
        <p>
            Affichage de cartes météorologiques avec des superpositions d'anomalies (températures, précipitations, pressions atmosphériques, foudre).
        </p>
        <div class="demo-placeholder" style="height: 400px; background-color: #e3f2fd; border-radius: 10px; display: flex; justify-content: center; align-items: center; color: #2196f3; font-weight: bold;">
            
        </div>
        <p class="image-caption">Analyse des conditions météorologiques et détection des écarts par rapport aux normales.</p>

        <h3 class="subsection-title">Analyse Satellitaire (Open Source Galileo/EESA OSINT) :</h3>
        <p>
            Visualisation des données brutes et traitées issues des requêtes aux satellites Galileo et autres sources OSINT, pour identifier les signatures d'aérosols, les modifications nuageuses et les anomalies électromagnétiques.
        </p>
        <div class="demo-placeholder" style="height: 400px; background-color: #fbe9e7; border-radius: 10px; display: flex; justify-content: center; align-items: center; color: #ff5722; font-weight: bold;">
            
        </div>
        <p class="image-caption">Interprétation des données satellitaires pour révéler les activités atmosphériques. Cette section sera alimentée par des données en temps quasi-réel dès que les flux seront établis.</p>
        <p>
            Cette section est conçue pour évoluer et intégrer des visualisations interactives en direct, fournissant des preuves tangibles et des analyses approfondies des phénomènes en cours.
        </p>
    `,
    "roles-overview": `
        <h2 class="section-title">Rôles & Missions : Agir sous Différents Angles 🧑‍💻</h2>
        <p>
            Face à la complexité de la crise bioclimatique et de la géo-ingénierie, différentes expertises sont nécessaires pour révéler la vérité et agir efficacement. Découvrez les missions de chaque rôle et accédez à leurs outils spécifiques.
        </p>
        <div class="roles-grid">
            <div class="role-card">
                <h3><i class="fas fa-microphone-alt"></i> Journaliste</h3>
                <p>
                    Mission : **Diffuser l'information vérifiée** sur la crise bioclimatique et les pratiques de géo-ingénierie dans les médias, afin de sensibiliser le public et d'interpeller les décideurs.
                </p>
                <a href="journalist.html" class="btn-secondary">Accéder aux Outils du Journaliste</a>
            </div>
            <div class="role-card">
                <h3><i class="fas fa-search"></i> Enquêteur</h3>
                <p>
                    Mission : **Collecter des informations** sur les événements actuels et passés, notamment les observations globales sur la géo-ingénierie, pour élaborer des dossiers complets.
                </p>
                <a href="investigator.html" class="btn-secondary">Accéder aux Outils de l'Enquêteur</a>
            </div>
            <div class="role-card">
                <h3><i class="fas fa-flask"></i> Scientifique</h3>
                <p>
                    Mission : **Offrir une expertise technique précise** concernant les pesticides et la géo-ingénierie, en développant des démonstrations et des analyses chimiques.
                </p>
                <a href="scientist.html" class="btn-secondary">Accéder aux Outils du Scientifique</a>
            </div>
            <div class="role-card">
                <h3><i class="fas fa-bullhorn"></i> Lanceur d'alerte</h3>
                <p>
                    Mission : **Rédiger des chroniques politiques** percutantes sur le sujet, révélant les enjeux de pouvoir et appelant à la transparence et à la responsabilité.
                </p>
                <a href="whistleblower.html" class="btn-secondary">Accéder aux Outils du Lanceur d'alerte</a>
            </div>
        </div>
    `,
    "appel-action": `
        <h2 class="section-title">Appel à l'Action : Agir Ensemble pour Notre Avenir ✊📢</h2>
        <p>
            Face à l'urgence de la situation et à la gravité des enjeux, un appel à l'action immédiate et coordonnée est lancé. Nous devons tous nous mobiliser pour exiger la vérité et protéger notre environnement.
        </p>
        <h3 class="subsection-title">Exigez la Transparence :</h3>
        <ul class="event-list">
            <li>
                <span class="highlight-keyword">Pétition Nationale :</span> Signez et partagez notre pétition pour demander une enquête parlementaire sur les activités de géo-ingénierie et leurs impacts.
                <button id="goToPetitionBtn" class="btn-primary">Signer la Pétition</button>
            </li>
            <li>
                <span class="highlight-keyword">Demandes aux Autorités :</span> Exigeons des gouvernements des explications claires et des mesures immédiates pour cesser toute manipulation climatique non consensuelle.
            </li>
        </ul>
        <h3 class="subsection-title">Informez-vous et Sensibilisez :</h3>
        <ul class="event-list">
            <li>
                <span class="highlight-keyword">Partagez ce Rapport :</span> Diffusez largement les informations contenues dans ce rapport pour sensibiliser votre entourage et le grand public.
            </li>
            <li>
                <span class="highlight-keyword">Documentez vos Observations :</span> Continuez à collecter des preuves visuelles et des témoignages. Chaque observation compte.
            </li>
            <li>
                <span class="highlight-keyword">Rejoignez les Mouvements Citoyens :</span> Connectez-on avec les associations et les collectifs qui œuvrent pour la protection de l'environnement et la dénonciation des manipulations climatiques.
            </li>
        </ul>
        <h3 class="subsection-title">Soutenez la Recherche Indépendante :</h3>
        <ul class="event-list">
            <li>
                <span class="highlight-keyword">Financement Participatif :</span> Contribuez aux initiatives de recherche indépendante qui cherchent à analyser les échantillons atmosphériques et à modéliser les impacts des aérosols.
            </li>
            <li>
                <span class="highlight-keyword">Veille Scientifique :</span> Restez informé des dernières publications et découvertes sur la géo-ingénierie et ses conséquences.
            </li>
        </ul>
        <p>
            Notre avenir collectif dépend de notre capacité à nous unir, à nous informer et à agir. Chaque geste compte.
        </p>
    `,
    "petition-form": `
        <h2 class="section-title">Signer la Pétition Nationale ✍️</h2>
        <p>
            Nous appelons les citoyens à s'unir pour dénoncer les pratiques de géo-ingénierie et les risques sanitaires et environnementaux associés. Cette votation citoyenne vise à demander une ratification par ordonnance (via l'article 38 de la Constitution) pour une proposition de loi. C'est cette ratification qui permettra, par la suite, d'envisager une réforme du Protocole de Kyoto et de privilégier des solutions climatiques transparentes et non invasives, en abordant enfin la question de la causalité environnementale.
            Les observations récentes d'activités aériennes intenses et les catastrophes qui en découlent (comme les orages meurtriers et inondations à Paris le 25 juin 2025) soulignent l'urgence d'une telle action. Il est temps de donner notre avis et d'exiger des comptes.
        </p>
        <p>
            Votre signature est cruciale pour exiger une enquête parlementaire sur les activités de géo-ingénierie et leurs impacts. Chaque voix compte pour la transparence et la protection de notre environnement.
        </p>
        <form class="petition-form" id="petitionForm">
            <div>
                <label for="userName">Nom Complet :</label>
                <input type="text" id="userName" name="userName" required placeholder="Votre nom et prénom">
            </div>
            <div>
                <label for="userEmail">Adresse E-mail :</label>
                <input type="email" id="userEmail" name="userEmail" required placeholder="votre.email@exemple.com">
            </div>
            <div>
                <input type="checkbox" id="supportArticle38" name="supportArticle38" value="true">
                <label for="supportArticle38">Je soutiens l'article 38 de la Constitution française.</label>
            </div>
            <button type="submit" class="btn-primary">Signer la Pétition</button>
            <p id="petitionMessage" style="margin-top: 15px; font-weight: bold;"></p>
        </form>

        <h3 class="subsection-title" style="margin-top: 40px;">Signatures Actuelles (<span id="petitionCount">0</span>)</h3>
        <div id="votesList" class="event-list">
            <!-- Les signatures seront chargées ici -->
        </div>
    `,
    "contact-resources": `
        <h2 class="section-title">Contact & Ressources Utiles</h2>
        <p>
            Si vous avez des informations, des observations ou si vous souhaitez contribuer à ce rapport, n'hésitez pas à nous contacter. Ensemble, nous pouvons exiger la transparence et la protection de notre environnement.
        </p>
        <ul class="resource-list">
            <li>
                <strong>Email :</strong> <a href="mailto:contact@bioclimat-alerte.org">contact@bioclimat-alerte.org</a>
            </li>
            <li>
                <strong>Forum de discussion :</strong> Rejoignez notre communauté sur <a href="https://example.com/forum" target="_blank">bioclimat-forum.org</a>
            </li>
            <li>
                <strong>Ressources complémentaires :</strong>
                <ul>
                    <li><a href="https://example.com/rapport-officiel" target="_blank">Rapport Officiel sur la Géo-ingénierie (hypotétique)</a></li>
                    <li><a href="https://example.com/charte-environnement" target="_blank">Charte de l'Environnement - Article 38</a></li>
                </ul>
            </li>
        </ul>
        <p>
            Vos contributions sont essentielles pour compléter ce rapport et renforcer notre appel à l'action.
        </p>
    `
};
