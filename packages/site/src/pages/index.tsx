import { useNoyaBilling, useNoyaClient, useNoyaFiles } from 'noya-api';
import { Dialog } from 'noya-designsystem';
import { amplitude } from 'noya-log';
import React, { useEffect, useState } from 'react';
import { AppLayout } from '../components/AppLayout';
import { Projects } from '../components/Projects';
import {
  getSubscriptionOverage,
  SubscriptionCard,
  SubscriptionUsageMeter,
  usageMeterThreshold,
} from '../components/Subscription';
import { Toolbar } from '../components/Toolbar';
import { UpgradeInfo } from '../components/UpgradeInfo';

export default function Project() {
  useEffect(() => {
    amplitude.logEvent('App - Projects List - Opened');
  }, []);

  const client = useNoyaClient();
  const { files } = useNoyaFiles();
  const { subscriptions, availableProducts } = useNoyaBilling();

  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);

  useEffect(() => {
    // Force reload files so we don't show anything stale
    client.reloadFiles();
  }, [client]);

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
      {showUpgradeDialog && (
        <Dialog
          style={{
            maxWidth: '900px',
            padding: 0,
          }}
          open={showUpgradeDialog}
          onOpenChange={(value) => {
            setShowUpgradeDialog(value);
          }}
        >
          <UpgradeInfo />
        </Dialog>
      )}
    </AppLayout>
  );
}
