import { suggestedClasses } from '../suggestions';
import { config, tailwindColors } from '../tailwind.config';

const context = {
  theme: (key: string) => {
    const result = config.theme[key];
    if (typeof result === 'function') {
      const computed = result(context as any);
      return computed;
    } else {
      return result;
    }
  },
  colors: tailwindColors,
  breakpoints: () => {},
};

it('selects theme values', () => {
  expect((context.theme('spacing') as any)[0]).toEqual('0px');
  expect((context.theme('inset') as any)[0]).toEqual('0px');
});

it('generates default suggestions', () => {
  expect(suggestedClasses).toMatchSnapshot();
});
