import { useMetadata, useNoyaBilling, useNoyaClient } from 'noya-api';
import { useEffect } from 'react';
import {
  findSubscribedProduct,
  isProfessionalPlan,
} from '../components/Subscription';

export function useIsSubscribed() {
  const { subscriptions, availableProducts, loading } = useNoyaBilling();

  // Assume we're subscribed if we're still loading
  if (loading) return true;

  const subscribedProduct = findSubscribedProduct(
    subscriptions,
    availableProducts,
  );

  return subscribedProduct ? isProfessionalPlan(subscribedProduct) : false;
}

export function useOnboardingUpsell({ onShow }: { onShow: () => void }) {
  const client = useNoyaClient();
  const isSubscribed = useIsSubscribed();

  const didShowOnboardingUpsell =
    useMetadata<boolean>('didShowOnboardingUpsell') === true;

  useEffect(() => {
    if (isSubscribed || didShowOnboardingUpsell) {
      return;
    }

    client.metadata.set('didShowOnboardingUpsell', true);
    onShow();
  }, [client.metadata, didShowOnboardingUpsell, isSubscribed, onShow]);
}
