import { Dialog } from '@noya-app/noya-designsystem';
import { NoyaAPI } from 'noya-api';
import React from 'react';
import { UpgradeInfo } from '../components/UpgradeInfo';

export function UpgradeDialog({
  showUpgradeDialog,
  setShowUpgradeDialog,
  availableProducts,
}: {
  showUpgradeDialog: boolean;
  setShowUpgradeDialog: (value: boolean) => void;
  availableProducts: NoyaAPI.Product[];
}) {
  return (
    <Dialog
      style={{
        maxWidth: '900px',
        padding: 0,
      }}
      open={showUpgradeDialog}
      onOpenChange={(value) => {
        setShowUpgradeDialog(value);
      }}
      closeOnInteractOutside={false}
    >
      <UpgradeInfo
        onClickUpgrade={() => {
          const monthlyPrice = availableProducts[0].prices.find(
            (price) => price.recurringInterval === 'month',
          )!;
          window.open(
            monthlyPrice.url +
              `&couponId=${process.env.NEXT_PUBLIC_NOYA_PROFESSIONAL_COUPON_ID}`,
          );
          setShowUpgradeDialog(false);
        }}
      />
    </Dialog>
  );
}
