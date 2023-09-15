import { useNoyaBilling, useNoyaClient, useNoyaFiles } from 'noya-api';
import { amplitude } from 'noya-log';
import React, { useEffect, useState } from 'react';
import { AppLayout } from '../components/AppLayout';
import { NavigationLinks } from '../components/NavigationLinks';
import { Projects } from '../components/Projects';
import {
  SubscriptionCard,
  SubscriptionUsageMeter,
  getSubscriptionOverage,
  usageMeterThreshold,
} from '../components/Subscription';
import { Toolbar } from '../components/Toolbar';
import { UpgradeDialog } from '../components/UpgradeDialog';
import { useOnboardingUpsell } from '../hooks/useOnboardingUpsellExperiment';

export default function Project() {
  // const billing = useBilling();

  useEffect(() => {
    amplitude.logEvent('App - Projects List - Opened');
  }, []);

  const client = useNoyaClient();

  useEffect(() => {
    // Force reload files so we don't show anything stale
    client.reloadFiles();
  }, [client]);

  return (
    <AppLayout
      toolbar={
        <Toolbar>
          <NavigationLinks />
        </Toolbar>
      }
      // footer={billing.subscriptionCard}
    >
      <Projects />
      {/* {billing.upgradeDialog} */}
    </AppLayout>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function useBilling() {
  const { files } = useNoyaFiles();

  const {
    subscriptions,
    availableProducts,
    loading: loadingBilling,
  } = useNoyaBilling();
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);

  useOnboardingUpsell({
    onShow: () => setShowUpgradeDialog(true),
  });

  const overageItems = loadingBilling
    ? []
    : getSubscriptionOverage(
        files,
        subscriptions,
        availableProducts,
        usageMeterThreshold,
      );

  return {
    upgradeDialog: showUpgradeDialog && (
      <UpgradeDialog
        showUpgradeDialog={showUpgradeDialog}
        setShowUpgradeDialog={setShowUpgradeDialog}
        availableProducts={availableProducts}
      />
    ),
    subscriptionCard: overageItems.length > 0 && !showUpgradeDialog && (
      <SubscriptionCard
        name="Current Plan: Starter"
        priceDescription="Free"
        callToActionAccented
        callToActionText="Upgrade"
        callToActionUrl="/app/account"
        onPressCallToAction={() => {
          setShowUpgradeDialog(true);
        }}
      >
        <SubscriptionUsageMeter items={overageItems} />
      </SubscriptionCard>
    ),
  };
}
