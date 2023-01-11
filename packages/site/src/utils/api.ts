import { SketchFile } from 'noya-sketch-file';
import { z } from 'zod';

/**

GET /api/files/ list files
POST /api/files with { data: ... } create a file, ID is assigned, responds with 201, Location header for resource URL and { id: ..., data: ...}
PUT /api/files/[id] with { data: ... } updates the file with this, responds with { id: ..., data: ...}
GET /api/files/[id] responds with { id: ..., data: ...}
DELETE /api/files/[id]

unless otherwise specified, returns 200 on success or 4xx/5xx error

*/

const userSchema = z.object({
  id: z.string(),
  name: z.nullable(z.string()),
  email: z.nullable(z.string()),
  image: z.nullable(z.string()),
});

type NoyaUser = z.infer<typeof userSchema>;

const sessionSchema = z.object({
  user: userSchema,
  expires: z.string(),
});

type NoyaSession = z.infer<typeof sessionSchema>;

const noyaDataSchema = z
  .object({
    name: z.string(),
    design: z.custom<SketchFile>(),
  })
  .passthrough();

const noyaFileSchema = z.object({
  id: z.string(),
  data: z.string().transform((json) => noyaDataSchema.parse(JSON.parse(json))),
  userId: z.string(),
});

type NoyaFile = z.infer<typeof noyaFileSchema>;

const noyaFileListSchema = z.array(noyaFileSchema);

type NoyaFileList = z.infer<typeof noyaFileListSchema>;

type NoyaAPIErrorType = 'unauthorized' | 'unknown';

class NoyaAPIError extends Error {
  constructor(public type: NoyaAPIErrorType, message: string) {
    super(message);
  }
}

type NoyaFileData = {
  name: string;
  design: SketchFile;
};

class NoyaAPIClient {
  baseURI: string;
  onError?: (error: NoyaAPIError) => boolean;

  constructor(options: {
    baseURI: string;
    onError?: (error: NoyaAPIError) => boolean;
  }) {
    this.baseURI = options.baseURI;
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
      list: this.#listFiles,
      delete: this.#deleteFile,
    };
  }

  #readSession = async () => {
    const response = await fetch(`${this.baseURI}/auth/session`, {
      credentials: 'include',
    });

    this.#ensureAuthorized(response);

    const json = await response.json();
    const parsed = sessionSchema.parse(json);
    return parsed;
  };

  #readFile = async (id: string) => {
    const response = await fetch(`${this.baseURI}/files/${id}`, {
      credentials: 'include',
    });

    this.#ensureAuthorized(response);

    const json = await response.json();
    const parsed = noyaFileSchema.parse(json);
    return parsed;
  };

  #listFiles = async () => {
    const response = await fetch(`${this.baseURI}/files`, {
      credentials: 'include',
    });

    this.#ensureAuthorized(response);

    const json = await response.json();
    const parsed = noyaFileListSchema.parse(json);
    return parsed.reverse();
  };

  #createFile = async (data: NoyaFileData) => {
    const response = await fetch(`${this.baseURI}/files`, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({ data }),
    });

    this.#ensureAuthorized(response);

    const json = await response.json();
    const parsed = z.object({ id: z.string() }).parse(json);
    return parsed.id;
  };

  #deleteFile = async (id: string) => {
    const response = await fetch(`${this.baseURI}/files/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    this.#ensureAuthorized(response);
  };

  #ensureAuthorized = (response: Response) => {
    const handleError = (error: NoyaAPIError) => {
      if (this.onError) {
        const handled = this.onError(error);

        if (handled) {
          return;
        }
      }

      throw error;
    };

    if (response.status === 401) {
      handleError(new NoyaAPIError('unauthorized', response.statusText));
    } else if (response.status >= 400) {
      handleError(new NoyaAPIError('unknown', response.statusText));
    }
  };
}

export namespace NoyaAPI {
  export const Client = NoyaAPIClient;
  export const Error = NoyaAPIError;

  export type File = NoyaFile;
  export type FileList = NoyaFileList;
  export type User = NoyaUser;
  export type Session = NoyaSession;
}

export const noyaAPI = new NoyaAPI.Client({
  baseURI: 'http://localhost:31112/api',
  onError: (error) => {
    if (error instanceof NoyaAPI.Error && error.type === 'unauthorized') {
      window.location.href = 'http://localhost:31112/';
      return true;
    } else {
      return false;
    }
  },
});
