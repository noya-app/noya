export type ActionHandlers<Actions extends any[]> = {
  [K in Actions[0]]: (...params: Extract<Actions, [K, ...any[]]>) => void;
};

export type StateSwitch<State extends { type: string }, Result> = {
  [K in State['type']]: (state: Extract<State, { type: K }>) => Result;
};

export const callHandler = <
  State extends { type: string },
  Args extends any[],
  Result = void,
>(
  handlers: Partial<
    {
      [K in State['type']]: State extends { type: K }
        ? (state: State, ...args: Args) => Result
        : never;
    }
  >,
  state: State,
  key: State['type'],
  args: Args,
) => {
  if (state.type === key && key in handlers) {
    handlers[key]?.(state, ...args);
  }
};

export function stateSwitch<
  State extends { type: string },
  Args extends any[],
  Result = void,
>(
  handlers: Partial<
    {
      [K in State['type']]: State extends { type: K }
        ? (state: State, ...args: Args) => Result
        : never;
    }
  >,
) {
  return (state: State) =>
    (key: State['type'], ...args: Args) => {
      return handlers[key]?.(state, ...args);
    };
}

// export function stateSwitch<K extends string, State extends { type: K }>(
//   handlers: StateSwitch<State, void>,
// ) {
//   return (state: State) => {
//     const key = state.type
//     const handler = handlers[key];
//     if (handler) handler(state);
//   };

//   // return (state: State) => getKeyValue<State['type'], State>(state.type, state, handlers);
// }
