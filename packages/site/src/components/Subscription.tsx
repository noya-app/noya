import { isSameMonth, parseISO } from 'date-fns';
import Link from 'next/link';
import { NoyaAPI } from 'noya-api';
import {
  Body,
  Button,
  DividerVertical,
  IconButton,
  Progress,
  Small,
  Spacer,
  Stack,
  useDesignSystemTheme,
} from 'noya-designsystem';
import Sketch from 'noya-file-format';
import { CheckIcon } from 'noya-icons';
import { Layers } from 'noya-state';
import React, { ReactNode } from 'react';
import styled from 'styled-components';
import { writeSymbolId } from '../ayon/blocks/symbolIds';

const CloseButtonContainer = styled.div(({ theme }) => ({
  position: 'absolute',
  top: 4,
  right: 4,
}));

export function Card({
  title,
  subtitle,
  action,
  children,
  closable,
  onClose,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children?: ReactNode;
  closable?: boolean;
  onClose?: () => void;
}) {
  const theme = useDesignSystemTheme();

  return (
    <Stack.H
      border={`1px solid ${theme.colors.dividerSubtle}`}
      padding={20}
      background={theme.colors.sidebar.background}
      gap={20}
    >
      <Stack.V flex="1">
        <Body color="text" fontWeight="bold">
          {title}
        </Body>
        <Spacer.Vertical size={4} />
        <Small color="text">{subtitle}</Small>
        {/* <Spacer.Vertical /> */}
        {action && (
          <>
            <Spacer.Vertical size={20} />
            <Stack.H>{action}</Stack.H>
          </>
        )}
      </Stack.V>
      {children && (
        <>
          <DividerVertical />
          <Stack.V flex="1" position="relative">
            {children}
          </Stack.V>
        </>
      )}
      {closable && (
        <CloseButtonContainer>
          <IconButton iconName="Cross2Icon" onClick={onClose} />
        </CloseButtonContainer>
      )}
    </Stack.H>
  );
}

export function SubscriptionCard({
  name,
  periodEnd,
  cancelAtPeriodEnd,
  priceDescription,
  callToActionAccented,
  callToActionText,
  callToActionUrl,
  children,
}: {
  name: string;
  periodEnd?: string;
  cancelAtPeriodEnd?: boolean;
  priceDescription: string;
  callToActionAccented?: boolean;
  callToActionText?: string;
  callToActionUrl?: string | null;
  children?: ReactNode;
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
                variant={callToActionAccented ? 'secondary' : 'normal'}
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

export function FeatureItem({ children }: { children: ReactNode }) {
  return (
    <Small color="text" lineHeight="15px">
      <CheckIcon style={{ display: 'inline', verticalAlign: 'top' }} />
      <Spacer.Horizontal size={6} inline />
      {children}
    </Small>
  );
}

export function describePrice(price: NoyaAPI.Price) {
  if (price.recurringInterval === 'month') {
    return `$${price.unitAmount / 100} / month`;
  }

  return `$${price.unitAmount / (100 * 12)} / month (billed annually)`;
}

export function AccountDetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <Stack.H>
      <Small color="text" width={60} fontWeight="bold">
        {label}
      </Small>
      <Small color="text">{value}</Small>
    </Stack.H>
  );
}

export function ProfessionalPlanFeatures() {
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

export function StarterPlanFeatures() {
  return (
    <Stack.V gap={8} padding={'0 20px'}>
      <FeatureItem>10 projects</FeatureItem>
      <FeatureItem>200 blocks</FeatureItem>
      <FeatureItem>30 AI-generated content/mo</FeatureItem>
      <FeatureItem>Export to Figma or Sketch</FeatureItem>
    </Stack.V>
  );
}

export type SubscriptionUsageItem = {
  name: string;
  count: number;
  limit: number;
};

// Show usage meter after creating a 2nd project or a 21st block
export const usageMeterThreshold = 0.11;

export function SubscriptionUsageMeter({
  items,
}: {
  items: SubscriptionUsageItem[];
}) {
  return (
    <Stack.V padding={'0 20px'}>
      <Spacer.Vertical size={6} />
      <Small color="text" fontWeight="bold">
        Current Usage
      </Small>
      <Spacer.Vertical size={10} />
      <Stack.H>
        <Stack.V gap={8}>
          {items.map((item) => (
            <Small key={item.name} color="text" lineHeight="15px">
              {item.count} {item.name}
            </Small>
          ))}
        </Stack.V>
        <Spacer.Horizontal size={20} />
        <Stack.V gap={8} flex="1">
          {items.map((item) => (
            <Stack.H key={item.name} height={15} alignItems="center">
              <Progress
                flex="1"
                value={(item.count / item.limit) * 100}
                variant={
                  item.count / item.limit > usageMeterThreshold
                    ? 'warning'
                    : undefined
                }
              />
            </Stack.H>
          ))}
        </Stack.V>
        <Spacer.Horizontal size={10} />
        <Stack.V gap={8} flex="0">
          {items.map((item) => (
            <Stack.H key={item.name} height={15} alignItems="center">
              <Small
                color={
                  item.count / item.limit > usageMeterThreshold
                    ? 'warning'
                    : 'text'
                }
                lineHeight="15px"
                fontSize="11px"
                fontWeight={500}
              >
                <span style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {Math.round((item.count / item.limit) * 100)}%
                </span>
              </Small>
            </Stack.H>
          ))}
        </Stack.V>
      </Stack.H>
    </Stack.V>
  );
}

const SubscriptionUsageMeterScallContainer = styled.a(({ theme }) => ({
  display: 'flex',
  alignItems: 'stretch',
  margin: '0 0 0 -10px',
  '&:hover': {
    opacity: 0.85,
  },
}));

export function SubscriptionUsageMeterSmall({
  item,
}: {
  item: SubscriptionUsageItem;
}) {
  const theme = useDesignSystemTheme();

  return (
    <Link href="/account" passHref>
      <SubscriptionUsageMeterScallContainer>
        <Spacer.Horizontal size={10} />
        <Stack.H padding="0 4px" alignItems="center">
          <Stack.V>
            <span
              style={{
                color: theme.colors.textMuted,
                letterSpacing: '0.3px',
                fontSize: '11px',
                lineHeight: '1',
              }}
            >
              Current Plan
              <Spacer.Horizontal size={4} inline />
              <span style={{ opacity: 0.5 }}>⁠–</span>
              <Spacer.Horizontal size={4} inline />
              <span style={{ fontWeight: 500 }}>Upgrade</span>
            </span>
            <Spacer.Vertical size={6} />
            <Progress
              height={4}
              value={(item.count / item.limit) * 100}
              variant="warning"
            />
            <Spacer.Vertical size={2} />
          </Stack.V>
        </Stack.H>
        <Spacer.Horizontal size={10} />
        <DividerVertical />
      </SubscriptionUsageMeterScallContainer>
    </Link>
  );
}

export function findSubscribedProduct(
  subscriptions: NoyaAPI.Subscription[],
  products: NoyaAPI.Product[],
) {
  const activeSubscriptions = subscriptions.filter(
    (subscription) => subscription.status === 'active',
  );

  const priceIds = activeSubscriptions.flatMap((subscription) =>
    subscription.items.map((item) => item.price.id),
  );

  return products.find((product) =>
    product.prices.some((price) => priceIds.includes(price.id)),
  );
}

export function isProfessionalPlan(product: NoyaAPI.Product) {
  return product.name.includes('Professional');
}

function getAllBlocks(file: NoyaAPI.File): Sketch.SymbolInstance[] {
  if (file.data.type !== 'io.noya.ayon') return [];

  const blocks = file.data.document.pages.flatMap((page) =>
    Layers.findAll<Sketch.SymbolInstance>(page, Layers.isSymbolInstance),
  );

  return blocks;
}

function isRecentBlock(today: Date, block: Sketch.SymbolInstance) {
  if (
    block.symbolID !== writeSymbolId ||
    !block.resolvedBlockData ||
    !block.resolvedBlockData.resolvedAt
  ) {
    return;
  }

  const resolvedAt = parseISO(block.resolvedBlockData.resolvedAt);

  return isSameMonth(today, resolvedAt);
}

const FreePlanLimits = {
  blocks: 200,
  projects: 10,
  generatedContent: 30,
};

function getSubscriptionUsage(files: NoyaAPI.File[]) {
  const projectsCount = files.length;
  const blocks = files.flatMap(getAllBlocks);
  const blocksCount = blocks.length;
  const generatedContentCount = blocks.filter((block) =>
    isRecentBlock(new Date(), block),
  ).length;

  const usage: SubscriptionUsageItem[] = [
    {
      name: 'projects',
      count: projectsCount,
      limit: FreePlanLimits.projects,
    },
    {
      name: 'blocks',
      count: blocksCount,
      limit: FreePlanLimits.blocks,
    },
    {
      name: 'AI content',
      count: generatedContentCount,
      limit: FreePlanLimits.generatedContent,
    },
  ];

  return usage;
}

export function getSubscriptionOverage(
  files: NoyaAPI.File[],
  subscriptions: NoyaAPI.Subscription[],
  availableProducts: NoyaAPI.Product[],
  usageThreshold: number,
) {
  const product = findSubscribedProduct(subscriptions, availableProducts);

  if (product) return [];

  const items = getSubscriptionUsage(files).filter(
    (item) => item.count / item.limit >= usageThreshold,
  );

  return items;
}
