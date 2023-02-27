import { GuidebookConfig } from 'react-guidebook';

export const socialConfig: GuidebookConfig = {
  title: 'Noya Documentation',
  location: {
    host: 'www.noya.io/app/docs',
  },
  author: {
    twitter: 'dvnabbott',
  },
  favicons: [
    {
      type: 'image/x-icon',
      path: '/favicon.ico',
    },
  ],
  previewImage: {
    type: 'image/png',
    width: '1200',
    height: '630',
    alt: 'Noya Documentation',
    path: '/noya-preview-card.png',
  },
};
