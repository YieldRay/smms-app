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

export function createSMMS(fetchFn?: typeof globalThis.fetch) {
    const fetch = fetchFn || globalThis.fetch;

    /**
     * @param body if is `undefined`, send `GET` request, otherwise `POST`
     */
    async function request<T = undefined, U = {}>(
        endpoint: string,
        body?: Record<string, string | Blob>,
        token?: string
    ) {
        const API = "https://smms.app/api/v2/";

        const res = await fetch(API + (endpoint.startsWith("/") ? endpoint.slice(1) : endpoint), {
            method: body ? "POST" : "GET",
            headers: { authorization: token || "" },
            body: body ? buildForm(body) : undefined,
        });
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
    function profile(token: string) {
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
    function clear(token: string) {
        return request<[]>("/clear", undefined, token);
    }

    /**
     * Image - IP Based Temporary Upload History
     */
    function history(token: string) {
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
    function uploadHistory(token: string) {
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
    function deleteImage(token: string, hash: string) {
        return request("/delete/" + hash, undefined, token);
    }

    /**
     * Image - Upload Image
     *
     * @example
     * upload("TOKEN", new File([await Deno.readFile("path/to/image.png")], "cut_dog.png"))
     */
    function upload(token: string, smfile: Blob) {
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

    return {
        token,
        profile,
        clear,
        history,
        uploadHistory,
        delete: deleteImage,
        upload,
    };
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
    private readonly _smms;
    constructor(token: string = "", fetchFn?: typeof globalThis.fetch) {
        this.token = token;
        this._smms = createSMMS(fetchFn);
    }
    async login(username: string, password: string) {
        const res = await this._smms.token(username, password);
        if (!res.success) throw new SMMSError(res);
        this.token = res.data.token;
        return res.data;
    }
    async profile() {
        const res = await this._smms.profile(this.token);
        if (!res.success) throw new SMMSError(res);
        return res.data;
    }
    async clear() {
        const res = await this._smms.clear(this.token);
        if (!res.success) throw new SMMSError(res);
        return res.data;
    }
    async history() {
        const res = await this._smms.history(this.token);
        if (!res.success) throw new SMMSError(res);
        return res.data;
    }
    async uploadHistory() {
        const res = await this._smms.uploadHistory(this.token);
        if (!res.success) throw new SMMSError(res);
        return res.data;
    }
    async delete(hash: string) {
        const res = await this._smms.delete(this.token, hash);
        if (!res.success) throw new SMMSError(res);
        return res.data;
    }
    async upload(smfile: Blob) {
        const res = await this._smms.upload(this.token, smfile);
        if (!res.success) throw new SMMSError(res);
        return res.data;
    }
}
