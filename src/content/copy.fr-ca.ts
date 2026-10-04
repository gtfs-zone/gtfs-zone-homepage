// The Canadian French catalog: copy.fr.ts with Quebec typography (no space
// before `;`, `?` and `!`) and the OQLF terms where France French differs.

import { canadianFrench, regional } from '../i18n/regional';
import { copy as fr } from './copy.fr';
import type { Copy } from './copy';

export const copy: Copy = regional(fr, canadianFrench, {
  links: {
    newIssue: 'Signaler un bogue',
  },
  scheduled: {
    features: {
      0: { body: 'exactement où prendre l’autobus ou le train.' },
    },
  },
  manager: {
    features: {
      2: {
        body: 'un traceur par véhicule, configuré en balayant un code QR. Les positions arrivent d’un téléphone ou d’un boîtier GPS et sont servies comme positions des véhicules.',
      },
      4: {
        body: 'confiez un flux à un collègue par son adresse courriel. Il se connecte avec son propre compte et voit les mêmes flux, traceurs et alertes.',
      },
    },
  },
  publish: {
    scene: {
      siteDomain: 'votre-reseau.ca',
    },
  },
  contact: {
    bug: 'Un bogue?',
  },
});
