import { cartesianProduct } from '@noya-app/noya-utils';
import { path } from 'imfs';
import { loadDesignSystem } from 'noya-module-loader';
import { clean } from './clean';
import { sortFiles } from './common';
import { compileDesignSystem } from './compileDesignSystem';
import { reduceIterator, reduceIteratorChunked } from './processWork';
import { CompilerConfiguration } from './types';
import { sanitizePackageName } from './validate';

const colorNames = [
  // 'slate',
  // 'gray',
  // 'zinc',
  // 'neutral',
  // 'stone',
  // 'red',
  // 'orange',
  // 'amber',
  // 'yellow',
  // 'lime',
  // 'green',
  // 'emerald',
  'teal',
  // 'cyan',
  // 'sky',
  'blue',
  // 'indigo',
  // 'violet',
  // 'purple',
  // 'fuchsia',
  // 'pink',
  // 'rose',
];

const colorModes = ['light' as const, 'dark' as const];

export function compilePermutation(
  configuration: CompilerConfiguration,
  {
    colorMode,
    colorName,
    libraryName,
  }: { colorMode: 'light' | 'dark'; colorName: string; libraryName: string },
) {
  const allDSFiles: Record<string, string> = {};

  const {
    files: dsFiles,
    dependencies,
    devDependencies,
    allExportMap,
  } = compileDesignSystem({
    ...configuration,
    ds: {
      ...configuration.ds,
      config: {
        ...configuration.ds.config,
        colorMode,
        colors: {
          ...configuration.ds.config.colors,
          primary: colorName,
        },
      },
    },
    designSystemDefinition: configuration.resolvedDefinitions[libraryName],
    includeTailwindBase: libraryName === 'vanilla',
    spreadTheme: libraryName.endsWith('radix'),
    exportTypes:
      libraryName === 'vanilla'
        ? [
            'html-css',
            'html-tailwind',
            'react-css',
            'react-css-modules',
            'react-tailwind',
          ]
        : libraryName.endsWith('chakra') || libraryName.endsWith('radix')
        ? ['react']
        : ['react-css', 'react-tailwind'],
  });

  const basename = path.basename(libraryName);

  Object.assign(
    allDSFiles,
    addPathPrefix(
      dsFiles,
      `src/app/${basename}/${colorName}/${colorMode}/components/`,
    ),
  );

  for (const [componentName, exportMap] of Object.entries(allExportMap)) {
    for (const [exportType, files] of Object.entries(exportMap)) {
      Object.assign(
        allDSFiles,
        addPathPrefix(
          files,
          `public/${basename}/${colorName}/${colorMode}/components/${componentName}/${exportType}/`,
        ),
      );
    }
  }

  return {
    files: allDSFiles,
    dependencies,
    devDependencies,
  };
}

type ProgressCallback = (progress: {
  current: number;
  total: number;
  fileCount: number;
}) => void;

export function* compileGenerator(
  configuration: CompilerConfiguration,
  onProgress?: ProgressCallback,
) {
  const allDefinitions = Object.keys(configuration.resolvedDefinitions);

  const allDSFiles: Record<string, string> = {};
  const allDependencies: Record<string, string> = {};
  const allDevDependencies: Record<string, string> = {};

  const allPermutations = cartesianProduct(
    allDefinitions,
    colorModes,
    colorNames,
  );

  let fileCount = 0;

  for (let i = 0; i < allPermutations.length; i++) {
    const [libraryName, colorMode, colorName] = allPermutations[i];
    const { files, dependencies, devDependencies } = compilePermutation(
      configuration,
      { libraryName, colorMode, colorName },
    );

    fileCount += Object.keys(files).length;

    Object.assign(allDSFiles, files);
    Object.assign(allDependencies, dependencies);
    Object.assign(allDevDependencies, devDependencies);

    onProgress?.({ current: i + 1, total: allPermutations.length, fileCount });

    yield allDSFiles;
  }

  const files = {
    ...allDSFiles,

    'src/app/layout.tsx': `export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
`,
    'src/app/page.tsx': clean(`import Link from 'next/link'

export default function Page() {
  return (
    <div>
      <h1 className="text-4xl">Components</h1>
      <ul>
        ${Object.keys(allDSFiles)
          .filter(
            (path) => path.endsWith('/page.tsx') && !path.startsWith('public'),
          )
          .map((p) => {
            const url = p.replace('src/app', '').replace('/page.tsx', '');
            return `<li><Link href="${url}">${url}</Link></li>`;
          })
          .join('\n')}
      </ul>
      <h1 className="text-4xl">Public</h1>
      <ul>
        ${Object.keys(allDSFiles)
          .filter((path) => path.startsWith('public'))
          .map((p) => {
            const url = p.replace('public', '/__NOYA_REPLACE_BASE_PATH__');
            return `<li><a href="${url}">${url}</a></li>`;
          })
          .join('\n')}
      </ul>
    </div>
  )
}`),
    'tailwind.config.ts': `import type { Config } from 'tailwindcss'

const config: Config = {
  important: true,
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {},
  plugins: [],
}
export default config
`,
    'package.json': JSON.stringify(
      {
        name: sanitizePackageName(configuration.name),
        version: '0.0.1',
        scripts: {},
        dependencies: allDependencies,
        devDependencies: allDevDependencies,
      },
      null,
      2,
    ),
  };

  return sortFiles(files);
}

export function compile(
  configuration: CompilerConfiguration,
): Record<string, string> {
  return reduceIterator(
    compileGenerator(configuration),
    (previous, current) => current,
    {},
  );
}

export async function compileAsync(
  configuration: Omit<CompilerConfiguration, 'resolvedDefinitions'> & {
    definitions: string[];
  },
  onProgress?: ProgressCallback,
) {
  const resolvedDefinitions = Object.fromEntries(
    await Promise.all(
      configuration.definitions.map(async (name) => [
        name,
        await loadDesignSystem(name, configuration.ds.source.version),
      ]),
    ),
  );

  const resolvedConfiguration = { ...configuration, resolvedDefinitions };

  return await reduceIteratorChunked(
    compileGenerator(resolvedConfiguration, onProgress),
    1000,
    (previous, current) => current,
    {},
  );
}

function addPathPrefix(
  files: Record<string, string>,
  prefix: string,
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(files).map(([key, value]) => [prefix + key, value]),
  );
}
