import {
  useMetadata,
  useNoyaBilling,
  useNoyaClient,
  useNoyaUserData,
} from 'noya-api';
import { useEffect } from 'react';
import {
  findSubscribedProduct,
  isProfessionalPlan,
} from '../components/Subscription';

export function useIsSubscribed(defaultValue = true) {
  const { subscriptions, availableProducts, loading } = useNoyaBilling();

  // Assume we're subscribed if we're still loading
  if (loading) return defaultValue;

  const subscribedProduct = findSubscribedProduct(
    subscriptions,
    availableProducts,
  );

  return subscribedProduct ? isProfessionalPlan(subscribedProduct) : false;
}

export function useOnboardingUpsell({ onShow }: { onShow: () => void }) {
  const client = useNoyaClient();
  const { userData } = useNoyaUserData();
  const isSubscribed = useIsSubscribed();

  const didShowOnboardingUpsell =
    useMetadata<boolean>('didShowOnboardingUpsell') === true;

  useEffect(() => {
    if (!userData || isSubscribed || didShowOnboardingUpsell) {
      return;
    }

    client.metadata.set('didShowOnboardingUpsell', true);
    onShow();
  }, [
    client.metadata,
    didShowOnboardingUpsell,
    isSubscribed,
    onShow,
    userData,
  ]);
}
