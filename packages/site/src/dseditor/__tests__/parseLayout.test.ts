import { NoyaGeneratorProp, NoyaPrimitiveElement } from 'noya-component';
import { parseLayout } from '../componentLayout';

// Sometimes generated layouts will have references to images that don't exist
// e.g. logo.png, so we ignore any generated image srcs
it('ignores image src', () => {
  const element = parseLayout(
    '<Image src="https://via.placeholder.com/150" />',
    'random-image',
  ) as NoyaPrimitiveElement;

  const prop0 = element.props[0] as NoyaGeneratorProp;

  expect(prop0.type).toEqual('generator');
  expect(prop0.generator).toEqual('random-image');
  expect(prop0.query).toEqual('landscape');
});

it('parses image alt', () => {
  const element = parseLayout(
    '<Image alt="Shopping related image" />',
    'random-image',
  ) as NoyaPrimitiveElement;

  const prop0 = element.props[0] as NoyaGeneratorProp;

  expect(prop0.type).toEqual('generator');
  expect(prop0.name).toEqual('src');
  expect(prop0.query).toEqual('shopping');
});

it('uses geometric image', () => {
  const element = parseLayout('<Image />', 'geometric') as NoyaPrimitiveElement;

  const prop0 = element.props[0] as NoyaGeneratorProp;

  expect(prop0.type).toEqual('generator');
  expect(prop0.generator).toEqual('geometric');
  expect(prop0.query).toEqual('v1/');
});

// eslint-disable-next-line jest/no-commented-out-tests
// it('parses', () => {
//   const element = parseLayout(`
//     <div name="Restaurant Card" class="bg-white shadow rounded p-4 flex flex-col gap-2">
//       <Image name="Restaurant Logo" class="w-16 h-16 rounded-full self-center" alt="Restaurant logo"/>

//       <div name="Restaurant Info" class="flex flex-col items-center gap-1">
//         <span name="Restaurant Name" class="text-lg font-medium">Restaurant Name</span>
//         <span name="Cuisine Type" class="text-gray-500 text-sm">Cuisine Type</span>

//         <div name="Location and Rating" class="flex items-center gap-2">
//           <svg name="Location Icon" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
//             <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
//           </svg>
//           <span name="Location" class="text-gray-500 text-sm">Location</span>

//           <svg name="Star Icon" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
//             <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
//           </svg>
//           <span name="Rating" class="text-yellow-500 font-bold text-sm">4.5</span>
//         </div>
//       </div>
//     </div>
//   `) as NoyaPrimitiveElement;

//   console.log(
//     ElementHierarchy.diagram(element, (node) => {
//       if (node.type !== 'noyaString') {
//         if (
//           node.type === 'noyaPrimitiveElement' &&
//           node.componentID === imageSymbolId
//         ) {
//           const srcProp = node.props.find((prop) => prop.name === 'src');

//           const generatorType =
//             srcProp?.type === 'generator' ? srcProp.generator : undefined;

//           return `<Image generator="${generatorType}">` + node.name ?? '';
//         }

//         return (
//           `<${PRIMITIVE_ELEMENT_NAMES[node.componentID]}>` + node.name ?? ''
//         );
//       }

//       return node.value;
//     }),
//   );
// });
