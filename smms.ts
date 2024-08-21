/**
 * This module supports browser, node and deno
 */

// deno-lint-ignore-file ban-types

type ResSuccess<T = undefined> = {
  success: true;
  code: "success";
  message: string;
  data: T;
  RequestId: string;
};

type ResError<T = {}> = {
  success: false;
  code: Exclude<string, "success">;
  message: string;
  RequestId: string;
} & T;

type Res<T = undefined, U = {}> = ResSuccess<T> | ResError<U>;

function buildForm(body: Record<string, string | Blob>) {
  const form = new FormData();
  Object.entries(body).forEach(([name, value]) => form.append(name, value));
  return form;
}

export const DEFAULT_ENDPOINT = "https://smms.app/api/v2/";

export function createSMMS(options?: {
  /**
   * initial token, can be overwritten by `$token` property
   */
  token?: string;
  /**
   * custom `fetch` function for http request
   */
  fetch?: typeof fetch;
  /**
   * API endpoint, default value is:
   * https://smms.app/api/v2/
   */
  endpoint?: string;
}) {
  const fetch = options?.fetch ? options.fetch : globalThis.fetch;
  const tokenRef = { value: options?.token || "" };

  /**
   * @param body if is `undefined`, send `GET` request, otherwise `POST`
   */
  async function request<T = undefined, U = {}>(
    endpoint: string,
    body?: Record<string, string | Blob>,
    token?: string,
  ) {
    const API = options?.endpoint || DEFAULT_ENDPOINT;

    const res = await fetch(
      API + (endpoint.startsWith("/") ? endpoint.slice(1) : endpoint),
      {
        method: body ? "POST" : "GET",
        headers: { authorization: token || "" },
        body: body ? buildForm(body) : undefined,
      },
    );

    if (res.status === 413) {
      // Request Entity Too Large
      throw new Error("Request Entity Too Large");
    }
    return (await res.json()) as Res<T, U>;
  }
  /**
   * User - Get API-Token
   */
  function token(username: string, password: string) {
    return request<{ token: string }>("/token", { username, password });
  }

  /**
   * User - Get User Profile
   */
  function profile() {
    return request<{
      username: string;
      email: string;
      role: string;
      group_expire: string;
      email_verified: number;
      disk_usage: string;
      disk_limit: string;
      disk_usage_raw: number;
      disk_limit_raw: number;
    }>("/profile", {}, tokenRef.value);
  }

  /**
   * Image - Clear IP Based Temporary Upload History
   */
  function clear() {
    return request<[]>("/clear", undefined, tokenRef.value);
  }

  /**
   * Image - IP Based Temporary Upload History
   */
  function history() {
    return request<
      Array<{
        width: number;
        height: number;
        filename: string;
        storename: string;
        size: number;
        path: string;
        hash: string;
        url: string;
        delete: string;
        page: string;
      }>
    >("/history", undefined, tokenRef.value);
  }

  /**
   * Image - IP Based Temporary Upload History
   */
  function uploadHistory() {
    return request<
      Array<{
        width: number;
        height: number;
        filename: string;
        storename: string;
        size: number;
        path: string;
        hash: string;
        url: string;
        delete: string;
        page: string;
      }>
    >("/upload_history", undefined, tokenRef.value);
  }

  /**
   * Image - Image Deletion
   */
  function deleteImage(hash: string) {
    return request("/delete/" + hash, undefined, tokenRef.value);
  }

  /**
   * Image - Upload Image
   *
   * @example
   * upload("TOKEN", new File([await Deno.readFile("path/to/image.png")], "cut_dog.png"))
   */
  function upload(smfile: Blob) {
    return request<
      {
        file_id: number;
        width: number;
        height: number;
        filename: string;
        storename: string;
        size: number;
        path: string;
        hash: string;
        url: string;
        delete: string;
        page: string;
      },
      { code: "image_repeated"; images: string } | {
        code: Exclude<string, "image_repeated">;
        images: undefined;
      }
    >("/upload", { smfile }, tokenRef.value);
  }

  return {
    token,
    profile,
    clear,
    history,
    uploadHistory,
    delete: deleteImage,
    upload,
    /**
     * shortcut for get token and set `$token` property
     */
    async $login(username: string, password: string) {
      const res = await token(username, password);
      if (res.success) {
        tokenRef.value = res.data.token;
      } else {
        throw new SMMSError(res);
      }
    },
    /**
     * smms api token
     */
    get $token() {
      return tokenRef.value;
    },
    set $token(token: string) {
      tokenRef.value = token;
    },
  };
}

export class SMMSError<T = {}> extends Error {
  public readonly detail: ResError<T>;
  constructor(res: ResError<T>) {
    super(res.message);
    this.detail = res;
  }
}

/**
 * OOP style api, will throw `SMMSError` when response json is not success
 */
export class SMMS {
  private readonly _smms;
  constructor(token: string = "", fetchFn?: typeof globalThis.fetch) {
    this._smms = createSMMS({
      token,
      fetch: fetchFn,
    });
  }
  async login(username: string, password: string) {
    const res = await this._smms.token(username, password);
    if (!res.success) throw new SMMSError(res);
    this._smms.$token = res.data.token;
    return res.data;
  }
  async profile() {
    const res = await this._smms.profile();
    if (!res.success) throw new SMMSError(res);
    return res.data;
  }
  async clear() {
    const res = await this._smms.clear();
    if (!res.success) throw new SMMSError(res);
    return res.data;
  }
  async history() {
    const res = await this._smms.history();
    if (!res.success) throw new SMMSError(res);
    return res.data;
  }
  async uploadHistory() {
    const res = await this._smms.uploadHistory();
    if (!res.success) throw new SMMSError(res);
    return res.data;
  }
  async delete(hash: string) {
    const res = await this._smms.delete(hash);
    if (!res.success) throw new SMMSError(res);
    return res.data;
  }
  async upload(smfile: Blob) {
    const res = await this._smms.upload(smfile);
    if (!res.success) throw new SMMSError(res);
    return res.data;
  }
}
