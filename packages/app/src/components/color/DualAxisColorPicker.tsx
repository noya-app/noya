import styled from 'styled-components';

export type HSLAColor = { h: number; s: number; l: number; a: number };

function hslaToString(color: HSLAColor): string {
  const [h] = [color.h].map((component) => Math.floor(component * 255));

  return `hsla(${h}, ${color.s * 100}%, ${color.l * 100}%, ${color.a})`;
}

const Colormap = styled.div<{ colorString: string }>(({ colorString }) => ({
  position: 'relative',
  borderRadius: '4px',
  backgroundColor: colorString,
  backgroundImage: [
    'linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,1))',
    'linear-gradient(to right, rgba(255,255,255,1), rgba(255,255,255,0))',
  ].join(', '),
  boxShadow: '0 0 0 1px rgba(0,0,0,0.1) inset',
  minHeight: '150px',
}));

const Cursor = styled.div(() => ({
  width: '10px',
  height: '10px',
  borderRadius: '10px',
  border: '2px solid white',
  boxShadow: '0 0 1px 1px rgba(0,0,0,0.4), 0 0 1px 1px rgba(0,0,0,0.4) inset',
}));

interface Props {
  color: HSLAColor;
}

export default function DualAxisColorPicker({ color }: Props) {
  const colorString = hslaToString(color);

  console.log(colorString);

  return (
    <Colormap colorString={colorString}>
      <Cursor
        style={{
          position: 'absolute',
          top: '40px',
          left: '40px',
        }}
      />
    </Colormap>
  );
}
