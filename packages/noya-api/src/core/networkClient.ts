import { Rect, Size } from 'noya-geometry';
import { encodeQueryParameters } from 'noya-utils';
import { z } from 'zod';
import { NoyaAPIError } from './error';
import {
  NoyaExportFormat,
  NoyaFileData,
  NoyaGeneratedName,
  NoyaJson,
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
}

export class NoyaNetworkClient {
  constructor(public options: NoyaNetworkClientOptions) {}

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
    };
  }

  #randomImage = async (options: {
    query: string;
    width: number;
    height: number;
  }): Promise<NoyaRandomImageResponse> => {
    let response: Response;

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

    const response = await this.request(
      `${this.baseURI}/generate/component/names?name=${encodeURIComponent(
        options.name,
      )}`,
      { credentials: 'include' },
    );

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

    const response = await this.request(
      `${this.baseURI}/generate/component/description?name=${encodeURIComponent(
        name,
      )}&index=${index}`,
      { credentials: 'include' },
    );

    return streamResponse(response);
  };

  #generateComponentLayoutsFromDescription = async (
    name: string,
    description: string,
    index: number,
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

    const response = await this.request(
      `${this.baseURI}/generate/component/layout?name=${encodeURIComponent(
        name,
      )}&description=${encodeURIComponent(description)}&index=${index}`,
      { credentials: 'include' },
    );

    let provider = response.headers.get('X-Noya-Llm-Provider') ?? undefined;

    if (provider === 'OPENAI_GPT4') provider = 'g4';
    if (provider === 'OPENAI_GPT35TURBO') provider = 'g3';
    if (provider === 'ANTHROPIC_CLAUDE2') provider = 'c2';

    return {
      provider: provider,
      layout: streamResponse(response),
    };
  };

  fetchWithBackoff = async (
    ...[input, init]: Parameters<typeof fetch>
  ): Promise<Response> => {
    let response: Response;
    let sleepTime = 2000;
    while (true) {
      const controller = new AbortController();

      const id = setTimeout(() => controller.abort(), 60000);

      response = await fetch(input, {
        signal: controller.signal,
        ...init,
      });

      clearTimeout(id);

      if (response.status !== 429) {
        break;
      }
      const currentSleepTime = sleepTime + Math.random() * 1000;
      await new Promise((resolve) => setTimeout(resolve, currentSleepTime));
      sleepTime *= 1.5;
    }
    return response;
  };

  request = async (
    ...parameters: Parameters<typeof fetch>
  ): Promise<Response> => {
    // If the page needs to reload, don't make any more requests
    if (typeof window !== 'undefined' && window.noyaPageWillReload) {
      return new Promise(() => {}) as any;
    }

    let response: Response;

    try {
      response = await this.fetchWithBackoff(...parameters);
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

  handleHTTPErrors = (response: Response) => {
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
