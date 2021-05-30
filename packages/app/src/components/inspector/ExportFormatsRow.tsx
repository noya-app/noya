import { Cross1Icon } from '@radix-ui/react-icons';
import Sketch from '@sketch-hq/sketch-file-format-ts';
import { InputField, Select, Spacer } from 'noya-designsystem';
import { memo } from 'react';
import styled from 'styled-components';

const Row = styled.div(({ theme }) => ({
  flex: '1',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
}));

interface Props {
  id: string;
  exportFormat: Sketch.ExportFormat;
  onChangeScale: (amount: string) => void;
  onChangeName: (name: string) => void;
  onChangeFileFormat: (amount: Sketch.ExportFileFormat) => void;
  onChangeNamingScheme: (amount: Sketch.ExportFormatNamingScheme) => void;
}

export default memo(function ExportFormatsRow({
  id,
  exportFormat,
  onChangeScale,
  onChangeName,
  onChangeFileFormat,
}: Props) {
  const fileFormatOptions = Object.values(Sketch.ExportFileFormat);

  return (
    <Row id={id}>
      <InputField.Root>
        <InputField.Input
          value={exportFormat.scale.toString() + 'x'}
          onSubmit={onChangeScale}
        />
      </InputField.Root>
      <Spacer.Horizontal size={8} />
      <InputField.Root>
        <InputField.Input
          list={['Prefix', 'Suffix']}
          value={exportFormat.name}
          placeholder={
            exportFormat.namingScheme ===
            Sketch.ExportFormatNamingScheme.Prefix.valueOf()
              ? 'Prefix'
              : 'Suffix'
          }
          onSubmit={onChangeName}
        />
      </InputField.Root>
      <Spacer.Horizontal size={8} />
      <Select
        id="symbol-instance-source"
        value={exportFormat.fileFormat}
        options={fileFormatOptions}
        getTitle={(id) => id.toUpperCase()}
        onChange={onChangeFileFormat}
      />
      <Spacer.Horizontal size={8} />
      <Cross1Icon />
    </Row>
  );
});
