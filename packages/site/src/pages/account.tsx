import { format } from 'date-fns';
import { useNoyaBilling, useNoyaSession } from 'noya-api';
import {
  Heading2,
  Heading3,
  Small,
  Spacer,
  Stack,
  Switch,
  useDesignSystemTheme,
} from 'noya-designsystem';
import React, { useState } from 'react';
import { AppLayout } from '../components/AppLayout';
import {
  AccountDetailRow,
  describePrice,
  findSubscribedProduct,
  isProfessionalPlan,
  ProfessionalPlanFeatures,
  StarterPlanFeatures,
  SubscriptionCard,
} from '../components/Subscription';
import { Toolbar } from '../components/Toolbar';

export default function Account() {
  const { portalUrl, subscriptions, availableProducts, loading } =
    useNoyaBilling();
  const session = useNoyaSession();
  const theme = useDesignSystemTheme();

  const activeSubscriptions = subscriptions.filter(
    (subscription) => subscription.status === 'active',
  );

  const [isAnnualBilling, setIsAnnualBilling] = useState(true);

  return (
    <AppLayout toolbar={<Toolbar />}>
      <Stack.V flex="1" gap={44}>
        <Stack.V gap={20}>
          <Stack.H alignItems="center">
            <Heading2 color="text">Account</Heading2>
          </Stack.H>
          <Stack.V
            border={`1px solid ${theme.colors.dividerSubtle}`}
            padding={20}
            background={theme.colors.sidebar.background}
            gap={10}
          >
            {session?.user.name && (
              <AccountDetailRow label="Name" value={session.user.name} />
            )}
            {session?.user.email && (
              <AccountDetailRow label="Email" value={session.user.email} />
            )}
          </Stack.V>
        </Stack.V>
        {!loading && (
          <>
            <Stack.V gap={20}>
              <Heading3 color="text">Current Plan</Heading3>
              {activeSubscriptions.map((subscription) => {
                const product = findSubscribedProduct(
                  subscriptions,
                  availableProducts,
                );

                if (!product) return null;

                const periodEnd = new Date(subscription.currentPeriodEnd);
                const price = subscription.items[0].price;

                return (
                  <SubscriptionCard
                    name={product.name}
                    periodEnd={format(periodEnd, 'MMM d, yyyy')}
                    cancelAtPeriodEnd={subscription.cancelAtPeriodEnd}
                    priceDescription={describePrice(price)}
                    callToActionText="Manage Subscription"
                    callToActionUrl={portalUrl}
                  >
                    {isProfessionalPlan(product) ? (
                      <ProfessionalPlanFeatures />
                    ) : (
                      <StarterPlanFeatures />
                    )}
                  </SubscriptionCard>
                );
              })}
              {activeSubscriptions.length === 0 && (
                <SubscriptionCard name="Noya Starter" priceDescription="Free">
                  <StarterPlanFeatures />
                </SubscriptionCard>
              )}
            </Stack.V>
            {activeSubscriptions.length === 0 && availableProducts.length > 0 && (
              <Stack.V gap={20}>
                <Stack.H>
                  <Heading3 color="text">Upgrade Plan</Heading3>
                  <Spacer.Horizontal />
                  <Stack.H gap={8} alignItems="center">
                    <Small color="text">Annual Billing</Small>
                    <Switch
                      value={isAnnualBilling}
                      onChange={setIsAnnualBilling}
                      variant="secondary"
                    />
                  </Stack.H>
                </Stack.H>
                {availableProducts.map((product) => {
                  const annualPrice = product.prices.find(
                    (price) => price.recurringInterval === 'year',
                  );
                  const monthlyPrice = product.prices.find(
                    (price) => price.recurringInterval === 'month',
                  );

                  const price =
                    (isAnnualBilling ? annualPrice : monthlyPrice) ??
                    product.prices[0];

                  return (
                    <SubscriptionCard
                      key={product.id}
                      name={product.name}
                      priceDescription={describePrice(price)}
                      callToActionUrl={price.url}
                      callToActionText="Subscribe"
                      callToActionAccented
                    >
                      <ProfessionalPlanFeatures />
                    </SubscriptionCard>
                  );
                })}
              </Stack.V>
            )}
          </>
        )}
      </Stack.V>
    </AppLayout>
  );
}
