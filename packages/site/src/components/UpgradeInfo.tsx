import { VStack } from '@chakra-ui/react';
import {
  Body,
  Button,
  Heading2,
  Heading3,
  Heading4,
  ListView,
  Small,
  Spacer,
  Stack,
} from 'noya-designsystem';
import { DotFilledIcon } from 'noya-icons';
import React from 'react';

const upgradePerks = [
  'Unlimited Projects & Blocks',
  '3,000 AI-generated content per month',
  'Access to premium template library',
  'React code export',
  'Early access to new features',
  'Priority support',
];

export function UpgradeInfo() {
  return (
    <Stack.H
    // pointerEvents="none"
    >
      <Stack.V flex="1">
        <Stack.V padding={'40px'} flex="1">
          <Heading2 color="text">Upgrade to Noya Professional</Heading2>
          <Spacer.Vertical size={10} />
          <Stack.H
            // padding={'0px 10px'}
            background="rgba(255,255,255,0.07)"
            // border={`1px solid rgba(255,255,255,0.1)`}
            borderRadius={4}
            justifyContent="center"
          >
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
          <Spacer.Vertical size={10} />
          <Small color="secondaryBright">
            30% off <Small fontStyle="italic">forever</Small> if you upgrade
            now, as thanks for being an early adopter!
          </Small>
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
          <VStack pointerEvents={'all'} alignItems="stretch">
            <Button variant="secondaryBrightLarge">Upgrade</Button>
          </VStack>
        </Stack.V>
      </Stack.V>
      <Stack.V background={'teal'} flex="1"></Stack.V>
    </Stack.H>
  );
}
