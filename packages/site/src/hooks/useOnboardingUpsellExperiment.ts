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

export function useOnboardingUpsellExperiment({
  onShow,
}: {
  onShow: () => void;
}) {
  const client = useNoyaClient();
  const { userData } = useNoyaUserData();
  const {
    subscriptions,
    availableProducts,
    loading: subscriptionsLoading,
  } = useNoyaBilling();

  const didShowOnboardingUpsell =
    useMetadata<boolean>('didShowOnboardingUpsell') === true;

  const subscribedProduct = findSubscribedProduct(
    subscriptions,
    availableProducts,
  );

  const isSubscribed = subscribedProduct
    ? isProfessionalPlan(subscribedProduct)
    : false;

  useEffect(() => {
    if (
      subscriptionsLoading ||
      !userData ||
      isSubscribed ||
      didShowOnboardingUpsell ||
      userData.experiments.showOnboardingUpsell !== 'treatment'
    ) {
      return;
    }

    client.metadata.set('didShowOnboardingUpsell', true);
    onShow();
  }, [
    client.metadata,
    didShowOnboardingUpsell,
    isSubscribed,
    onShow,
    subscriptionsLoading,
    userData,
  ]);
}
