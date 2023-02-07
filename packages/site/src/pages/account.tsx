import { format } from 'date-fns';
import { NoyaAPI, useNoyaBilling } from 'noya-api';
import {
  Body,
  Button,
  DividerVertical,
  Heading2,
  Heading3,
  Small,
  Spacer,
  Stack,
  Switch,
  useDesignSystemTheme,
} from 'noya-designsystem';
import { CheckIcon } from 'noya-icons';
import React from 'react';
import { AppLayout } from '../components/AppLayout';
import { Toolbar } from '../components/Toolbar';

function Card({
  name,
  periodEnd,
  cancelAtPeriodEnd,
  priceDescription,
  callToActionPrimary,
  callToActionText,
  callToActionUrl,
  children,
}: {
  name: string;
  periodEnd?: string;
  cancelAtPeriodEnd?: boolean;
  priceDescription: string;
  callToActionPrimary?: boolean;
  callToActionText?: string;
  callToActionUrl?: string | null;
  children?: React.ReactNode;
}) {
  const theme = useDesignSystemTheme();

  return (
    <Stack.H
      border={`1px solid ${theme.colors.dividerSubtle}`}
      padding={20}
      background={theme.colors.sidebar.background}
    >
      <Stack.V flex="1">
        <Body color="text" fontWeight="bold">
          {name}
        </Body>
        <Spacer.Vertical size={4} />
        <Small color="text">{priceDescription}</Small>
        <Spacer.Vertical size={4} />
        {periodEnd && (
          <Small color={cancelAtPeriodEnd ? 'primaryLight' : 'text'}>
            {cancelAtPeriodEnd ? 'Ends' : 'Renews'} {periodEnd}
          </Small>
        )}
        <Spacer.Vertical />
        {callToActionUrl && (
          <>
            <Spacer.Vertical size={20} />
            <Stack.H>
              <Button
                variant={callToActionPrimary ? 'primary' : 'normal'}
                onClick={() => {
                  window.location.href = callToActionUrl;
                }}
              >
                {callToActionText}
              </Button>
            </Stack.H>
          </>
        )}
      </Stack.V>
      {children && (
        <>
          <DividerVertical />
          <Stack.V flex="1">{children}</Stack.V>
        </>
      )}
    </Stack.H>
  );
}

function FeatureItem({ children }: { children: React.ReactNode }) {
  return (
    <Small color="text" lineHeight="15px">
      <CheckIcon style={{ display: 'inline', verticalAlign: 'top' }} />
      <Spacer.Horizontal size={6} inline />
      {children}
    </Small>
  );
}

function describePrice(price: NoyaAPI.Price) {
  if (price.recurringInterval === 'month') {
    return `$${price.unitAmount / 100} / month`;
  }

  return `$${price.unitAmount / (100 * 12)} / month (billed annually)`;
}

function ProfessionalPlanFeatures() {
  return (
    <Stack.V gap={8} padding={'0 20px'}>
      <FeatureItem>Unlimited projects</FeatureItem>
      <FeatureItem>Unlimited blocks</FeatureItem>
      <FeatureItem>3,000 AI-generated content/mo</FeatureItem>
      <FeatureItem>Export to Figma or Sketch</FeatureItem>
      <FeatureItem>Export React code</FeatureItem>
      <FeatureItem>Priority support</FeatureItem>
    </Stack.V>
  );
}

function StarterPlanFeatures() {
  return (
    <Stack.V gap={8} padding={'0 20px'}>
      <FeatureItem>10 projects</FeatureItem>
      <FeatureItem>200 blocks</FeatureItem>
      <FeatureItem>30 AI-generated content/mo</FeatureItem>
      <FeatureItem>Export to Figma or Sketch</FeatureItem>
    </Stack.V>
  );
}

export default function Account() {
  const { portalUrl, subscriptions, availableProducts, loading } =
    useNoyaBilling();

  const activeSubscriptions = subscriptions.filter(
    (subscription) => subscription.status === 'active',
  );

  const [isAnnualBilling, setIsAnnualBilling] = React.useState(true);

  return (
    <AppLayout toolbar={<Toolbar />}>
      <Stack.V flex="1" gap={44}>
        <Stack.H alignItems="center">
          <Heading2 color="text">Account</Heading2>
        </Stack.H>
        {!loading && (
          <>
            <Stack.V gap={20}>
              <Heading3 color="text">Current Plan</Heading3>
              {activeSubscriptions.map((subscription) => {
                const priceIds = subscription.items.map(
                  (item) => item.price.id,
                );
                const product = availableProducts.find((product) =>
                  product.prices.some((price) => priceIds.includes(price.id)),
                );

                if (!product) return null;

                const periodEnd = new Date(subscription.currentPeriodEnd);
                const price = subscription.items[0].price;

                return (
                  <Card
                    name={product.name}
                    periodEnd={format(periodEnd, 'MMM d, yyyy')}
                    cancelAtPeriodEnd={subscription.cancelAtPeriodEnd}
                    priceDescription={describePrice(price)}
                    callToActionText="Manage Subscription"
                    callToActionUrl={portalUrl}
                  >
                    {product.name.includes('Professional') ? (
                      <ProfessionalPlanFeatures />
                    ) : (
                      <StarterPlanFeatures />
                    )}
                  </Card>
                );
              })}
              {activeSubscriptions.length === 0 && (
                <Card name="Noya Starter" priceDescription="Free">
                  <StarterPlanFeatures />
                </Card>
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
                    <Card
                      key={product.id}
                      name={product.name}
                      priceDescription={describePrice(price)}
                      callToActionUrl={price.url}
                      callToActionText="Subscribe"
                    >
                      <ProfessionalPlanFeatures />
                    </Card>
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
