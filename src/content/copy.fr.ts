// The French catalog. Same keys as copy.ts; a missing or extra key is a type
// error. Terms follow gtfs.org's French documentation. `\u00a0` is the
// non-breaking space French puts before `:`, `;`, `?` and `!`.

import type { Copy } from './copy';

export const copy: Copy = {
  meta: {
    title: 'gtfs.zone\u00a0: outils open source pour GTFS et GTFS Realtime',
    description:
      'Logiciels open source pour créer, vérifier et publier des flux GTFS Schedule et GTFS Realtime.',
    editorName: 'Éditeur GTFS',
    editorDescription:
      'Éditeur GTFS Schedule dans le navigateur. Chargez, inspectez, modifiez, validez et exportez un flux GTFS sur une carte, sans serveur et sans compte.',
    visualizerName: 'Visualiseur GTFS Realtime',
    visualizerDescription:
      'Visualiseur GTFS Realtime dans le navigateur. Positions des véhicules, mises à jour des trajets et alertes de service de n’importe quel flux, sur une carte en direct.',
    requiresJs: 'Nécessite JavaScript et WebGL',
  },
  controls: {
    theme: 'Basculer entre clair et sombre',
    otherLocale: 'English version',
    otherLocaleCode: 'EN',
  },
  links: {
    editor: 'Ouvrir l’éditeur',
    visualizer: 'Parcourir les flux temps réel',
    feedMap: 'Explorer la carte des flux',
    manager: 'Se connecter au gestionnaire',
    gtfs: 'En savoir plus sur gtfs.org',
    scheduleReference: 'Voir la spécification Schedule',
    realtimeReference: 'Voir la spécification Realtime',
    traccarDevices: 'voir la liste des appareils pris en charge',
    source: 'Voir le code source',
    newIssue: 'Signaler un bug',
  },
  hero: {
    heading: 'Des outils simples et open source pour les données de transport.',
    body: 'Conçus par des voyageurs et des exploitants, pour les voyageurs et les exploitants.',
    scrollCue: 'Défiler',
  },
  whatIsGtfs: {
    eyebrow: 'Qu’est-ce que GTFS\u00a0?',
    heading:
      'Un standard ouvert, porté par la communauté, pour l’information voyageurs.',
    body: 'Plus de 10\u00a0000 agences dans plus de 100 pays publient du GTFS. C’est une structure de données simple que tout développeur d’application peut exploiter\u00a0: l’adopter rend le service d’une agence visible par un large public, sans intégration spécifique à chaque application.',
    feedMapLink: 'Les voir sur la carte des flux',
    reasons: [
      {
        title: 'Une meilleure expérience voyageur',
        body: 'Des horaires précis et des mises à jour en temps réel, pour que les voyageurs attendent moins et décident mieux.',
      },
      {
        title: 'Une portée mondiale',
        body: 'Des données cohérentes entre agences et régions rendent possibles les trajets sur plusieurs réseaux.',
      },
      {
        title: 'Simple à utiliser',
        body: 'Une structure de données simple, facile à produire et à exploiter.',
      },
      {
        title: 'Une communauté open source',
        body: 'Le standard continue d’évoluer grâce à la collaboration de la communauté.',
      },
    ],
  },
  scheduled: {
    eyebrow: 'GTFS Schedule',
    heading:
      'La base\u00a0: les horaires sur lesquels les voyageurs planifient leurs trajets.',
    body: 'GTFS Schedule décrit le service qu’exploite une agence, dans un format que toutes les grandes applications de cartographie savent déjà lire.',
    features: [
      {
        term: 'Lignes et arrêts\u00a0:',
        body: 'exactement où prendre le bus ou le train.',
      },
      {
        term: 'Horaires et fréquences\u00a0:',
        body: 'des grilles horaires claires pour planifier ses trajets.',
      },
      {
        term: 'Tarifs\u00a0:',
        body: 'le prix du trajet affiché d’emblée dans les applications.',
      },
      {
        term: 'Services flexibles\u00a0:',
        body: 'le transport à la demande.',
      },
      {
        term: 'Cheminements\u00a0:',
        body: 'l’intérieur des gares, jusqu’à l’ascenseur qui mène à chaque quai.',
      },
    ],
    scene: {
      trip: 'N°\u00a0{n}',
    },
  },
  realtime: {
    eyebrow: 'GTFS Realtime',
    heading: 'Des mises à jour en direct pour informer les voyageurs.',
    body: 'GTFS Realtime couvre ce qui change sur le réseau au fil de la journée.',
    beats: [
      {
        term: 'Positions des véhicules\u00a0:',
        body: 'où se trouve réellement le véhicule en ce moment, pour que personne n’attende à l’arrêt sans savoir.',
      },
      {
        term: 'Mises à jour des trajets\u00a0:',
        body: 'une heure d’arrivée plus précise, pour ne pas rater les correspondances.',
      },
      {
        term: 'Alertes de service\u00a0:',
        body: 'les perturbations sur le réseau, signalées à temps pour changer de plan.',
      },
    ],
    scene: {
      nextDepartures: 'Prochains départs',
      minutes: '{n} min',
      delay: '+2 MIN',
      detour: 'Déviation en cours',
      detourRoute: 'Ligne A par Fairview Ave',
    },
  },
  editor: {
    eyebrow: 'L’éditeur',
    heading: 'Importer, inspecter, corriger, exporter.',
    body: 'Fonctionne dans le navigateur. Rien n’est envoyé nulle part, et aucun compte n’est nécessaire. Assez rapide même pour les plus gros flux des grandes villes.',
    steps: ['Importer', 'Inspecter', 'Corriger', 'Exporter'],
    operationsHeading: 'Mettre votre GTFS au service de votre exploitation.',
    operationsBody:
      'Le couteau suisse du GTFS\u00a0: tout ce qu’il faut pour garder un flux exact pendant que le service qu’il décrit continue d’évoluer.',
    blades: [
      'Modifier les services',
      'Modifier les lignes',
      'Placer les gares',
      'Générer les tracés',
      'Valider le flux',
    ],
    chipsLabel: 'Ou ouvrez directement un vrai flux',
    scene: {
      issuesOpen: '2 problèmes',
      issuesClear: '0 problème',
    },
  },
  visualizer: {
    eyebrow: 'Le visualiseur',
    heading: 'Inspectez n’importe quel flux GTFS Realtime sur une carte.',
    body: 'Indiquez-lui un flux théorique et ses points d’accès temps réel, et suivez les positions des véhicules, les mises à jour des trajets et les alertes de service face aux horaires qu’ils prétendent suivre. Le flux de n’importe quelle agence, pas seulement le nôtre. Rien à installer.',
    features: [
      'Les véhicules sur une carte en direct, rattachés à leur ligne et à leur trajet.',
      'Les mises à jour des trajets, lues face au flux théorique.',
      'Les alertes de service, avec les entités qu’elles concernent.',
      'Un catalogue de flux d’exemple prêts à charger, et un lien partageable qui reproduit toute une session.',
    ],
    chipsLabel: 'Ou ouvrez directement un vrai flux',
    pickBefore: 'Ou choisissez n’importe quel flux sur la',
    pickLink: 'carte des flux',
  },
  feeds: {
    mbta: 'Grand et complet. Utilise presque toutes les fonctionnalités de GTFS.',
    amtrak: 'Un réseau national, et un flux franchement désordonné.',
    columbiaCounty:
      'À quoi ressemble vraiment le flux d’une petite agence rurale.',
    editorDestination: 'ouvrir dans l’éditeur',
    visualizerDestination: 'ouvrir dans le visualiseur',
  },
  manager: {
    eyebrow: 'Le gestionnaire',
    heading: 'Un logiciel de gestion pour exploiter un flux temps réel.',
    body: 'est l’outil avec lequel une agence gère son flux\u00a0: définir des flux, enregistrer des traceurs, suivre les véhicules et publier des alertes de service. Les points d’accès GTFS-RT publics sont mis à jour directement depuis celui-ci.',
    features: [
      {
        term: 'Flux\u00a0:',
        body: 'une agence, un ou plusieurs flux, chacun avec sa source théorique et ses points d’accès publics.',
      },
      {
        term: 'Alertes de service\u00a0:',
        body: 'en-tête, description, cause, effet, gravité, période d’activité, et les lignes ou arrêts concernés. Publiées dans le flux d’alertes.',
      },
      {
        term: 'Suivi des véhicules\u00a0:',
        body: 'un traceur par véhicule, configuré en scannant un QR code. Les positions arrivent d’un téléphone ou d’un boîtier GPS et sont servies comme positions des véhicules.',
      },
      {
        term: 'Mises à jour des trajets\u00a0:',
        body: 'le retard par rapport au trajet prévu, déduit de ces positions. Un traceur peut être rattaché à son trajet par une règle de jour et d’heure, pour que l’association se fasse sur le serveur.',
      },
      {
        term: 'Flux partagés\u00a0:',
        body: 'confiez un flux à un collègue par son adresse e-mail. Il se connecte avec son propre compte et voit les mêmes flux, traceurs et alertes.',
      },
    ],
    hardwareLabel: 'Matériel de suivi',
    builtOn: 'Basé sur',
    builtOnAfter: ', la plateforme open source de suivi GPS.',
    devices:
      'Compatible avec un large éventail de traceurs GPS, des modèles économiques aux grandes marques\u00a0;',
    phone:
      'Un téléphone avec l’application Traccar Client fonctionne aussi\u00a0: une agence peut démarrer sans aucun matériel.',
    caption: 'Des secondes, pas des jours.',
    scene: {
      newAlert: 'NOUVELLE ALERTE',
      publish: 'PUBLIER',
      alert: 'ALERTE',
    },
  },
  publish: {
    eyebrow: 'Publier',
    heading: 'Dans des millions de poches.',
    body: 'Un seul flux atteint toutes les grandes applications de cartographie, et s’intègre directement à votre propre site.',
    destinations: [
      'Google Maps / Apple Maps',
      'Transit / Motis',
      'Votre site web',
    ],
    destinationsLabel: 'Où le flux est diffusé',
    scene: {
      oneFeed: 'Un seul flux',
      siteDomain: 'votre-reseau.fr',
    },
  },
  openSource: {
    eyebrow: 'Open source',
    heading: 'Open source depuis le début.',
    points: [
      { title: 'Sécurisé', body: 'Audité au grand jour.' },
      {
        title: 'Maîtrisez votre flux',
        body: 'Hébergez-le vous-même. Aucun fournisseur pour vous enfermer.',
      },
      {
        title: 'Tourné vers la communauté',
        body: 'Un logiciel commun pour un transport commun.',
      },
    ],
  },
  contact: {
    eyebrow: 'Nous contacter',
    heading: 'Nous contacter.',
    body: 'Si vous exploitez un réseau de transport et voulez que vos voyageurs le voient, écrivez-nous.',
    bug: 'Un bug\u00a0?',
    bugLink: 'Signalez-le sur le suivi des tickets',
    bugAfter: ', ou écrivez à l’adresse ci-dessus.',
  },
  footer: {
    editor: 'Éditeur',
    visualizer: 'Visualiseur',
    feedMap: 'Carte des flux',
    manager: 'Gestionnaire',
    source: 'Code source',
  },
};
