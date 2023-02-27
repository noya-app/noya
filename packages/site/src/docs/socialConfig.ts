import { GuidebookConfig } from 'react-guidebook';

export const socialConfig: GuidebookConfig = {
  title: 'Noya Docs',
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
    alt: 'Noya Docs',
    path: '/studio-721-preview-card.png',
  },
};
