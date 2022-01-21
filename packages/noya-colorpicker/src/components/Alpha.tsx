// import React, { memo } from 'react';
// import styled from 'styled-components';
// import { useColorPicker } from '../contexts/ColorPickerContext';
// import { clamp } from '../utils/clamp';
// import { hsvaToHslaString } from '../utils/convert';
// import { round } from '../utils/round';
// import { Interaction, Interactive } from './Interactive';
// import Pointer from './Pointer';

// const Container = styled.div<{ colorFrom: string; colorTo: string }>(
//   ({ colorFrom, colorTo }) => ({
//     position: 'relative',
//     height: '8px',
//     borderRadius: '8px',
//     boxShadow: '0 0 0 1px rgba(0,0,0,0.2) inset',
//     backgroundColor: '#fff',
//     backgroundImage: [
//       `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" fill-opacity=".05"><rect x="4" width="4" height="4"/><rect y="4" width="4" height="4"/></svg>')`,
//       `linear-gradient(90deg, ${colorFrom}, ${colorTo})`,
//     ].join(', '),
//     zIndex: 2,
//   }),
// );

// export default memo(function Alpha(): JSX.Element {
//   const [hsva, onChange] = useColorPicker();

//   const handleMove = (interaction: Interaction) => {
//     onChange({ a: interaction.left });
//   };

//   const handleKey = (offset?: Interaction) => {
//     // Alpha always fit into [0, 1] range
//     if (!offset) return;
//     onChange({ a: clamp(hsva.a + offset.left) });
//   };

//   // We use `Object.assign` instead of the spread operator
//   // to prevent adding the polyfill (about 150 bytes gzipped)
//   const colorFrom = hsvaToHslaString(Object.assign({}, hsva, { a: 0 }));
//   const colorTo = hsvaToHslaString(Object.assign({}, hsva, { a: 1 }));

//   return (
//     <Container colorFrom={colorFrom} colorTo={colorTo}>
//       <Interactive
//         onMove={handleMove}
//         onKey={handleKey}
//         aria-label="Alpha"
//         aria-valuetext={`${round(hsva.a * 100)}%`}
//       >
//         <Pointer left={hsva.a} />
//       </Interactive>
//     </Container>
//   );
// });
