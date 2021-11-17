import { YogaEdge, YogaNode } from 'yoga-layout-prebuilt';

export interface LayoutProperties {
  alignContent?: Parameters<YogaNode['setAlignContent']>[0];
  alignItems?: Parameters<YogaNode['setAlignItems']>[0];
  alignSelf?: Parameters<YogaNode['setAlignSelf']>[0];
  aspectRatio?: Parameters<YogaNode['setAspectRatio']>[0];
  border?: Record<YogaEdge, Parameters<YogaNode['setBorder']>[1]>;
  display?: Parameters<YogaNode['setDisplay']>[0];
  flex?: Parameters<YogaNode['setFlex']>[0];
  flexBasis?: Parameters<YogaNode['setFlexBasis']>[0];
  flexBasisPercent?: Parameters<YogaNode['setFlexBasisPercent']>[0];
  flexDirection?: Parameters<YogaNode['setFlexDirection']>[0];
  flexGrow?: Parameters<YogaNode['setFlexGrow']>[0];
  flexShrink?: Parameters<YogaNode['setFlexShrink']>[0];
  flexWrap?: Parameters<YogaNode['setFlexWrap']>[0];
  height?: Parameters<YogaNode['setHeight']>[0];
  heightAuto?: boolean;
  heightPercent?: Parameters<YogaNode['setHeightPercent']>[0];
  justifyContent?: Parameters<YogaNode['setJustifyContent']>[0];
  margin?: Record<YogaEdge, Parameters<YogaNode['setMargin']>[1]>;
  marginAuto?: Record<YogaEdge, boolean>;
  marginPercent?: Record<YogaEdge, Parameters<YogaNode['setMarginPercent']>[1]>;
  maxHeight?: Parameters<YogaNode['setMaxHeight']>[0];
  maxHeightPercent?: Parameters<YogaNode['setMaxHeightPercent']>[0];
  maxWidth?: Parameters<YogaNode['setMaxWidth']>[0];
  maxWidthPercent?: Parameters<YogaNode['setMaxWidthPercent']>[0];
  minHeight?: Parameters<YogaNode['setMinHeight']>[0];
  minHeightPercent?: Parameters<YogaNode['setMinHeightPercent']>[0];
  minWidth?: Parameters<YogaNode['setMinWidth']>[0];
  minWidthPercent?: Parameters<YogaNode['setMinWidthPercent']>[0];
  overflow?: Parameters<YogaNode['setOverflow']>[0];
  padding?: Record<YogaEdge, Parameters<YogaNode['setPadding']>[1]>;
  paddingPercent?: Record<
    YogaEdge,
    Parameters<YogaNode['setPaddingPercent']>[1]
  >;
  position?: Record<YogaEdge, Parameters<YogaNode['setPosition']>[1]>;
  positionPercent?: Record<
    YogaEdge,
    Parameters<YogaNode['setPositionPercent']>[1]
  >;
  positionType?: Parameters<YogaNode['setPositionType']>[0];
  width?: Parameters<YogaNode['setWidth']>[0];
  widthAuto?: boolean;
  widthPercent?: Parameters<YogaNode['setWidthPercent']>[0];
  // setMeasureFunc(measureFunc: (width: number, widthMeasureMode: YogaMeasureMode, height: number, heightMeasureMode: YogaMeasureMode) => { width?: number; height?: number } | null): void;
}

export interface LayoutNode {
  children: LayoutNode[];
  properties: LayoutProperties;
}
