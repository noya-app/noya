import {
  AvatarProps,
  ButtonProps,
  CheckboxProps,
  DesignSystemDefinition,
  InputProps,
  LinkProps,
  RadioProps,
  SelectProps,
  SwitchProps,
  TagProps,
  component,
} from '@noya-design-system/protocol';
import { SketchModel } from 'noya-sketch-model';
import React, { CSSProperties } from 'react';
import { heroSymbol } from '../ayon/symbols/composed/HeroSymbol';
import { librarySymbolMap } from '../ayon/symbols/symbols';
import { renderDynamicContent } from '../ayon/utils/renderDynamicContent';

export function renderDSOverview({
  system,
  theme,
  backgroundColor,
}: {
  system: DesignSystemDefinition;
  theme: any;
  backgroundColor: string;
}) {
  const Button: React.FC<ButtonProps> = system.components[component.id.Button];
  const Checkbox: React.FC<CheckboxProps> =
    system.components[component.id.Checkbox];
  const Radio: React.FC<RadioProps> = system.components[component.id.Radio];
  const Select: React.FC<SelectProps> = system.components[component.id.Select];
  const Switch: React.FC<SwitchProps> = system.components[component.id.Switch];
  const Tag: React.FC<TagProps> = system.components[component.id.Tag];
  const Link: React.FC<LinkProps> = system.components[component.id.Link];
  const Input: React.FC<InputProps> = system.components[component.id.Input];
  const Textarea: React.FC<InputProps> =
    system.components[component.id.Textarea];
  const Avatar: React.FC<AvatarProps> = system.components[component.id.Avatar];

  const getSymbolMaster = (symbolId: string) => librarySymbolMap[symbolId];

  const hero = renderDynamicContent(
    system,
    SketchModel.artboard({
      layers: [
        SketchModel.symbolInstance({
          symbolID: heroSymbol.symbolID,
        }),
      ],
    }),
    getSymbolMaster,
    undefined,
    theme,
    'automatic-layout',
  );

  const sectionStyle: CSSProperties = {
    padding: '20px',
    borderRadius: '4px',
    background: 'white',
    border: '1px solid #eee',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    position: 'relative',
  } as const;

  const subSectionStyle = {
    display: 'flex',
    gap: '20px',
    flexWrap: 'wrap',
    alignItems: 'center',
    position: 'relative',
  } as const;

  const content = (
    <div
      style={{
        padding: '20px',
        gap: '12px',
        display: 'flex',
        flexDirection: 'column',
        background: backgroundColor,
        minHeight: '100%',
      }}
    >
      <span>Primitive Elements</span>
      <div style={sectionStyle}>
        <div style={subSectionStyle}>
          <Button variant="solid">Button</Button>
          <Button variant="outline">Button</Button>
          <Button variant="text">Button</Button>
          <Tag variant="solid">Tag</Tag>
          <Tag variant="outline">Tag</Tag>
          <Link href="#">Link</Link>
          <Avatar
            name="Devin Abbott"
            style={{
              width: '32px',
              height: '32px',
            }}
          />
          <Avatar
            style={{
              width: '32px',
              height: '32px',
            }}
          />
        </div>
        <div style={subSectionStyle}>
          <Checkbox checked label="Checkbox" />
          <Radio checked label="Radio" />
          <Select
            options={['Option 1', 'Option 2', 'Option 3']}
            value="Option 1"
          />
          <Switch checked />
        </div>
        <div style={subSectionStyle}>
          <Input placeholder="Input" />
          <Textarea placeholder="Textarea" />
        </div>
      </div>
      <span>Hero</span>
      <div style={sectionStyle}>{hero}</div>
    </div>
  );

  return content;
}
