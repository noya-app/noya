import React, { memo, PropsWithChildren } from 'react';
import { requireNativeComponent, ViewStyle } from 'react-native';

type KeyCommandInput = string;

enum KeyCommandModifier {
  Shift = 'Shift',
  Command = 'Command',
  Control = 'Control',
  AlphaShift = 'AlphaShift',
}

interface KeyCommand {
  title: string;
  input: KeyCommandInput;
  modifiers: KeyCommandModifier[];
}

interface KeyCommandEvent {
  input: KeyCommandInput;
  modifiers: KeyCommandModifier[];
}

interface ResponderHostComponent {
  style?: ViewStyle;
  onKeyCommand?: (event: KeyCommandEvent) => void;
}

type ResponderViewProps = PropsWithChildren<{
  style?: ViewStyle;
  keyCommands?: KeyCommand[];
  onKeyCommand?: (event: KeyCommandEvent) => void;
}>;

const ComponentName = 'ResponderView';
const RNResponderView =
  requireNativeComponent<ResponderHostComponent>(ComponentName);

const ResponderView = memo(function ResponderView(props: ResponderViewProps) {
  const { children, style, keyCommands, onKeyCommand } = props;

  return (
    <RNResponderView style={style} onKeyCommand={onKeyCommand}>
      {children}
    </RNResponderView>
  );
});

export default ResponderView;
