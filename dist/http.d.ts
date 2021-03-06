/// <reference types="node" />
import { Readable } from "stream";
export default class HTTPClient {
    private instance;
    constructor(baseURL?: string, defaultHeaders?: any);
    get<T>(url: string, params?: any): Promise<T>;
    getStream(url: string, params?: any): Promise<Readable>;
    post<T>(url: string, data?: any): Promise<T>;
    postBinary<T>(url: string, data: Buffer | Readable, contentType?: string): Promise<T>;
    delete<T>(url: string, params?: any): Promise<T>;
    private wrapError;
}
