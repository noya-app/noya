import React, { ReactNode } from 'react';
import { GuidebookConfig } from 'react-guidebook';

interface Props {
  config: GuidebookConfig;
  pageTitle: string;
  pageDescription?: string;
}

export function getHeadTags({
  config,
  pageTitle,
  pageDescription,
}: Props): ReactNode[] {
  return [
    <title key="title">{pageTitle}</title>,

    // Site
    config.title && (
      <meta key="og:site_name" property="og:site_name" content={config.title} />
    ),

    // Page
    <meta key="og:title" property="og:title" content={pageTitle} />,
    pageDescription && (
      <meta key="description" name="description" content={pageDescription} />
    ),
    pageDescription && (
      <meta
        key="og:description"
        property="og:description"
        content={pageDescription}
      />
    ),

    // Card
    <meta key="og:type" property="og:type" content="article" />,
    <meta key="og:locale" property="og:locale" content="en_US" />,
    <meta key="og:card" property="og:card" content="summary" />,

    // Location
    config.location && (
      <meta
        key="og:url"
        property="og:url"
        content={`https://${config.location.host}`}
      />
    ),

    config.favicons?.map(({ type, path }, index) => (
      <link key={index} rel="icon" type={type} href={path} />
    )),

    // Author
    ...(config.author?.twitter
      ? [
          <meta
            key="og:creator"
            property="og:creator"
            content={`@${config.author.twitter}`}
          />,
          <meta
            key="article:author"
            property="article:author"
            content={`https://twitter.com/${config.author.twitter}`}
          />,
        ]
      : []),

    // Preview Image
    ...(config.location && config.previewImage
      ? [
          <meta
            key="og:image"
            property="og:image"
            content={`http://${config.location.host}${config.previewImage.path}`}
          />,
          <meta
            key="og:image:secure_url"
            property="og:image:secure_url"
            content={`https://${config.location.host}${config.previewImage.path}`}
          />,
          <meta
            key="og:image:type"
            property="og:image:type"
            content={config.previewImage.type}
          />,
          <meta
            key="og:image:width"
            property="og:image:width"
            content={config.previewImage.width}
          />,
          <meta
            key="og:image:height"
            property="og:image:height"
            content={config.previewImage.height}
          />,
          <meta
            key="og:image:alt"
            property="og:image:alt"
            content={config.previewImage.alt}
          />,
        ]
      : []),

    // Twitter
    ...(config.author?.twitter
      ? [
          <meta
            key="twitter:card"
            name="twitter:card"
            content="summary_large_image"
          />,
          <meta
            key="twitter:site"
            name="twitter:site"
            content={`@${config.author.twitter}`}
          />,
          <meta
            key="twitter:creator"
            name="twitter:creator"
            content={`@${config.author.twitter}`}
          />,
          <meta key="twitter:title" name="twitter:title" content={pageTitle} />,
          <meta
            key="twitter:description"
            name="twitter:description"
            content={pageDescription}
          />,
          config.location && config.previewImage && (
            <meta
              key="twitter:image"
              name="twitter:image"
              content={`https://${config.location.host}${config.previewImage.path}`}
            />
          ),
        ]
      : []),
  ];
}
