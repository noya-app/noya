import { observable } from '@legendapp/state';
import produce from 'immer';
import { Rect } from 'noya-geometry';
import { memoizedGetter, range } from 'noya-utils';
import { z } from 'zod';
import { fileReducer } from './collection';
import { findAndParseJSONArray } from './json';
import {
  INoyaNetworkClient,
  NoyaNetworkClient,
  NoyaRequestSnapshot,
} from './networkClient';
import {
  NoyaBilling,
  NoyaEmailList,
  NoyaFile,
  NoyaFileData,
  NoyaGeneratedName,
  NoyaJson,
  NoyaMetadataItem,
  NoyaRandomImageResponse,
  NoyaSession,
  NoyaUserData,
} from './schema';
import { asyncIterableToString } from './streaming';
import { throttleAsync } from './throttleAsync';

type NoyaClientOptions = { networkClient: INoyaNetworkClient };

type NoyaFetchPolicy = 'no-cache' | 'cache-and-network' | 'network-only';

export type NoyaImageGenerator = 'random-image' | 'geometric';

type GeneratedLayout = {
  provider?: string;
  imageGenerator: NoyaImageGenerator;
  layout: string;
};

const GENERATED_LAYOUT_COUNT = 8;
export const GENERATED_PAGE_NAME_COUNT = 5;

export type GeneratedPageName = {
  name: string;
  width?: number;
  height?: number;
  loading: boolean;
  key: string;
};

export class NoyaClient {
  networkClient: INoyaNetworkClient;
  files$ = observable<{
    files: NoyaFile[];
    loading: boolean;
  }>({
    files: [],
    loading: true,
  });
  session$ = observable<NoyaSession | null>(null);
  billing$ = observable<NoyaBilling & { loading: boolean }>({
    availableProducts: [],
    portalUrl: null,
    subscriptions: [],
    loading: true,
  });
  emailLists$ = observable<{
    emailLists: NoyaEmailList[];
    loading: boolean;
  }>({
    emailLists: [],
    loading: true,
  });
  userData$ = observable<{
    userData: NoyaUserData | undefined;
    loading: boolean;
  }>({
    userData: undefined,
    loading: true,
  });
  generatedNames$ = observable<Record<string, NoyaGeneratedName[]>>({});
  loadingNames$ = observable<Record<string, boolean>>({});
  generatedDescriptions$ = observable<Record<string, string>>({});
  loadingDescriptions$ = observable<Record<string, boolean>>({});
  generatedDescriptionIndex: Record<string, number> = {};
  generatedLayouts$ = observable<Record<string, GeneratedLayout[]>>({});
  loadingLayouts$ = observable<Record<string, boolean[]>>({});
  generatedLayoutIndex: Record<string, number> = {};
  randomImages$ = observable<Record<string, NoyaRandomImageResponse>>({});
  loadingRandomImages$ = observable<Record<string, boolean>>({});
  randomIcons$ = observable<Record<string, { url: string; data: string }>>({});
  loadingRandomIcons$ = observable<Record<string, boolean>>({});
  generatedPageNames$ = observable<(GeneratedPageName | null)[]>([]);
  generatedPageComponentNames$ = observable<(GeneratedPageName | null)[]>([]);
  requests$ = observable<NoyaRequestSnapshot[]>([]);

  constructor({ networkClient }: NoyaClientOptions) {
    this.networkClient = networkClient;

    networkClient.addRequestListener((request) => {
      this.requests$.unshift(request.snapshot());

      request.addListener(() => {
        this.requests$.set((requests) =>
          requests.map((r) => (r.id === request.id ? request.snapshot() : r)),
        );

        // Only keep the last 200 requests
        if (this.requests$.get().length > 200) {
          this.requests$.set((requests) => requests.slice(0, 200));
        }
      });
    });

    if (typeof window !== 'undefined') {
      this.#fetchSession();
      this.#fetchFiles();
      this.#fetchBilling();
      this.#fetchUserData();
      // this.#fetchEmailLists();
    }
  }

  reloadFiles() {
    if (this.files$.get().loading) return;

    this.files$.set({ files: [], loading: true });

    this.#fetchFiles();
  }

  get random() {
    return memoizedGetter(this, 'random', {
      image: this.#fetchRandomImage,
      icon: this.#fetchRandomIcon,
      resetImage: this.#resetRandomImage,
      resetIcon: this.#resetRandomIcon,
      resetPageName: this.#resetGeneratedPageName,
      resetPageComponentName: this.#resetGeneratedComponentName,
    });
  }

  randomImageCacheKey = (options: { id?: string; query: string }) => {
    const { id, query } = options;
    const normalized = query.trim().toLowerCase();
    return id ? `${id}:${normalized}` : normalized;
  };

  randomIconCacheKey = this.randomImageCacheKey;

  #fetchRandomImage = async (
    options: { id?: string } & Parameters<
      INoyaNetworkClient['random']['image']
    >[0],
  ) => {
    const key = this.randomImageCacheKey(options);

    if (this.loadingRandomImages$[key].get()) return;

    const existing = this.randomImages$[key].get();

    if (existing) return existing;

    this.loadingRandomImages$.set((prev) => ({ ...prev, [key]: true }));

    const data = await this.networkClient.random.image(options);

    this.randomImages$.set((prev) => ({ ...prev, [key]: data }));
    this.loadingRandomImages$.set((prev) => ({ ...prev, [key]: false }));
  };

  #fetchRandomIcon = async (
    options: { id?: string } & Parameters<
      INoyaNetworkClient['random']['icon']
    >[0],
  ) => {
    const key = this.randomImageCacheKey(options);

    // For some reason .get was crashing. This is a workaround.
    // It seems like legendapp/state is optimization the getter after
    // detecting a hot path, but it's not working correctly.
    const existingLoading = { ...this.loadingRandomIcons$ };
    const existingIcons = { ...this.randomIcons$ };

    if (existingLoading[key]) return;

    const existing = existingIcons[key];

    if (existing) return existing;

    this.loadingRandomIcons$.set((prev) => ({ ...prev, [key]: true }));

    const data = await this.networkClient.random.icon({
      ...options,
      preferredCollection: 'mdi',
    });
    let iconUrl = '';
    let iconText = '';

    if (data.icons.length > 0) {
      // Fetch icon
      iconUrl = data.icons[0];
      const iconResponse = await fetch(iconUrl);
      iconText = await iconResponse.text();
    }

    this.randomIcons$.set((prev) => ({
      ...prev,
      [key]: { url: iconUrl, data: iconText },
    }));
    this.loadingRandomIcons$.set((prev) => ({ ...prev, [key]: false }));
  };

  #resetRandomImage = (options: { id?: string; query: string }) => {
    const key = this.randomImageCacheKey(options);

    this.randomImages$[key].delete();
    this.loadingRandomImages$[key].delete();
  };

  #resetRandomIcon = (options: { id?: string; query: string }) => {
    const key = this.randomIconCacheKey(options);

    this.randomIcons$[key].delete();
    // this.loadingRandomIcons$[key].delete();
  };

  get generate() {
    return memoizedGetter(this, 'generate', {
      pageNames: this.generatePageNames,
      pageComponentNames: this.generatePageComponentNames,
      componentNames: this.#generateComponentNames,
      componentDescription: this.#generateComponentDescription,
      componentLayouts: this.#generateComponentLayouts,
      resetGeneratedPageName: this.#resetGeneratedPageName,
      resetComponentDescription: this.#resetGenerateComponentDescription,
      resetComponentLayouts: this.#resetGenerateComponentLayouts,
    });
  }

  #getGeneratePageNameKey = (options: {
    projectName: string;
    projectDescription: string;
  }) => {
    const { projectName, projectDescription } = options;

    return [projectName, projectDescription]
      .map((value) => value.trim())
      .filter(Boolean)
      .join(':');
  };

  #getGeneratePageComponentNameKey = (options: {
    projectName: string;
    projectDescription: string;
    pageName: string;
  }) => {
    const { projectName, projectDescription, pageName } = options;

    return [projectName, projectDescription, pageName]
      .map((value) => value.trim())
      .filter(Boolean)
      .join(':');
  };

  #getGeneratePageNamePrompt = ({
    projectName,
    projectDescription,
    existingPageNames,
  }: {
    projectName: string;
    projectDescription: string;
    existingPageNames: string[];
  }) => {
    const name = `I'm creating a website/app with the title \`\`\`${projectName}\`\`\`.`;
    const description = projectDescription
      ? `A short description of my website/app is: \`\`\`${projectDescription}\`\`\`.`
      : '';
    const existing =
      existingPageNames.length > 0
        ? `I already have the pages: ${existingPageNames.join(', ')}.`
        : '';
    const question = [
      `What are the titles of the`,
      existingPageNames.length > 0 ? 'OTHER' : '',
      `key pages on my website/app?`,
    ]
      .filter(Boolean)
      .join(' ');
    const shape = `Respond ONLY with a JSON array of strings (page names), e.g. ["Page 1", "Page 2", ...]`;

    return [name, description, existing, question, shape]
      .filter(Boolean)
      .join('\n');
  };

  generatePageNames = async (options: {
    projectName: string;
    projectDescription: string;
    existingPageNames: string[];
  }): Promise<void> => {
    const rangeArray = range(0, GENERATED_PAGE_NAME_COUNT);
    const key = this.#getGeneratePageNameKey(options);

    // Delete any item where the key doesn't match, or where the name matches
    // an existing/rejected page name
    this.generatedPageNames$.set((prev) =>
      rightPad(
        prev.filter(
          (item) =>
            item &&
            item.key === key &&
            !options.existingPageNames.includes(item.name) &&
            !this.#rejectedPageNames.has(item.name),
        ),
        GENERATED_PAGE_NAME_COUNT,
        null,
      ),
    );

    // If all names are already generated, return
    if (rangeArray.every((i) => !!this.generatedPageNames$.get()[i])) return;

    // console.log('generating page names', options);

    // Compact any gaps in the list
    this.generatedPageNames$.set((prev) =>
      rightPad(compact(prev), GENERATED_PAGE_NAME_COUNT, null),
    );

    const prompt = this.#getGeneratePageNamePrompt(options);

    // Mark all empty names as loading
    this.generatedPageNames$.set((prev) =>
      rangeArray.map((i) =>
        prev[i] ? prev[i] : { name: '', loading: true, key },
      ),
    );

    const iterator = await this.networkClient.generate.fromPrompt(prompt);

    const text = await asyncIterableToString(iterator);

    const parsed = z.array(z.string()).safeParse(findAndParseJSONArray(text));
    const names = parsed.success ? parsed.data : [];

    let nameIndex = 0;

    const existingNames = new Set([
      ...options.existingPageNames,
      ...this.generatedPageNames$
        .get()
        .flatMap((item) => (item?.name ? [item.name] : [])),
    ]);

    // Mark empty/loading names as loaded and assign a name
    this.generatedPageNames$.set((prev) =>
      rangeArray.map((i) => {
        const item = prev[i];

        if (item && !item.loading) return item;

        // If the key doesn't match, discard this response
        if (item?.key !== key) return item;

        let name: string | undefined;

        // Loop through the names until we find one that doesn't exist
        do {
          name = names[nameIndex++];
        } while (existingNames.has(name) || this.#rejectedPageNames.has(name));

        return {
          name: name || 'New Page',
          loading: false,
          key: key,
        };
      }),
    );

    // console.log('Generated page names:', this.generatedPageNames$.get());
  };

  // Set of strings rejected by the user
  #rejectedPageNames = new Set<string>();

  #resetGeneratedPageName = (
    index: number,
    action: 'accept' | 'reject',
    options?: Parameters<typeof this.generatePageNames>[0],
  ) => {
    const rangeArray = range(0, GENERATED_PAGE_NAME_COUNT);
    const generated = this.generatedPageNames$.get()[index]?.name;

    // Add the name to the rejected set
    if (action === 'reject' && generated) {
      this.#rejectedPageNames.add(generated);
    }

    this.generatedPageNames$.set((prev) =>
      rangeArray.map((i) => (i === index ? null : prev[i])),
    );

    if (options && generated) {
      const existingPageNames =
        action === 'accept'
          ? [...options.existingPageNames, generated]
          : options.existingPageNames;

      this.generatePageNames({ ...options, existingPageNames });
    }
  };

  #generateComponentNames = async (options: {
    name: string;
    rect?: Rect;
  }): Promise<NoyaGeneratedName[]> => {
    const name = options.name.trim();
    const key = name.toLowerCase();

    const existing = this.generatedNames$[key].get();

    if (Array.isArray(existing) && existing.length > 0) return existing;

    this.loadingNames$.set((prev) => ({ ...prev, [key]: true }));

    const result = await this.networkClient.generate.componentNames({
      ...options,
      name,
    });

    this.generatedNames$.set((prev) => ({ ...prev, [key]: result }));
    this.loadingNames$.set((prev) => ({ ...prev, [key]: false }));

    return result;
  };

  #getGeneratePageComponentNamePrompt = ({
    projectName,
    projectDescription,
    pageName,
    existingComponentNames,
  }: {
    projectName: string;
    projectDescription: string;
    pageName: string;
    existingComponentNames: string[];
  }) => {
    const name = `I'm creating a website/app with the title \`\`\`${projectName}\`\`\`.`;
    const description = projectDescription
      ? `A short description of my website/app is: \`\`\`${projectDescription}\`\`\`.`
      : '';
    const pName = `I'm currently creating a page with the title \`\`\`${pageName}\`\`\`.`;
    const existing =
      existingComponentNames.length > 0
        ? `On this page I already have the components: ${existingComponentNames.join(
            ', ',
          )}.`
        : '';
    const question = [
      `What are the names of the`,
      existingComponentNames.length > 0 ? 'OTHER' : '',
      `key components on this page? Also suggest a width and height for each component on a 1280x720 canvas.`,
    ]
      .filter(Boolean)
      .join(' ');
    const shape = `Respond ONLY with a JSON array of objects containing { name, width, height }, e.g. \`\`\`[{ name: "Component 1", width: 300, height: 720 }, { name: "Component 2", width: 600, height: 400 }, ...]\`\`\``;

    return [name, description, pName, existing, question, shape]
      .filter(Boolean)
      .join('\n');
  };

  generatePageComponentNames = async (options: {
    projectName: string;
    projectDescription: string;
    pageName: string;
    existingComponentNames: string[];
  }): Promise<void> => {
    const rangeArray = range(0, GENERATED_PAGE_NAME_COUNT);
    const key = this.#getGeneratePageComponentNameKey(options);

    // Delete any item where the key doesn't match, or where the name matches
    // an existing/rejected page name
    this.generatedPageComponentNames$.set((prev) =>
      rightPad(
        prev.filter(
          (item) =>
            item &&
            item.key === key &&
            !options.existingComponentNames.includes(item.name) &&
            !this.#rejectedPageNames.has(item.name),
        ),
        GENERATED_PAGE_NAME_COUNT,
        null,
      ),
    );

    // If all names are already generated, return
    if (rangeArray.every((i) => !!this.generatedPageComponentNames$.get()[i]))
      return;

    // console.log('generating page component names', options);

    // Compact any gaps in the list
    this.generatedPageComponentNames$.set((prev) =>
      rightPad(compact(prev), GENERATED_PAGE_NAME_COUNT, null),
    );

    const prompt = this.#getGeneratePageComponentNamePrompt(options);

    // Mark all empty names as loading
    this.generatedPageComponentNames$.set((prev) =>
      rangeArray.map((i) =>
        prev[i] ? prev[i] : { name: '', loading: true, key },
      ),
    );

    const iterator = await this.networkClient.generate.fromPrompt(prompt);

    const text = await asyncIterableToString(iterator);

    const itemSchema = z.object({
      name: z.string(),
      width: z.number(),
      height: z.number(),
    });

    const parsed = z.array(itemSchema).safeParse(findAndParseJSONArray(text));
    const names = parsed.success ? parsed.data : [];

    let nameIndex = 0;

    const existingNames = new Set([
      ...options.existingComponentNames,
      ...this.generatedPageComponentNames$
        .get()
        .flatMap((item) => (item?.name ? [item.name] : [])),
    ]);

    // Mark empty/loading names as loaded and assign a name
    this.generatedPageComponentNames$.set((prev) =>
      rangeArray.map((i) => {
        const item = prev[i];

        if (item && !item.loading) return item;

        // If the key doesn't match, discard this response
        if (item?.key !== key) return item;

        let obj: z.infer<typeof itemSchema> | undefined;

        // Loop through the objects until we find one where the name doesn't exist
        do {
          obj = names[nameIndex++];
        } while (
          obj &&
          (existingNames.has(obj.name) ||
            this.#rejectedComponentNames.has(obj.name))
        );

        obj ??= { name: '', width: 200, height: 200 };

        return {
          name: obj.name,
          width: obj.width,
          height: obj.height,
          loading: false,
          key: key,
        };
      }),
    );

    // console.log('Generated page names:', this.generatedPageComponentNames$.get());
  };

  // Set of strings rejected by the user
  #rejectedComponentNames = new Set<string>();

  #resetGeneratedComponentName = (
    index: number,
    action: 'accept' | 'reject',
    options?: Parameters<typeof this.generatePageComponentNames>[0],
  ) => {
    const rangeArray = range(0, GENERATED_PAGE_NAME_COUNT);
    const generated = this.generatedPageComponentNames$.get()[index]?.name;

    // Add the name to the rejected set
    if (action === 'reject' && generated) {
      this.#rejectedComponentNames.add(generated);
    }

    this.generatedPageComponentNames$.set((prev) =>
      rangeArray.map((i) => (i === index ? null : prev[i])),
    );

    if (options && generated) {
      const existingComponentNames =
        action === 'accept'
          ? [...options.existingComponentNames, generated]
          : options.existingComponentNames;

      this.generatePageComponentNames({ ...options, existingComponentNames });
    }
  };

  componentDescriptionCacheKey = (name: string) => name.trim().toLowerCase();

  #generateComponentDescription = async (options: { name: string }) => {
    const name = options.name.trim();
    const key = this.componentDescriptionCacheKey(options.name);

    const existing = this.generatedDescriptions$[key].get();

    if (typeof existing === 'string') return existing;

    // If loading, return nothing (TODO: await fetched value)
    if (this.loadingDescriptions$[key].get()) return undefined;

    this.loadingDescriptions$.set((prev) => ({ ...prev, [key]: true }));
    this.generatedDescriptionIndex[key] =
      this.generatedDescriptionIndex[key] ?? 0;

    const iterator =
      await this.networkClient.generate.componentDescriptionFromName(
        name,
        this.generatedDescriptionIndex[key],
      );

    let text = '';
    for await (const chunk of iterator) {
      text += chunk;
      let nextText = text;
      this.generatedDescriptions$.set((prev) => ({ ...prev, [key]: nextText }));
    }

    this.loadingDescriptions$.set((prev) => ({ ...prev, [key]: false }));

    return iterator;
  };

  componentLayoutCacheKey = (name: string, description: string) =>
    `${name.trim().toLowerCase()}:${description.trim().toLowerCase()}`;

  #outstandingLayoutRequests = new Map<string, AbortController>();

  #generateComponentLayouts = async (options: {
    name: string;
    description: string;
    imageGenerator: 'random-image' | 'geometric';
  }) => {
    const name = options.name.trim();
    const description = options.description.trim();
    const key = this.componentLayoutCacheKey(name, description);

    const existing = this.generatedLayouts$[key].get();

    if (Array.isArray(existing)) return existing;

    const rangeArray = range(0, GENERATED_LAYOUT_COUNT);

    this.generatedLayouts$.set((prev) => ({
      ...prev,
      [key]: rangeArray.map((_) => ({
        layout: '',
        imageGenerator: options.imageGenerator,
      })),
    }));
    this.loadingLayouts$.set((prev) => ({
      ...prev,
      [key]: rangeArray.map((_) => true),
    }));
    this.generatedLayoutIndex[key] = this.generatedLayoutIndex[key] ?? 0;
    const baseIndex = this.generatedLayoutIndex[key];

    const abortController = new AbortController();
    this.#outstandingLayoutRequests.set(key, abortController);

    const promises = rangeArray.map(async (index) => {
      const generated =
        await this.networkClient.generate.componentLayoutsFromDescription(
          name,
          description,
          baseIndex + index,
          abortController.signal,
        );

      let text = '';
      for await (const chunk of generated.layout) {
        text += chunk;
        let nextText = text;

        this.generatedLayouts$.set((prev) => ({
          ...prev,
          [key]: updateIndex(prev[key], index, {
            provider: generated.provider,
            layout: nextText,
            imageGenerator: options.imageGenerator,
          }),
        }));
      }

      this.loadingLayouts$.set((prev) => ({
        ...prev,
        [key]: updateIndex(prev[key], index, false),
      }));
    });

    await Promise.all(promises);
  };

  #resetGenerateComponentDescription = (name: string) => {
    const key = name.trim().toLowerCase();

    this.generatedDescriptions$[key].delete();
    this.loadingDescriptions$[key].delete();
    const index = this.generatedDescriptionIndex[key];
    this.generatedDescriptionIndex[key] = index !== undefined ? index + 1 : 0;
  };

  #resetGenerateComponentLayouts = (name: string, description: string) => {
    const key = this.componentLayoutCacheKey(name, description);

    this.generatedLayouts$[key].delete();
    this.loadingLayouts$[key].delete();
    const index = this.generatedLayoutIndex[key];
    this.generatedLayoutIndex[key] =
      index !== undefined ? index + GENERATED_LAYOUT_COUNT : 0;

    const abortController = this.#outstandingLayoutRequests.get(key);
    abortController?.abort();
    this.#outstandingLayoutRequests.delete(key);
  };

  #fetchSession = async () => {
    const session = await this.networkClient.auth.session();
    this.session$.set(session);
  };

  #fetchUserData = async () => {
    const userData = await this.networkClient.userData.read();
    this.userData$.set({ userData, loading: false });
  };

  get emailLists() {
    return memoizedGetter(this, 'emailLists', {
      update: this.#updateEmailList,
    });
  }

  #fetchEmailLists = async () => {
    const emailLists = await this.networkClient.emailLists.list();
    this.emailLists$.set({ emailLists, loading: false });
  };

  #updateEmailList = async (id: string, data: { optIn: boolean }) => {
    await this.networkClient.emailLists.update(id, data);
    this.#fetchEmailLists();
  };

  get files() {
    return memoizedGetter(this, 'files', {
      read: this.networkClient.files.read,
      create: this.#createFile,
      update: this.#updateFile,
      updateFileName: this.#updateFileName,
      updateFileDocument: this.#updateFileDocument,
      delete: this.#deleteFile,
      refetch: this.#fetchFiles,
      download: {
        url: this.networkClient.files.download.url,
      },
      shares: {
        readFile: this.networkClient.files.shares.readSharedFile,
        create: this.networkClient.files.shares.create,
        list: this.networkClient.files.shares.list,
      },
    });
  }

  get assets() {
    return memoizedGetter(this, 'assets', {
      create: this.networkClient.assets.create,
      url: this.networkClient.assets.url,
    });
  }

  get metadata() {
    return memoizedGetter(this, 'metadata', {
      set: this.#setMetadata,
    });
  }

  get billing() {
    return memoizedGetter(this, 'billing', {
      read: this.#fetchBilling,
    });
  }

  #setMetadata = async (key: string, value: NoyaJson) => {
    this.userData$.userData.set((userData) => {
      if (!userData) return userData;

      return produce(userData, (draft) => {
        if (!draft) return;

        const index = draft.metadata.findIndex((item) => item.key === key);

        if (index === -1) {
          const metadataItem: NoyaMetadataItem = {
            key,
            value,
            url: `/api/user/metadata/${key}`,
          };
          draft.metadata.push(metadataItem);
        } else {
          draft.metadata[index].value = value;
        }
      });
    });

    await this.networkClient.metadata.set(key, value);
  };

  #fetchBilling = async () => {
    const billing = await this.networkClient.billing.read();
    this.billing$.set({ ...billing, loading: false });
  };

  #fetchFiles = async () => {
    const files = await this.networkClient.files.list();

    this.files$.set(({ files: currentFiles }) => ({
      files: fileReducer(currentFiles, { type: 'merge', files }),
      loading: false,
    }));
  };

  #createFile = async (
    fields: { data: NoyaFileData } | { shareId: string } | { fileId: string },
    { fetchPolicy }: { fetchPolicy?: NoyaFetchPolicy } = {
      fetchPolicy: 'cache-and-network',
    },
  ) => {
    const result = await this.networkClient.files.create(fields);

    if (fetchPolicy !== 'no-cache') {
      this.files$.files.set((files) =>
        fileReducer(files, { type: 'merge', files: [result] }),
      );
    }

    return result;
  };

  #getLocalFile = (id: string) => {
    const file = this.files$.get().files.find((file) => file.id === id);

    if (!file) throw new Error(`File not found: ${id}`);

    return file;
  };

  #updateFileName = async (id: string, name: string) => {
    const file = this.#getLocalFile(id);

    return this.#updateFile(id, { ...file.data, name });
  };

  #updateFileDocument = async (
    id: string,
    document: NoyaFileData['document'],
  ) => {
    const file = this.#getLocalFile(id);

    return this.#updateFile(id, { ...file.data, document } as NoyaFileData);
  };

  throttledUpdateFileMap = new Map<
    string,
    INoyaNetworkClient['files']['update']
  >();

  // Ensure there's only one active request to update a file at a time.
  getThrottledUpdateFile(id: string) {
    let throttledUpdateFile = this.throttledUpdateFileMap.get(id);

    if (!throttledUpdateFile) {
      throttledUpdateFile = throttleAsync(
        (...args: Parameters<INoyaNetworkClient['files']['update']>) =>
          this.networkClient.files.update(...args),
      );

      this.throttledUpdateFileMap.set(id, throttledUpdateFile);
    }

    return throttledUpdateFile;
  }

  #updateFile = async (id: string, data: NoyaFileData) => {
    const file = this.#getLocalFile(id);

    const version = file.version + 1;

    this.files$.files.set((files) =>
      fileReducer(files, { type: 'update', id, data, version }),
    );

    const result = await this.getThrottledUpdateFile(id)(id, data, version);

    this.#fetchFiles();

    return result;
  };

  #deleteFile: NoyaNetworkClient['files']['delete'] = async (...args) => {
    this.files$.files.set((files) =>
      fileReducer(files, { type: 'delete', id: args[0] }),
    );

    const result = await this.networkClient.files.delete(...args);
    this.#fetchFiles();
    return result;
  };
}

function updateIndex<T>(array: T[], index: number, value: T) {
  return [...array.slice(0, index), value, ...array.slice(index + 1)];
}

function compact<T>(array: (T | null | undefined)[]): T[] {
  return array.filter((item) => item !== null && item !== undefined) as T[];
}

function rightPad<T>(array: T[], length: number, value: T) {
  return [...array, ...new Array(length - array.length).fill(value)];
}
