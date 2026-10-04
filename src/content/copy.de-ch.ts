// The Swiss German catalog: copy.de.ts in Swiss Standard German, with `ss` for
// `ß`, guillemets for quotes, `’` as the thousands separator, and Swiss terms
// where they differ.

import { regional, swissGerman } from '../i18n/regional';
import { copy as de } from './copy.de';
import type { Copy } from './copy';

export const copy: Copy = regional(de, swissGerman, {
  whatIsGtfs: {
    body: 'Über 10’000 Verkehrsunternehmen in mehr als 100 Ländern veröffentlichen GTFS. Es ist eine einfache Datenstruktur, die jede App einlesen kann. Wer GTFS einführt, bringt sein Angebot deshalb vor ein breites Publikum, ohne für jede App eine eigene Anbindung.',
  },
  scheduled: {
    features: {
      4: {
        body: 'das Innere von Bahnhöfen, bis hin zur Frage, welcher Lift zu welchem Perron führt.',
      },
    },
  },
  editor: {
    operationsBody:
      'Das Schweizer Sackmesser für GTFS: alles, was nötig ist, um einen Feed aktuell zu halten, während sich das Angebot, das er beschreibt, ständig ändert.',
  },
  publish: {
    scene: {
      siteDomain: 'ihr-verkehrsbetrieb.ch',
    },
  },
});
