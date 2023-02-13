import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
} from 'react';
import { usePersistentState } from '../utils/clientStorage';

export const ayonOnboardingStep = [
  'started',
  'insertedBlock',
  'configuredBlockType',
  'configuredBlockText',
  'dismissedSupportInfo',
] as const;

export type AyonOnboardingStep = typeof ayonOnboardingStep[number];

export type OnboardingContextValue = {
  onboardingStep?: AyonOnboardingStep;
  setOnboardingStep: (step: AyonOnboardingStep) => void;
};

const OnboardingContext = createContext<OnboardingContextValue>({
  setOnboardingStep: () => {},
});

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [onboardingStep, _setOnboardingStep] =
    usePersistentState<AyonOnboardingStep>('ayonOnboardingStep', 'started');

  const setOnboardingStep = useCallback(
    (step: AyonOnboardingStep) => {
      if (!onboardingStep) return;

      const currentIndex = ayonOnboardingStep.indexOf(onboardingStep);
      const nextIndex = ayonOnboardingStep.indexOf(step);

      if (nextIndex > currentIndex) {
        _setOnboardingStep(step);
      }
    },
    [_setOnboardingStep, onboardingStep],
  );

  const contextValue = useMemo(
    () => ({
      onboardingStep: onboardingStep ?? undefined,
      setOnboardingStep,
    }),
    [onboardingStep, setOnboardingStep],
  );

  return (
    <OnboardingContext.Provider value={contextValue}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  return useContext(OnboardingContext);
}
