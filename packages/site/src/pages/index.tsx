import { useNoyaBilling, useNoyaFiles } from 'noya-api';
import React from 'react';
import { AppLayout } from '../components/AppLayout';
import { Projects } from '../components/Projects';
import {
  getSubscriptionOverage,
  SubscriptionCard,
  SubscriptionUsageMeter,
} from '../components/Subscription';
import { Toolbar } from '../components/Toolbar';

export default function App() {
  const files = useNoyaFiles();
  const { subscriptions, availableProducts } = useNoyaBilling();

  const overageItems = getSubscriptionOverage(
    files,
    subscriptions,
    availableProducts,
    0.25,
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
