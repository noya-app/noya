import * as amplitude from '@amplitude/analytics-browser';

export { amplitude };

export type ILogEvent = (
  ...args: Parameters<typeof amplitude.logEvent>
) => void;
