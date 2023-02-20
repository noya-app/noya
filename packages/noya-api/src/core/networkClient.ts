import { Size } from 'noya-geometry';
import { z } from 'zod';
import { NoyaAPIError } from './error';
import {
  noyaAssetSchema,
  noyaBillingSchema,
  noyaEmailListSchema,
  NoyaExportFormat,
  NoyaFileData,
  noyaFileListSchema,
  noyaFileSchema,
  noyaSessionSchema,
  noyaSharedFileSchema,
  noyaShareSchema,
  noyaUserDataSchema,
} from './schema';

/**

GET /api/files/ list files
POST /api/files with { data: ... } create a file, ID is assigned, responds with 201, Location header for resource URL and { id: ..., data: ...}
PUT /api/files/[id] with { data: ... } updates the file with this, responds with { id: ..., data: ...}
GET /api/files/[id] responds with { id: ..., data: ...}
DELETE /api/files/[id]

unless otherwise specified, returns 200 on success or 4xx/5xx error

*/

export interface INoyaNetworkClient {
  auth: NoyaNetworkClient['auth'];
  files: NoyaNetworkClient['files'];
  assets: NoyaNetworkClient['assets'];
  billing: NoyaNetworkClient['billing'];
  emailLists: NoyaNetworkClient['emailLists'];
}

export class NoyaNetworkClient {
  baseURI: string;
  onError?: (error: NoyaAPIError) => boolean;

  constructor(options: {
    baseURI: string;
    onError?: (error: NoyaAPIError) => boolean;
  }) {
    this.baseURI = options.baseURI;
    this.onError = options.onError;
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

  request = async (
    ...[input, init]: Parameters<typeof fetch>
  ): Promise<Response> => {
    // If the page needs to reload, don't make any more requests
    if (typeof window !== 'undefined' && window.noyaPageWillReload) {
      return new Promise(() => {}) as any;
    }

    const controller = new AbortController();

    const id = setTimeout(() => controller.abort(), 15000);

    let response: Response;

    try {
      response = await fetch(input, {
        signal: controller.signal,
        ...init,
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        // There's no way to recover here, so we'll always throw.
        // But we still allow global error handling to run first.
        this.handleError(new NoyaAPIError('timeout', 'Request timed out'));
      }

      throw error;
    }

    clearTimeout(id);

    return response;
  };

  #readUserData = async () => {
    const response = await this.request(`${this.baseURI}/user`, {
      credentials: 'include',
    });

    this.handleHTTPErrors(response);

    const json = await response.json();
    const parsed = noyaUserDataSchema.parse(json);
    return parsed;
  };

  #listEmailLists = async () => {
    const response = await this.request(`${this.baseURI}/user/email-lists`, {
      credentials: 'include',
    });

    this.handleHTTPErrors(response);

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

    this.handleHTTPErrors(response);

    const json = await response.json();
    const parsed = noyaEmailListSchema.parse(json);
    return parsed;
  };

  #listShares = async (fileId: string) => {
    const response = await this.request(
      `${this.baseURI}/files/${fileId}/shares`,
      {
        credentials: 'include',
      },
    );

    this.handleHTTPErrors(response);

    const json = await response.json();
    const parsed = z.array(noyaShareSchema).parse(json);
    return parsed;
  };

  #readSharedFile = async (shareId: string) => {
    const response = await this.request(`${this.baseURI}/shares/${shareId}`, {
      credentials: 'include',
    });

    this.handleHTTPErrors(response);

    const json = await response.json();
    const parsed = noyaSharedFileSchema.parse(json);
    return parsed;
  };

  #readBilling = async () => {
    const response = await this.request(`${this.baseURI}/billing`, {
      credentials: 'include',
    });

    this.handleHTTPErrors(response);

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

    this.handleHTTPErrors(response);

    const json = await response.json();
    const parsed = noyaAssetSchema.parse(json);
    return parsed.id;
  };

  #readSession = async () => {
    const response = await this.request(`${this.baseURI}/auth/session`, {
      credentials: 'include',
    });

    this.handleHTTPErrors(response);

    const json = await response.json();
    const parsed = noyaSessionSchema.parse(json);
    return parsed;
  };

  #readFile = async (id: string) => {
    const response = await this.request(`${this.baseURI}/files/${id}`, {
      credentials: 'include',
    });

    this.handleHTTPErrors(response);

    const json = await response.json();
    const parsed = noyaFileSchema.parse(json);
    return parsed;
  };

  #updateFile = async (id: string, data: NoyaFileData, version: number) => {
    const response = await this.request(`${this.baseURI}/files/${id}`, {
      method: 'PUT',
      credentials: 'include',
      body: JSON.stringify({ data, version }),
    });

    this.handleHTTPErrors(response);
  };

  #listFiles = async () => {
    const response = await this.request(`${this.baseURI}/files`, {
      credentials: 'include',
    });

    this.handleHTTPErrors(response);

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

    this.handleHTTPErrors(response);

    const json = await response.json();
    const parsed = noyaFileSchema.parse(json);
    return parsed;
  };

  #deleteFile = async (id: string) => {
    const response = await this.request(`${this.baseURI}/files/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    this.handleHTTPErrors(response);
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

    this.handleHTTPErrors(response);

    const json = await response.json();
    const parsed = noyaShareSchema.parse(json);
    return parsed;
  };

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
    } else if (response.status >= 400) {
      this.handleError(new NoyaAPIError('unknown', response.statusText));
    }
  };
}
