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
): (state: State, key: State['type'], ...args: Args) => Result | undefined {
  return (state: State, key: State['type'], ...args: Args) => {
    return handlers[key]?.(state, ...args);
  };
}

export function handleActionType<
  State extends { type: string },
  Args extends any[],
  Result extends {},
>(
  handlers: Partial<
    {
      [K in State['type']]: State extends { type: K }
        ? (state: State, ...args: Args) => Result
        : never;
    }
  >,
): (state: State, key: State['type'], ...args: Args) => Partial<Result> {
  return (state: State, key: State['type'], ...args: Args) => {
    return handlers[key]?.(state, ...args) ?? {};
  };
}
