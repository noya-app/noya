import { Model } from '../builders';
import { createResolvedNode, instantiateResolvedComponent } from '../traversal';
import { NoyaComponent, NoyaNode, SelectedComponent } from '../types';

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
}
