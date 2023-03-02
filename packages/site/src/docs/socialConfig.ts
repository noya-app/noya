import { GuidebookConfig } from 'react-guidebook';

export const socialConfig: GuidebookConfig = {
  title: 'Noya Documentation',
  location: {
    host: (
      process.env.NEXT_PUBLIC_NOYA_WEB_URL ?? 'https://www.noya.io'
    ).replace(/https?:\/\//, ''),
    path: '/app/docs',
  },
  author: {
    twitter: 'noyasoftware',
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
    path: '/app/SocialCard.png',
  },
};
