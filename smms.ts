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

let _fetch = fetch;
/**
 * this function can modify the default http client (default is build in fetch)
 */
export const setFetch: (fetchFn: typeof fetch) => void = (fetchFn: typeof fetch) => (_fetch = fetchFn);

/**
 * @param body if is `undefined`, send `GET` request, otherwise `POST`
 */
async function request<T = undefined, U = {}>(endpoint: string, body?: Record<string, string | Blob>, token?: string) {
    const API = "https://smms.app/api/v2/";

    const res = await _fetch(API + (endpoint.startsWith("/") ? endpoint.slice(1) : endpoint), {
        method: body ? "POST" : "GET",
        headers: {
            authorization: token || "",
        },
        body: body ? buildForm(body) : undefined,
    });
    return (await res.json()) as Res<T, U>;
}

/**
 * User - Get API-Token
 */
export function token(username: string, password: string) {
    return request<{ token: string }>("/token", { username, password });
}

/**
 * User - Get User Profile
 */
export function profile(token: string) {
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
    }>("/profile", {}, token);
}

/**
 * Image - Clear IP Based Temporary Upload History
 */
export function clear(token: string) {
    return request<[]>("/clear", undefined, token);
}

/**
 * Image - IP Based Temporary Upload History
 */
export function history(token: string) {
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
    >("/history", undefined, token);
}

/**
 * Image - IP Based Temporary Upload History
 */
export function uploadHistory(token: string) {
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
    >("/upload_history", undefined, token);
}

/**
 * Image - Image Deletion
 */
export function deleteImage(token: string, hash: string) {
    return request("/delete/" + hash, undefined, token);
}

/**
 * Image - Upload Image
 *
 * @example
 * upload("TOKEN", new File([await Deno.readFile("path/to/image.png")], "cut_dog.png"))
 */
export function upload(token: string, smfile: Blob) {
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
        { code: "image_repeated"; images: string }
    >("/upload", { smfile }, token);
}

export class SMMSError<T = {}> extends Error {
    public readonly detail: ResError<T>;
    constructor(res: ResError<T>) {
        super(res.message);
        this.detail = res;
    }
}

export class SMMS {
    public token: string;
    constructor(token: string) {
        this.token = token;
    }

    static async login(username: string, password: string): Promise<SMMS> {
        const res = await token(username, password);
        if (!res.success) throw new SMMSError(res);
        return new this(res.data.token);
    }
    async profile() {
        const res = await profile(this.token);
        if (!res.success) throw new SMMSError(res);
        return res.data;
    }
    async clear() {
        const res = await clear(this.token);
        if (!res.success) throw new SMMSError(res);
        return res.data;
    }
    async history() {
        const res = await history(this.token);
        if (!res.success) throw new SMMSError(res);
        return res.data;
    }
    async uploadHistory() {
        const res = await uploadHistory(this.token);
        if (!res.success) throw new SMMSError(res);
        return res.data;
    }
    async delete(hash: string) {
        const res = await deleteImage(this.token, hash);
        if (!res.success) throw new SMMSError(res);
        return res.data;
    }
    async upload(smfile: Blob) {
        const res = await upload(this.token, smfile);
        if (!res.success) throw new SMMSError(res);
        return res.data;
    }
}
