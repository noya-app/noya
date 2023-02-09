import { useNoyaBilling, useNoyaFiles } from 'noya-api';
import { amplitude } from 'noya-log';
import React, { useEffect } from 'react';
import { AppLayout } from '../components/AppLayout';
import { Projects } from '../components/Projects';
import {
  getSubscriptionOverage,
  SubscriptionCard,
  SubscriptionUsageMeter,
  usageMeterThreshold,
} from '../components/Subscription';
import { Toolbar } from '../components/Toolbar';

export default function Project() {
  useEffect(() => {
    amplitude.logEvent('App - Projects List - Opened');
  }, []);

  const files = useNoyaFiles();
  const { subscriptions, availableProducts } = useNoyaBilling();

  const overageItems = getSubscriptionOverage(
    files,
    subscriptions,
    availableProducts,
    usageMeterThreshold,
  );

  return (
    <AppLayout
      toolbar={<Toolbar />}
      footer={
        overageItems.length > 0 && (
          <SubscriptionCard
            name="Current Plan: Starter"
            priceDescription="Free"
            callToActionAccented
            callToActionText="Upgrade"
            callToActionUrl="/app/account"
          >
            <SubscriptionUsageMeter items={overageItems} />
          </SubscriptionCard>
        )
      }
    >
      <Projects />
    </AppLayout>
  );
}
