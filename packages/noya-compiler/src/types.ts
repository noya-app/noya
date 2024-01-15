import { DesignSystemDefinition } from '@noya-design-system/protocol';
import { DS } from 'noya-api';
import { NoyaComponent } from 'noya-component';

export interface CompilerConfiguration {
  name: string;
  ds: DS;
  resolvedDefinitions: Record<string, DesignSystemDefinition>;
  filterComponents?: (component: NoyaComponent) => boolean;
}

export type ResolvedCompilerConfiguration = CompilerConfiguration & {
  designSystemDefinition: DesignSystemDefinition;
};
