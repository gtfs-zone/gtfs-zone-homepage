// The German catalog (Germany). Same keys as copy.ts; a missing or extra key is
// a type error. Addresses the reader as "Sie". Quotes are „…“; copy.de-ch.ts
// derives the Swiss variant from this one.

import type { Copy } from './copy';

export const copy: Copy = {
  meta: {
    title: 'gtfs.zone: Open-Source-Werkzeuge für GTFS und GTFS Realtime',
    description:
      'Open-Source-Software zum Erstellen, Prüfen und Veröffentlichen von GTFS-Schedule- und GTFS-Realtime-Feeds.',
    editorName: 'GTFS-Editor',
    editorDescription:
      'GTFS-Schedule-Editor im Browser. Einen GTFS-Feed auf einer Karte laden, untersuchen, bearbeiten, validieren und exportieren, ohne Server und ohne Konto.',
    visualizerName: 'GTFS-Realtime-Viewer',
    visualizerDescription:
      'GTFS-Realtime-Viewer im Browser. Fahrzeugpositionen, Fahrtaktualisierungen und Servicemeldungen aus jedem Feed auf einer Live-Karte.',
    requiresJs: 'Erfordert JavaScript und WebGL',
  },
  controls: {
    theme: 'Zwischen hell und dunkel wechseln',
    language: 'Sprache',
  },
  links: {
    editor: 'Editor öffnen',
    visualizer: 'Echtzeit-Feeds durchsuchen',
    feedMap: 'Feed-Karte erkunden',
    manager: 'Beim Manager anmelden',
    gtfs: 'Mehr auf gtfs.org',
    scheduleReference: 'Schedule-Spezifikation ansehen',
    realtimeReference: 'Realtime-Spezifikation ansehen',
    traccarDevices: 'siehe die Liste der unterstützten Geräte',
    source: 'Quellcode ansehen',
    newIssue: 'Fehler melden',
  },
  hero: {
    heading:
      'Einfache Open-Source-Werkzeuge für Daten im öffentlichen Verkehr.',
    body: 'Gebaut von Fahrgästen und Betreibern, für Fahrgäste und Betreiber.',
    scrollCue: 'Scrollen',
  },
  whatIsGtfs: {
    eyebrow: 'Was ist GTFS?',
    heading:
      'Ein offener, von der Community getragener Standard für Fahrgastinformationen.',
    body: 'Über 10.000 Verkehrsunternehmen in mehr als 100 Ländern veröffentlichen GTFS. Es ist eine einfache Datenstruktur, die jede App einlesen kann. Wer GTFS einführt, bringt sein Angebot deshalb vor ein breites Publikum, ohne für jede App eine eigene Anbindung.',
    feedMapLink: 'Auf der Feed-Karte ansehen',
    reasons: [
      {
        title: 'Besseres Fahrgasterlebnis',
        body: 'Genaue Fahrpläne und Echtzeit-Updates: Fahrgäste warten weniger und entscheiden besser.',
      },
      {
        title: 'Weltweite Reichweite',
        body: 'Einheitliche Daten über Unternehmen und Regionen hinweg machen Reisen mit mehreren Verkehrsunternehmen möglich.',
      },
      {
        title: 'Einfach zu nutzen',
        body: 'Eine schlichte Datenstruktur, leicht zu erzeugen und leicht zu verarbeiten.',
      },
      {
        title: 'Open-Source-Community',
        body: 'Der Standard entwickelt sich durch die Zusammenarbeit der Community ständig weiter.',
      },
    ],
  },
  scheduled: {
    eyebrow: 'GTFS Schedule',
    heading:
      'Die Grundlage: der Fahrplan, nach dem Fahrgäste ihre Reisen planen.',
    body: 'GTFS Schedule beschreibt das Angebot eines Verkehrsunternehmens in einem Format, das jede große Karten-App bereits liest.',
    features: [
      {
        term: 'Linien und Haltestellen:',
        body: 'wo genau Bus oder Bahn abfahren.',
      },
      {
        term: 'Fahrpläne und Takte:',
        body: 'klare Fahrpläne, nach denen Fahrgäste planen können.',
      },
      { term: 'Tarife:', body: 'Fahrpreise direkt in der App angezeigt.' },
      { term: 'Flexible Angebote:', body: 'Bedarfsverkehr.' },
      {
        term: 'Wegeführung:',
        body: 'das Innere von Bahnhöfen, bis hin zur Frage, welcher Aufzug zu welchem Bahnsteig führt.',
      },
    ],
    scene: {
      trip: 'FAHRT {n}',
    },
  },
  realtime: {
    eyebrow: 'GTFS Realtime',
    heading: 'Live-Updates, die Fahrgäste auf dem Laufenden halten.',
    body: 'GTFS Realtime deckt ab, was sich im Lauf des Tages im Betrieb ändert.',
    beats: [
      {
        term: 'Fahrzeugpositionen:',
        body: 'wo das Fahrzeug gerade wirklich ist, damit niemand rätselnd an der Haltestelle steht.',
      },
      {
        term: 'Fahrtaktualisierungen:',
        body: 'eine genauere Ankunftszeit, damit Anschlüsse nicht verpasst werden.',
      },
      {
        term: 'Servicemeldungen:',
        body: 'Hinweise auf Störungen im Netz, rechtzeitig, um umzuplanen.',
      },
    ],
    scene: {
      nextDepartures: 'Nächste Abfahrten',
      minutes: '{n} Min.',
      delay: '+2 MIN',
      detour: 'Umleitung aktiv',
      detourRoute: 'Linie A über Fairview Ave',
    },
  },
  editor: {
    eyebrow: 'Der Editor',
    heading: 'Importieren, prüfen, korrigieren, exportieren.',
    body: 'Läuft im Browser. Nichts wird irgendwohin hochgeladen, und ein Konto braucht es nicht. Schnell genug selbst für die größten Feeds von Großstädten.',
    steps: ['Importieren', 'Prüfen', 'Korrigieren', 'Exportieren'],
    operationsHeading: 'Damit Ihr GTFS Ihren Betrieb trägt.',
    operationsBody:
      'Das Schweizer Taschenmesser für GTFS: alles, was nötig ist, um einen Feed aktuell zu halten, während sich das Angebot, das er beschreibt, ständig ändert.',
    blades: [
      'Verkehrstage anpassen',
      'Linien bearbeiten',
      'Bahnhöfe kartieren',
      'Linienverläufe erzeugen',
      'Feed validieren',
    ],
    chipsLabel: 'Oder direkt einen echten Feed öffnen',
    scene: {
      issuesOpen: '2 Probleme',
      issuesClear: '0 Probleme',
    },
  },
  visualizer: {
    eyebrow: 'Der Viewer',
    heading: 'Jeden GTFS-Realtime-Feed auf einer Karte untersuchen.',
    body: 'Geben Sie ihm einen Fahrplan-Feed und dessen Echtzeit-Endpunkte, und verfolgen Sie Fahrzeugpositionen, Fahrtaktualisierungen und Servicemeldungen im Vergleich zu dem Fahrplan, dem sie folgen sollen. Der Feed jedes Verkehrsunternehmens, nicht nur unserer. Keine Installation nötig.',
    features: [
      'Fahrzeuge auf einer Live-Karte, ihrer Linie und Fahrt zugeordnet.',
      'Fahrtaktualisierungen, abgeglichen mit dem Fahrplan-Feed.',
      'Servicemeldungen mit den Elementen, die sie betreffen.',
      'Ein Katalog ladebereiter Beispiel-Feeds und ein teilbarer Link, der eine ganze Sitzung wiederherstellt.',
    ],
    chipsLabel: 'Oder direkt einen echten Feed öffnen',
    pickBefore: 'Oder wählen Sie einen beliebigen Feed auf der',
    pickLink: 'Feed-Karte',
  },
  feeds: {
    mbta: 'Groß und vollständig. Nutzt fast jede GTFS-Funktion.',
    amtrak: 'Ein landesweites Netz und ein wirklich unordentlicher Feed.',
    columbiaCounty:
      'So sieht der Feed eines kleinen ländlichen Verkehrsunternehmens wirklich aus.',
    editorDestination: 'im Editor öffnen',
    visualizerDestination: 'im Viewer öffnen',
  },
  manager: {
    eyebrow: 'Der Manager',
    heading: 'Verwaltungssoftware für den Betrieb eines Echtzeit-Feeds.',
    body: 'ist der Ort, an dem ein Verkehrsunternehmen seinen Feed betreibt: Feeds anlegen, Tracker registrieren, Fahrzeuge verfolgen und Servicemeldungen veröffentlichen. Die öffentlichen GTFS-RT-Endpunkte werden direkt daraus aktualisiert.',
    features: [
      {
        term: 'Feeds:',
        body: 'ein Verkehrsunternehmen, ein oder mehrere Feeds, jeweils mit Fahrplanquelle und öffentlichen Endpunkten.',
      },
      {
        term: 'Servicemeldungen:',
        body: 'Titel, Beschreibung, Ursache, Auswirkung, Schweregrad, Gültigkeitszeitraum sowie die betroffenen Linien oder Haltestellen. Veröffentlicht im Meldungs-Feed.',
      },
      {
        term: 'Fahrzeugortung:',
        body: 'ein Tracker pro Fahrzeug, eingerichtet per QR-Code-Scan. Positionen kommen von einem Smartphone oder einem GPS-Gerät und werden als Fahrzeugpositionen ausgeliefert.',
      },
      {
        term: 'Fahrtaktualisierungen:',
        body: 'Verspätung gegenüber der geplanten Fahrt, abgeleitet aus diesen Positionen. Ein Tracker lässt sich über eine Regel nach Tag und Uhrzeit seiner Fahrt zuordnen, sodass die Zuordnung auf dem Server passiert.',
      },
      {
        term: 'Geteilte Feeds:',
        body: 'einen Feed per E-Mail-Adresse an Kolleginnen und Kollegen weitergeben. Sie melden sich mit dem eigenen Konto an und sehen dieselben Feeds, Tracker und Meldungen.',
      },
    ],
    hardwareLabel: 'Ortungshardware',
    builtOn: 'Basiert auf',
    builtOnAfter: ', der Open-Source-Plattform für GPS-Ortung.',
    devices:
      'Kompatibel mit einer Vielzahl von GPS-Trackern, von günstigen Geräten bis zu Premiummarken;',
    phone:
      'Auch ein Smartphone mit der App Traccar Client funktioniert, ein Verkehrsunternehmen kann also ganz ohne Hardware starten.',
    caption: 'Sekunden, nicht Tage.',
    scene: {
      newAlert: 'NEUE MELDUNG',
      // The button fits about ten characters.
      publish: 'SENDEN',
      alert: 'MELDUNG',
    },
  },
  publish: {
    eyebrow: 'Veröffentlichen',
    heading: 'In Millionen Hosentaschen.',
    body: 'Ein Feed erreicht jede große Karten-App und lässt sich direkt in Ihre eigene Website einbinden.',
    destinations: [
      'Google Maps / Apple Maps',
      'Transit / Motis',
      'Ihre Website',
    ],
    destinationsLabel: 'Wo der Feed ankommt',
    scene: {
      oneFeed: 'Ein Feed',
      siteDomain: 'ihr-verkehrsbetrieb.de',
    },
  },
  openSource: {
    eyebrow: 'Open Source',
    heading: 'Open Source von Anfang an.',
    points: [
      { title: 'Sicher', body: 'Öffentlich geprüft.' },
      {
        title: 'Ihr Feed gehört Ihnen',
        body: 'Betreiben Sie ihn selbst. Kein Anbieter bindet Sie an sich.',
      },
      {
        title: 'Gemeinschaftlich',
        body: 'Gemeinschaftliche Software für den öffentlichen Verkehr.',
      },
    ],
  },
  contact: {
    eyebrow: 'Kontakt',
    heading: 'Kontakt aufnehmen.',
    body: 'Wenn Sie ein Verkehrsangebot betreiben und möchten, dass Ihre Fahrgäste es sehen, schreiben Sie uns.',
    bug: 'Einen Fehler gefunden?',
    bugLink: 'Im Issue-Tracker melden',
    bugAfter: ' oder an die Adresse oben schreiben.',
  },
  footer: {
    editor: 'Editor',
    visualizer: 'Viewer',
    feedMap: 'Feed-Karte',
    manager: 'Manager',
    source: 'Quellcode',
  },
};
