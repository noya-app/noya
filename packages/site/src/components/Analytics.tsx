import LogRocket from 'logrocket';
import setupLogRocketReact from 'logrocket-react';
import Script from 'next/script';
import { NoyaAPI, useNoyaSession } from 'noya-api';
import { amplitude } from 'noya-log';
import React, { useEffect } from 'react';

const IUBENDA_CS_CONFIGURATION = {
  askConsentAtCookiePolicyUpdate: true,
  countryDetection: true,
  enableLgpd: true,
  gdprAppliesGlobally: false,
  invalidateConsentWithoutLog: true,
  lang: 'en',
  lgpdAppliesGlobally: false,
  perPurposeConsent: true,
  siteId: process.env.NEXT_PUBLIC_IUBENDA_SITE_ID,
  cookiePolicyId: process.env.NEXT_PUBLIC_IUBENDA_COOKIE_POLICY_ID,
  callback: {
    onPreferenceExpressedOrNotNeeded: (preference: {
      purposes?: { 1?: boolean; 4?: boolean };
    }) => {
      if (
        !preference ||
        (preference.purposes && preference.purposes[4] === true)
      ) {
        if (process.env.NEXT_PUBLIC_LOGROCKET_APP_ID) {
          LogRocket.init(process.env.NEXT_PUBLIC_LOGROCKET_APP_ID);
          setupLogRocketReact(LogRocket);
        }
        if (process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY) {
          amplitude.init(
            process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY,
            getGlobalUserId(),
          );
          amplitude.setOptOut(false);
        }
      } else if (preference.purposes && preference.purposes[4] === false) {
        if (
          process.env.NEXT_PUBLIC_LOGROCKET_APP_ID &&
          'uninstall' in LogRocket &&
          typeof LogRocket.uninstall === 'function'
        ) {
          LogRocket.uninstall();
        }
        if (process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY) {
          amplitude.setOptOut(true);
        }
      }
    },
  },
  banner: {
    acceptButtonCaptionColor: '#FFFFFF',
    acceptButtonColor: '#0073CE',
    acceptButtonDisplay: true,
    backgroundColor: '#FFFFFF',
    backgroundOverlay: true,
    closeButtonDisplay: false,
    customizeButtonCaptionColor: '#4D4D4D',
    customizeButtonColor: '#DADADA',
    customizeButtonDisplay: true,
    explicitWithdrawal: true,
    fontSizeBody: '12px',
    listPurposes: true,
    position: 'float-bottom-center',
    rejectButtonCaptionColor: '#FFFFFF',
    rejectButtonColor: '#0073CE',
    rejectButtonDisplay: true,
    textColor: '#000000',
  },
};

declare global {
  interface Window {
    _iub: any;
  }
}

export function installAnalytics() {
  if (typeof window === 'undefined') {
    return;
  }
  window._iub ??= [];
  window._iub.csConfiguration = IUBENDA_CS_CONFIGURATION;
}

let userId: string | undefined;

export function setGlobalUserId(id?: string) {
  userId = id;
}

export function getGlobalUserId() {
  return userId;
}

export function useAnalytics(session?: NoyaAPI.Session | null) {
  useEffect(() => {
    if (session) {
      setGlobalUserId(session.user.id);
      LogRocket.identify(session.user.id);
      amplitude.setUserId(session.user.id);
    } else if (getGlobalUserId() || amplitude.getUserId()) {
      setGlobalUserId();
      amplitude.reset();
    }
  }, [session]);
}

export function Analytics({ children }: { children: React.ReactNode }) {
  const session = useNoyaSession();
  useAnalytics(session);
  return (
    <>
      {children}
      <Script src="//cdn.iubenda.com/cs/iubenda_cs.js" async />
    </>
  );
}
