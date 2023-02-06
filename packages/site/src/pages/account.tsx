import { format } from 'date-fns';
import { useNoyaBilling } from 'noya-api';
import {
  Body,
  Button,
  Heading2,
  Heading3,
  Small,
  Spacer,
  Stack,
  useDesignSystemTheme,
} from 'noya-designsystem';
import React from 'react';
import { AppLayout } from '../components/AppLayout';
import { Toolbar } from '../components/Toolbar';

export default function Account() {
  const { portalUrl, subscriptions, availableProducts } = useNoyaBilling();
  const theme = useDesignSystemTheme();

  return (
    <AppLayout toolbar={<Toolbar />}>
      <Stack.V flex="1">
        <Stack.H alignItems="center">
          <Heading2 color="text">Account</Heading2>
        </Stack.H>
        <Spacer.Vertical size={44} />
        <Stack.V gap={20}>
          <Heading3 color="text">Subscription</Heading3>
          {subscriptions
            .filter((subscription) => subscription.status === 'active')
            .map((subscription) => {
              const priceIds = subscription.items.map((item) => item.price.id);
              const product = availableProducts.find((product) =>
                product.prices.some((price) => priceIds.includes(price.id)),
              );
              const periodEnd = new Date(subscription.currentPeriodEnd);

              return (
                <Stack.V
                  key={subscription.id}
                  border={`1px solid ${theme.colors.dividerSubtle}`}
                  padding={20}
                  background={theme.colors.sidebar.background}
                >
                  <Body color="text" fontWeight="bold">
                    {product?.name}
                  </Body>
                  <Spacer.Vertical size={4} />
                  {subscription.items.map((item) => {
                    return (
                      <Small color="text">
                        ${item.price.unitAmount / 100} /{' '}
                        {item.price.recurringInterval}
                      </Small>
                    );
                  })}
                  <Spacer.Vertical size={4} />
                  {/* <Small color="text">
                    Started {format(new Date(subscription.created), 'MMM d, yyyy')}
                  </Small> */}
                  <Small color="text">
                    {subscription.cancelAtPeriodEnd ? 'Ends' : 'Renews'}{' '}
                    {format(periodEnd, 'MMM d, yyyy')}
                  </Small>
                  <Spacer.Vertical size={20} />
                  <Stack.H>
                    {portalUrl && (
                      <Button
                        onClick={() => {
                          window.location.href = portalUrl;
                        }}
                      >
                        Manage Subscription
                      </Button>
                    )}
                  </Stack.H>
                </Stack.V>
              );
            })}
        </Stack.V>
      </Stack.V>
    </AppLayout>
  );
}
