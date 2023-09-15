import { format } from 'date-fns';
import {
  useNoyaBilling,
  useNoyaClient,
  useNoyaEmailLists,
  useNoyaFiles,
  useNoyaSession,
} from 'noya-api';
import {
  Body,
  Heading2,
  Heading3,
  Small,
  Spacer,
  Stack,
  Switch,
  useDesignSystemTheme,
} from 'noya-designsystem';
import { amplitude } from 'noya-log';
import React, { useEffect, useState } from 'react';
import { AppLayout } from '../components/AppLayout';
import {
  AccountDetailRow,
  ProfessionalPlanFeatures,
  StarterPlanFeatures,
  SubscriptionCard,
  SubscriptionUsageMeter,
  describePrice,
  filterActiveSubscriptions,
  findSubscribedProduct,
  getSubscriptionOverage,
  isProfessionalPlan,
} from '../components/Subscription';
import { Toolbar } from '../components/Toolbar';
import { isBeta } from '../utils/environment';

export default function Account() {
  useEffect(() => {
    amplitude.logEvent('App - Account - Opened');
  }, []);

  const { portalUrl, subscriptions, availableProducts, loading } =
    useNoyaBilling();
  const session = useNoyaSession();
  const theme = useDesignSystemTheme();
  const { files } = useNoyaFiles();
  const overageItems = getSubscriptionOverage(
    files,
    subscriptions,
    availableProducts,
    0,
  );
  const { emailLists } = useNoyaEmailLists();
  const client = useNoyaClient();

  const activeSubscriptions = filterActiveSubscriptions(subscriptions);

  const [isAnnualBilling, setIsAnnualBilling] = useState(true);

  return (
    <AppLayout toolbar={<Toolbar />}>
      <Stack.V flex="1" gap={44}>
        <Stack.V gap={20}>
          <Stack.H alignItems="center">
            <Heading2 color="text">
              {isBeta ? 'Beta Account' : 'Account'}
            </Heading2>
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
        {!loading && !isBeta && (
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
                  <SubscriptionUsageMeter items={overageItems} />
                </SubscriptionCard>
              )}
            </Stack.V>
            {activeSubscriptions.length === 0 &&
              availableProducts.length > 0 && (
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
        {emailLists.length > 0 && (
          <>
            <Stack.V gap={20}>
              <Heading3 color="text">Mailing List</Heading3>
              <Body color="text">
                Here you can opt in to our mailing list to receive updates about
                Noya.
              </Body>
              <Stack.V
                border={`1px solid ${theme.colors.dividerSubtle}`}
                padding={20}
                background={theme.colors.sidebar.background}
                gap={10}
              >
                {emailLists.map((emailList) => (
                  <Stack.H key={emailList.id}>
                    <Stack.V flex="1" gap={4}>
                      <Small color="text" fontWeight="bold">
                        {emailList.name}
                      </Small>
                      <Small color="textMuted" flex="1">
                        {emailList.description}
                      </Small>
                    </Stack.V>
                    <Stack.H flex="1">
                      <Switch
                        variant="secondary"
                        value={emailList.optIn}
                        onChange={(newValue) => {
                          client.emailLists.update(emailList.id, {
                            optIn: newValue,
                          });
                        }}
                      />
                    </Stack.H>
                  </Stack.H>
                ))}
              </Stack.V>
            </Stack.V>
          </>
        )}
      </Stack.V>
    </AppLayout>
  );
}
