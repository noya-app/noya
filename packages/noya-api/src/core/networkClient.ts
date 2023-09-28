/* eslint-disable no-loop-func */
import { Emitter } from 'noya-fonts';
import { Rect, Size } from 'noya-geometry';
import { castHashParameter, getUrlHashParameters } from 'noya-react-utils';
import { encodeQueryParameters } from 'noya-utils';
import { z } from 'zod';
import { NoyaAPIError } from './error';
import {
  NoyaExportFormat,
  NoyaFileData,
  NoyaGeneratedName,
  NoyaJson,
  NoyaRandomIconResponse,
  NoyaRandomImageResponse,
  generatedNameSchema,
  noyaAssetSchema,
  noyaBillingSchema,
  noyaEmailListSchema,
  noyaFileListSchema,
  noyaFileSchema,
  noyaSessionSchema,
  noyaShareSchema,
  noyaSharedFileSchema,
  noyaUserDataSchema,
  randomIconResponseSchema,
  randomImageResponseSchema,
} from './schema';
import { streamResponse, streamString } from './streaming';

/**

GET /api/files/ list files
POST /api/files with { data: ... } create a file, ID is assigned, responds with 201, Location header for resource URL and { id: ..., data: ...}
PUT /api/files/[id] with { data: ... } updates the file with this, responds with { id: ..., data: ...}
GET /api/files/[id] responds with { id: ..., data: ...}
DELETE /api/files/[id]

unless otherwise specified, returns 200 on success or 4xx/5xx error

*/

type NoyaNetworkClientOptions = {
  baseURI: string;
  onError?: (error: NoyaAPIError) => boolean;
  isPreview?: boolean;
};

export type NoyaRequestSnapshot = ReturnType<NoyaRequest['snapshot']>;

let requestId: number = 0;

export class NoyaRequest extends Emitter<void[]> {
  constructor(request: Request, abort: () => void) {
    super();
    this.#request = request;
    this.abort = abort;
  }

  id: number = requestId++;
  #request: Request;
  response?: NoyaResponse;
  completed: boolean = false;
  abort: () => void;
  aborted: boolean = false;
  attempt: number = 1;

  get isStreaming() {
    return this.response?.isStreaming ?? false;
  }

  retryWithRequest(request: Request, abort: () => void) {
    this.#request = request;
    this.response = undefined;
    this.completed = false;
    this.abort = abort;
    this.aborted = false;
    this.attempt++;
    this.emit();
  }

  snapshot() {
    return {
      id: this.id,
      method: this.#request.method,
      completed: this.completed,
      abort: this.abort,
      aborted: this.aborted,
      isStreaming: this.isStreaming,
      url: this.#request.url,
      status: this.response?.status,
      attempt: this.attempt,
      abortStream: () => {
        this.response?.abortStreamController.abort();
      },
    };
  }
}

export class NoyaResponse extends Emitter<boolean[]> {
  constructor(public response: Response) {
    super();
  }

  isStreaming = false;

  abortStreamController = new AbortController();

  streamString = () =>
    streamResponse(this.response, {
      abortSignal: this.abortStreamController.signal,
      onChangeStatus: (isStreaming) => {
        this.isStreaming = isStreaming;
        this.emit(isStreaming);
      },
    });

  get headers() {
    return this.response.headers;
  }

  get status() {
    return this.response.status;
  }

  get statusText() {
    return this.response.statusText;
  }

  get json() {
    return this.response.json.bind(this.response);
  }
}

type RequestListener = (request: NoyaRequest) => void;

export interface INoyaNetworkClient {
  auth: NoyaNetworkClient['auth'];
  files: NoyaNetworkClient['files'];
  assets: NoyaNetworkClient['assets'];
  billing: NoyaNetworkClient['billing'];
  emailLists: NoyaNetworkClient['emailLists'];
  userData: NoyaNetworkClient['userData'];
  metadata: NoyaNetworkClient['metadata'];
  generate: NoyaNetworkClient['generate'];
  random: NoyaNetworkClient['random'];
  addRequestListener: NoyaNetworkClient['addRequestListener'];
  removeRequestListener: NoyaNetworkClient['removeRequestListener'];
}

export class NoyaNetworkClient {
  constructor(public options: NoyaNetworkClientOptions) {}

  #requestListeners: RequestListener[] = [];

  #emitRequest = (request: NoyaRequest) => {
    const isDebug = castHashParameter(getUrlHashParameters().debug, 'boolean');

    if (isDebug) {
      this.#requestListeners.forEach((listener) => listener(request));
    }
  };

  addRequestListener = (listener: RequestListener) => {
    this.#requestListeners.push(listener);
  };

  removeRequestListener = (listener: RequestListener) => {
    this.#requestListeners = this.#requestListeners.filter(
      (l) => l !== listener,
    );
  };

  get baseURI() {
    return this.options.baseURI;
  }
  get onError() {
    return this.options.onError;
  }
  get isPreview() {
    return this.options.isPreview ?? false;
  }

  get userData() {
    return {
      read: this.#readUserData,
    };
  }

  get emailLists() {
    return {
      list: this.#listEmailLists,
      update: this.#updateEmailList,
    };
  }

  get auth() {
    return {
      session: this.#readSession,
    };
  }

  get files() {
    return {
      read: this.#readFile,
      create: this.#createFile,
      update: this.#updateFile,
      delete: this.#deleteFile,
      list: this.#listFiles,
      download: {
        url: this.downloadURL,
      },
      shares: {
        readSharedFile: this.#readSharedFile,
        create: this.#createShare,
        list: this.#listShares,
      },
    };
  }

  get metadata() {
    return {
      set: this.#setMetadata,
      // delete: this.#deleteMetadata,
    };
  }

  get assets() {
    return {
      create: this.#createAsset,
      url: this.#assetURL,
    };
  }

  get billing() {
    return {
      read: this.#readBilling,
    };
  }

  get shares() {
    return {
      list: this.#listShares,
    };
  }

  get generate() {
    return {
      componentNames: this.#generateComponentNames,
      componentDescriptionFromName: this.#generateComponentDescriptionFromName,
      componentLayoutsFromDescription:
        this.#generateComponentLayoutsFromDescription,
    };
  }

  get random() {
    return {
      image: this.#randomImage,
      icon: this.#randomIcon,
    };
  }

  #randomIcon = async (options: {
    query: string;
  }): Promise<NoyaRandomIconResponse> => {
    let response: NoyaResponse;

    try {
      response = await this.request(
        `https://api.iconify.design/search?${encodeQueryParameters({
          limit: 32, // This is the minimum supported by the API
          query: options.query,
        })}`,
      );
    } catch (error) {
      return { icons: [] };
    }

    const json = await response.json();
    const parsed = randomIconResponseSchema.parse(json);

    const sorted = parsed.icons.sort((a, b) => {
      // If an exact match, order first
      if (a === options.query) return -1;
      if (b === options.query) return 1;

      // Otherwise, split on ':' and compare the second part
      const [, aName] = a.split(':');
      const [, bName] = b.split(':');

      if (aName === options.query) return -1;
      if (bName === options.query) return 1;

      return 0;
    });

    const urls = sorted.map((icon) => {
      const [iconPrefix, iconName] = icon.split(':');
      return `https://api.iconify.design/${iconPrefix}/${iconName}.svg`;
    });

    return {
      icons: urls,
    };
  };

  #randomImage = async (options: {
    query: string;
    width: number;
    height: number;
  }): Promise<NoyaRandomImageResponse> => {
    let response: NoyaResponse;

    try {
      response = await this.request(
        `${this.baseURI}/images/random?${encodeQueryParameters({
          width: options.width,
          height: options.height,
          query: options.query,
        })}`,
        { credentials: 'include' },
      );
    } catch (error) {
      if (error instanceof NoyaAPIError && error.type === 'notFound') {
        return {
          url: `https://images.unsplash.com/photo-1515825838458-f2a94b20105a?ixid=M3w0Njc1MTh8MHwxfHJhbmRvbXx8fHx8fHx8fDE2OTQyMTI1MDF8&ixlib=rb-4.0.3&crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=80&w=${options.width}&h=${options.height}`,
          metadata: { color: '#0c2626' },
          source: {
            name: 'Unsplash',
            url: 'https://unsplash.com?utm_source=noya&utm_medium=referral',
          },
          user: {
            name: 'Casey Horner',
            url: 'https://unsplash.com/@mischievous_penguins?utm_source=noya&utm_medium=referral',
          },
          // page: {
          //   name: 'high-angle photography of mountain at sunset',
          //   url: 'https://unsplash.com/photos/mPnxwQBtUZE?utm_source=noya&utm_medium=referral',
          // },
        };
      }

      throw error;
    }

    const json = await response.json();
    const parsed = randomImageResponseSchema.parse(json);
    return parsed;
  };

  #generateComponentNames = async (options: {
    name: string;
    rect?: Rect;
  }): Promise<NoyaGeneratedName[]> => {
    if (this.isPreview) return [];

    if (!options.name) return [];

    let response: NoyaResponse;

    try {
      response = await this.requestWithoutErrorHandling(
        `${this.baseURI}/generate/component/names?name=${encodeURIComponent(
          options.name,
        )}`,
        { credentials: 'include' },
      );
    } catch {
      return [];
    }

    const json = await response.json();

    const schema = z.array(generatedNameSchema);
    const parsed = schema.safeParse(json);
    return parsed.success ? parsed.data : [];
  };

  #generateComponentDescriptionFromName = async (
    name: string,
    index: number,
  ): Promise<AsyncIterable<string>> => {
    if (this.isPreview) return streamString(name);

    let response: NoyaResponse;

    try {
      response = await this.request(
        `${
          this.baseURI
        }/generate/component/description?name=${encodeURIComponent(
          name,
        )}&index=${index}`,
        { credentials: 'include' },
      );
    } catch {
      return streamString(name);
    }

    return response.streamString();
  };

  #generateComponentLayoutsFromDescription = async (
    name: string,
    description: string,
    index: number,
    abortSignal?: AbortSignal,
  ): Promise<{
    provider?: string;
    layout: AsyncIterable<string>;
  }> => {
    if (this.isPreview) {
      return {
        layout: streamString(
          `<Box class="bg-slate-50 flex-1"><Text>[Placeholder '${name}' component]</Text></Box>`,
        ),
      };
    }

    let response: NoyaResponse;

    try {
      response = await this.requestWithoutErrorHandling(
        `${this.baseURI}/generate/component/layout?name=${encodeURIComponent(
          name,
        )}&description=${encodeURIComponent(description)}&index=${index}`,
        { credentials: 'include', signal: abortSignal },
      );
    } catch (error) {
      return {
        layout: streamString(`<Box class="bg-slate-50 flex-1" />`),
      };
    }

    if (abortSignal?.aborted) {
      return {
        layout: streamString(`<Box class="bg-slate-50 flex-1" />`),
      };
    }

    abortSignal?.addEventListener('abort', () => {
      response.abortStreamController.abort();
    });

    let provider = response.headers.get('X-Noya-Llm-Provider') ?? undefined;

    if (provider === 'OPENAI_GPT4') provider = 'g4';
    if (provider === 'OPENAI_GPT35TURBO') provider = 'g3';
    if (provider === 'ANTHROPIC_CLAUDE2') provider = 'c2';

    return {
      provider: provider,
      layout: response.streamString(),
    };
  };

  fetchWithBackoff = async (
    ...[input, init]: Parameters<typeof fetch>
  ): Promise<NoyaResponse> => {
    let response: Response | undefined;
    let noyaRequest: NoyaRequest | undefined;
    let noyaResponse: NoyaResponse | undefined;
    let sleepTime = 2000;

    while (true) {
      const controller = new AbortController();

      if (init?.signal) {
        init.signal.addEventListener('abort', () => {
          controller.abort();
        });
      }

      const id = setTimeout(() => controller.abort(), 60000);

      const request = new Request(input, {
        signal: controller.signal,
        ...init,
      });

      const responsePromise = fetch(request);

      if (!noyaRequest) {
        noyaRequest = new NoyaRequest(request, () => controller.abort());
        this.#emitRequest(noyaRequest);
      } else {
        noyaRequest.retryWithRequest(request, () => controller.abort());
      }

      try {
        response = await responsePromise;
      } finally {
        noyaResponse = response ? new NoyaResponse(response) : undefined;
        noyaResponse?.addListener(() => {
          noyaRequest?.emit();
        });

        noyaRequest.completed = true;
        noyaRequest.aborted = controller.signal.aborted;
        noyaRequest.response = noyaResponse;
        noyaRequest.emit();
      }

      clearTimeout(id);

      if (response.status !== 429) {
        break;
      }
      const currentSleepTime = sleepTime + Math.random() * 1000;
      await new Promise((resolve) => setTimeout(resolve, currentSleepTime));
      sleepTime *= 1.5;
    }

    return noyaResponse!;
  };

  request = async (
    ...parameters: Parameters<typeof fetch>
  ): Promise<NoyaResponse> => {
    let response: NoyaResponse;

    try {
      response = await this.requestWithoutErrorHandling(...parameters);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        // There's no way to recover here, so we'll always throw.
        // But we still allow global error handling to run first.
        this.handleError(new NoyaAPIError('timeout', 'Request timed out'));
      }

      throw error;
    }

    this.handleHTTPErrors(response);
    return response;
  };

  requestWithoutErrorHandling = async (
    ...parameters: Parameters<typeof fetch>
  ): Promise<NoyaResponse> => {
    // If the page needs to reload, don't make any more requests
    if (typeof window !== 'undefined' && window.noyaPageWillReload) {
      return new Promise(() => {}) as any;
    }

    return this.fetchWithBackoff(...parameters);
  };

  #readUserData = async () => {
    const response = await this.request(`${this.baseURI}/user`, {
      credentials: 'include',
    });

    const json = await response.json();
    const parsed = noyaUserDataSchema.parse(json);
    return parsed;
  };

  #listEmailLists = async () => {
    const response = await this.request(`${this.baseURI}/user/email-lists`, {
      credentials: 'include',
    });

    const json = await response.json();
    const parsed = z.array(noyaEmailListSchema).parse(json);
    return parsed;
  };

  #updateEmailList = async (id: string, data: { optIn: boolean }) => {
    const response = await this.request(
      `${this.baseURI}/user/email-lists/${id}`,
      {
        method: 'PUT',
        credentials: 'include',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    const json = await response.json();
    const parsed = noyaEmailListSchema.parse(json);
    return parsed;
  };

  #listShares = async (fileId: string) => {
    const response = await this.request(
      `${this.baseURI}/files/${fileId}/shares`,
      { credentials: 'include' },
    );

    const json = await response.json();
    const parsed = z.array(noyaShareSchema).parse(json);
    return parsed;
  };

  #readSharedFile = async (shareId: string) => {
    const response = await this.request(`${this.baseURI}/shares/${shareId}`, {
      credentials: 'include',
    });

    const json = await response.json();
    const parsed = noyaSharedFileSchema.parse(json);
    return parsed;
  };

  #readBilling = async () => {
    const response = await this.request(`${this.baseURI}/billing`, {
      credentials: 'include',
    });

    const json = await response.json();
    const parsed = noyaBillingSchema.parse(json);
    return parsed;
  };

  downloadURL = (id: string, format: NoyaExportFormat, size: Size) =>
    `${this.baseURI}/files/${id}.${format}?width=${size.width}&height=${size.height}`;

  #assetURL = (id: string) => `${this.baseURI}/assets/${id}`;

  #createAsset = async (data: ArrayBuffer, fileId: string) => {
    const response = await this.request(
      `${this.baseURI}/files/${fileId}/assets`,
      {
        method: 'POST',
        credentials: 'include',
        body: data,
      },
    );

    const json = await response.json();
    const parsed = noyaAssetSchema.parse(json);
    return parsed.id;
  };

  #readSession = async () => {
    const response = await this.request(`${this.baseURI}/auth/session`, {
      credentials: 'include',
    });

    const json = await response.json();
    const parsed = noyaSessionSchema.parse(json);
    return parsed;
  };

  #readFile = async (id: string) => {
    const response = await this.request(`${this.baseURI}/files/${id}`, {
      credentials: 'include',
    });

    const json = await response.json();
    const parsed = noyaFileSchema.parse(json);
    return parsed;
  };

  #updateFile = async (id: string, data: NoyaFileData, version: number) => {
    await this.request(`${this.baseURI}/files/${id}`, {
      method: 'PUT',
      credentials: 'include',
      body: JSON.stringify({ data, version }),
    });
  };

  #listFiles = async () => {
    const response = await this.request(`${this.baseURI}/files`, {
      credentials: 'include',
    });

    const json = await response.json();
    const parsed = noyaFileListSchema.parse(json);
    return parsed;
  };

  #createFile = async (
    fields: { data: NoyaFileData } | { shareId: string } | { fileId: string },
  ) => {
    const response = await this.request(`${this.baseURI}/files`, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify(fields),
    });

    const json = await response.json();
    const parsed = noyaFileSchema.parse(json);
    return parsed;
  };

  #deleteFile = async (id: string) => {
    await this.request(`${this.baseURI}/files/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
  };

  #createShare = async (
    fileId: string,
    options: {
      viewable?: boolean;
      duplicable?: boolean;
    } = {},
  ) => {
    const { viewable = true, duplicable = false } = options;

    const response = await this.request(
      `${this.baseURI}/files/${fileId}/shares`,
      {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({ viewable, duplicable }),
      },
    );

    const json = await response.json();
    const parsed = noyaShareSchema.parse(json);
    return parsed;
  };

  /* Metadata */

  #setMetadata = async (id: string, value: NoyaJson) => {
    await this.request(
      `${this.baseURI}/user/metadata/${encodeURIComponent(id)}`,
      {
        credentials: 'include',
        method: 'PUT',
        body: JSON.stringify({ value }),
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
  };

  /* Error Handling */

  handleError = (error: NoyaAPIError) => {
    if (this.onError) {
      const handled = this.onError(error);

      if (handled) {
        return;
      }
    }

    throw error;
  };

  handleHTTPErrors = (response: NoyaResponse) => {
    if (response.status === 500) {
      this.handleError(
        new NoyaAPIError('internalServerError', response.statusText),
      );
    } else if (response.status === 401) {
      this.handleError(new NoyaAPIError('unauthorized', response.statusText));
    } else if (response.status === 404) {
      this.handleError(new NoyaAPIError('notFound', response.statusText));
    } else if (response.status >= 400) {
      this.handleError(new NoyaAPIError('unknown', response.statusText));
    }
  };
}
