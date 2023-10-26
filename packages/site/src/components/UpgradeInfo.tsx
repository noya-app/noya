import {
  Body,
  Button,
  DesignSystemConfigurationProvider,
  Divider,
  DividerVertical,
  Heading2,
  Heading3,
  Heading4,
  lightTheme,
  ListView,
  Small,
  Spacer,
  Stack,
  useDesignSystemTheme,
} from 'noya-designsystem';
import { DotFilledIcon } from 'noya-icons';
import React from 'react';
import PremiumTemplateMosaic from '../assets/PremiumTemplateMosaic.png';

const upgradePerks = [
  'Unlimited projects & blocks',
  '3,000 AI-generations per month',
  'Access to premium template library',
  'React code export',
  'Early access to new features',
  'Priority support',
];

export function UpgradeInfo({
  onClickUpgrade,
}: {
  onClickUpgrade: () => void;
}) {
  const theme = useDesignSystemTheme();

  return (
    <Stack.H
    // pointerEvents="none"
    >
      <Stack.V flex="1">
        <Stack.V padding={'40px'} flex="1">
          <Small fontWeight="bold">Special Early Adopter Offer</Small>
          <Spacer.Vertical size={8} />
          <Heading2 fontSize={'28px'} color="text" lineHeight={1}>
            Upgrade to Noya Professional
          </Heading2>
          <Spacer.Vertical size={20} />
          <Divider />
          <Spacer.Vertical size={20} />
          <Small color="text">
            <Small color="secondaryBright">Save 30%</Small> by upgrading now and
            lock in this price <Small fontStyle="italic">forever</Small>!
          </Small>
          <Spacer.Vertical size={20} />
          <DesignSystemConfigurationProvider theme={lightTheme} platform="key">
            <Stack.V
              // padding={'0px 10px'}
              background="rgba(255,255,255,1)"
              // background="rgba(255,255,255,0.07)"
              border={`1px solid ${theme.colors.divider}`}
              borderRadius={4}
            >
              <Stack.H justifyContent="center">
                <Heading3
                  color="secondaryBright"
                  position="relative"
                  fontWeight={300}
                >
                  <Body
                    color="textMuted"
                    display={'inline'}
                    textDecoration="line-through"
                    position="absolute"
                    left={'-60px'}
                    top={'20px'}
                    fontSize="26px"
                  >
                    $10
                  </Body>
                  <span
                    style={{
                      fontSize: '50px',
                      fontWeight: 500,
                    }}
                  >
                    $7
                  </span>
                  /month
                </Heading3>
              </Stack.H>
              <Divider />
              <Stack.H gap={8} justifyContent="center" padding={'6px 0'}>
                <Small color="textMuted" fontSize={'11px'}>
                  Billed yearly, or $8.40/month billed monthly
                </Small>
              </Stack.H>
            </Stack.V>
          </DesignSystemConfigurationProvider>
          {/* <Spacer.Vertical size={10} />
          <Small color="secondaryBright">
            30% off <Small fontStyle="italic">forever</Small> if you upgrade
            now, as thanks for being an early adopter!
          </Small> */}
          <Spacer.Vertical size={30} />
          <Heading4 color="text">Here's what you'll get</Heading4>
          <Spacer.Vertical size={4} />
          <ListView.Root
            keyExtractor={(item) => item}
            data={upgradePerks}
            renderItem={(item) => (
              <ListView.Row key={item}>
                <DotFilledIcon />
                <Spacer.Horizontal size={10} />
                <Small color="text">{item}</Small>
              </ListView.Row>
            )}
          />
          <Spacer.Vertical size={30} />
          <Stack.V pointerEvents="all" alignItems="stretch">
            <Button
              variant="secondaryBright"
              size="large"
              onClick={onClickUpgrade}
            >
              Upgrade
            </Button>
          </Stack.V>
        </Stack.V>
      </Stack.V>
      <DividerVertical />
      <Stack.V
        background={`url(${PremiumTemplateMosaic.src})`}
        backgroundSize="cover"
        backgroundPosition="center"
        flex="1"
        breakpoints={{
          800: {
            display: 'none',
          },
        }}
      />
    </Stack.H>
  );
}
