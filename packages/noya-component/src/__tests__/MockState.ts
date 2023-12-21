import { applySelectionDiff } from '../applyDiff';
import { Model } from '../builders';
import {
  createResolvedNode,
  createSelectionWithDiff,
  instantiateResolvedComponent,
} from '../traversal';
import {
  NoyaComponent,
  NoyaNode,
  NoyaResolvedNode,
  SelectedComponent,
} from '../types';

export class MockState {
  components: Record<string, NoyaComponent> = {};

  findComponent = (componentID: string) => {
    return this.components[componentID];
  };

  createResolvedNode(node: NoyaNode) {
    return createResolvedNode({
      findComponent: this.findComponent,
      node,
    });
  }

  addComponent(options: Parameters<typeof Model.component>[0]) {
    const component = Model.component(options);
    this.components[component.componentID] = component;
    return component;
  }

  instantiateComponent(selection: string | SelectedComponent) {
    if (typeof selection === 'string') {
      selection = { componentID: selection };
    }

    return instantiateResolvedComponent(this.findComponent, selection);
  }

  clonedStateWithComponent(component: NoyaComponent) {
    const state = new MockState();
    state.components = {
      ...this.components,
      [component.componentID]: component,
    };
    return state;
  }

  updateWithNewResolvedNode({
    componentID,
    newResolvedNode,
    debug,
  }: {
    componentID: string;
    newResolvedNode: NoyaResolvedNode;
    debug?: boolean;
  }) {
    const selectionWithDiff = createSelectionWithDiff({
      selection: { componentID },
      findComponent: this.findComponent,
      newResolvedNode: newResolvedNode,
      debug,
    });

    const newSelection = applySelectionDiff({
      selection: selectionWithDiff,
      component: this.findComponent(componentID)!,
      enforceSchema: (node) => node,
      enforceSchemaInDiff: (diff) => diff,
      findComponent: this.findComponent,
      debug,
    });

    const newState = this.clonedStateWithComponent(newSelection.component);
    const newRoot = instantiateResolvedComponent(
      newState.findComponent,
      { componentID },
      debug,
    );

    if (debug) {
      // console.log(ResolvedHierarchy.diagram(newRoot));
    }

    return {
      selectionWithDiff,
      newSelection,
      newRoot,
      newState,
    };
  }
}
