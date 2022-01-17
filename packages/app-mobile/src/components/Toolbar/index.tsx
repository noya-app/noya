import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
  TouchableOpacity,
} from 'react-native';
import { Theme } from '../../constants';
import { CanvasElement, ToolMode } from '../../types';

interface ToolbarProps {
  toolMode: ToolMode;
  onClear: () => void;
  onAddRect: () => void;
  onAddImage: () => void;
  onAddPath: () => void;
  onClosePath: () => void;
  onFinishPath: () => void;
  selectedElements?: CanvasElement[];
}

const Toolbar: React.FC<ToolbarProps> = (props) => {
  const {
    toolMode,
    onAddRect,
    onAddImage,
    onAddPath,
    onClear,
    onClosePath,
    onFinishPath,
  } = props;

  const colorScheme = useColorScheme();

  const backgroundStyle = {
    backgroundColor: Theme[colorScheme ?? 'light'].backgroundColor,
  };

  const content = useMemo(() => {
    const textStyle = {
      color: Theme[colorScheme ?? 'light'].textColor,
    };

    if (toolMode === ToolMode.CreatePath) {
      return (
        <>
          <TouchableOpacity onPress={onClosePath}>
            <View>
              <Text style={[textStyle, styles.buttonText]}>Close Path</Text>
            </View>
          </TouchableOpacity>
          <View style={styles.spacer} />
          <TouchableOpacity onPress={onFinishPath}>
            <View>
              <Text style={[textStyle, styles.buttonText]}>
                Finish Path Edit
              </Text>
            </View>
          </TouchableOpacity>
        </>
      );
    }

    return (
      <>
        <TouchableOpacity onPress={onAddRect}>
          <View>
            <Text style={[textStyle, styles.buttonText]}>Add Rectangle</Text>
          </View>
        </TouchableOpacity>
        <View style={styles.spacer} />
        <TouchableOpacity onPress={onAddImage}>
          <View>
            <Text style={[textStyle, styles.buttonText]}>Add Image</Text>
          </View>
        </TouchableOpacity>
        <View style={styles.spacer} />
        <TouchableOpacity onPress={onAddPath}>
          <View>
            <Text style={[textStyle, styles.buttonText]}>Add Path</Text>
          </View>
        </TouchableOpacity>
        <View style={styles.spacer} />
        <TouchableOpacity onPress={onClear}>
          <View>
            <Text style={[textStyle, styles.buttonText]}>Clear artboard</Text>
          </View>
        </TouchableOpacity>
      </>
    );
  }, [
    onAddRect,
    onAddImage,
    onAddPath,
    onClear,
    onClosePath,
    onFinishPath,
    toolMode,
    colorScheme,
  ]);

  return <View style={[styles.container, backgroundStyle]}>{content}</View>;
};

export default Toolbar;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    width: 250,
  },
  buttonText: {
    fontSize: 24,
  },
  spacer: { height: 15 },
});
