/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Base200Resp } from '../models/Base200Resp';
import type { ChatReq } from '../models/ChatReq';
import type { ChatResp } from '../models/ChatResp';
import type { CreateSessionReq } from '../models/CreateSessionReq';
import type { GetSessionContextResp } from '../models/GetSessionContextResp';
import type { StreamChatMessage } from '../models/StreamChatMessage';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AiService {
    /**
     * 创建对话Session
     * @param requestBody
     * @returns Base200Resp
     * @throws ApiError
     */
    public static postApiAiSession(
        requestBody: CreateSessionReq,
    ): CancelablePromise<Base200Resp> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/ai/session',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                500: `服务端错误`,
            },
        });
    }
    /**
     * 非流式对话
     * @param session
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static postApiAiChat(
        session: string,
        requestBody: ChatReq,
    ): CancelablePromise<{
        code: number;
        msg: string | null;
        data: ChatResp;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/ai/chat/{session}',
            path: {
                'session': session,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                500: `服务端错误`,
            },
        });
    }
    /**
     * @deprecated
     * 流式对话
     * @param session
     * @param requestBody
     * @returns StreamChatMessage
     * @throws ApiError
     */
    public static postApiAiChatStream(
        session: string,
        requestBody: ChatReq,
    ): CancelablePromise<StreamChatMessage> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/ai/chat/stream/{session}',
            path: {
                'session': session,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                500: `服务端错误`,
            },
        });
    }
    /**
     * 获取Session历史上下文
     * @param session 对话 Session
     * @returns any
     * @throws ApiError
     */
    public static getApiAiContext(
        session: string,
    ): CancelablePromise<{
        /**
         * HTTP 状态码为 200 时，响应中的 code 也一定为 200
         */
        code: number;
        /**
         * 供内部记录、日志等使用的消息，可以为 null
         *
         */
        msg: string | null;
        data: GetSessionContextResp;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/ai/context',
            query: {
                'session': session,
            },
            errors: {
                500: `服务端错误`,
            },
        });
    }
}
