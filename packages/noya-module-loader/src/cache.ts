import { DesignSystemDefinition } from '@noya-design-system/protocol';

// Keeping this in a separate file seems to fix a require cycle issue
export const DesignSystemCache = new Map<string, DesignSystemDefinition>();
