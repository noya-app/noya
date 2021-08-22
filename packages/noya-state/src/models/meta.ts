import Sketch from 'noya-file-format';

const app = Sketch.BundleId.PublicRelease;
const build = 109185;
const commit = '1cee2bd6f09ef2258eb62d151bbe50dd6c3af3f2';
const version = 134;
const variant = 'NONAPPSTORE';
const appVersion = '70.4';
const compatibilityVersion = 99;

// We don't include `fonts` or `pagesAndArtboards` since they don't seem
// to be necessary for Sketch to load the resulting file
const meta: Sketch.Meta = {
  app,
  appVersion,
  autosaved: 0,
  build,
  commit,
  compatibilityVersion,
  created: {
    commit,
    appVersion,
    build,
    app,
    compatibilityVersion,
    version,
    variant,
  },
  pagesAndArtboards: {},
  saveHistory: [`${variant}.${build}`],
  variant,
  version,
};

export default meta;
