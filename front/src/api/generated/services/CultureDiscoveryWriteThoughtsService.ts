/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AsyncSubmitResp } from '../models/AsyncSubmitResp';
import type { WriteThoughtParams } from '../models/WriteThoughtParams';
import type { WriteThoughtState } from '../models/WriteThoughtState';
import type { WriteThoughtSubmitResult } from '../models/WriteThoughtSubmitResult';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class CultureDiscoveryWriteThoughtsService {
    /**
     * 获取状态
     * @param classId
     * @param nodeId
     * @returns any
     * @throws ApiError
     */
    public static getApiV1StuClassNodeWriteThoughtsState(
        classId: number,
        nodeId: number,
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
        data: WriteThoughtState | null;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/stu/class/{classId}/node/{nodeId}/write-thoughts/state',
            path: {
                'classId': classId,
                'nodeId': nodeId,
            },
            errors: {
                500: `服务端错误`,
            },
        });
    }
    /**
     * 提交回答或获取答案
     * @param classId
     * @param nodeId
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static postApiV1StuClassNodeWriteThoughtsSubmissions(
        classId: number,
        nodeId: number,
        requestBody: {
            questionId: string;
            /**
             * 提交类型
             */
            type: 'submit' | 'get-answer';
            input: string;
        },
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
        data: AsyncSubmitResp;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/stu/class/{classId}/node/{nodeId}/write-thoughts/submissions',
            path: {
                'classId': classId,
                'nodeId': nodeId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                500: `服务端错误`,
            },
        });
    }
    /**
     * 查询提交结果
     * @param classid
     * @param nodeid
     * @param submitId
     * @returns any
     * @throws ApiError
     */
    public static getApiV1StuClassNodeWriteThoughtsSubmissions(
        classid: number,
        nodeid: number,
        submitId: string,
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
        data: WriteThoughtSubmitResult;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/stu/class/{classid}/node/{nodeid}/write-thoughts/submissions/{submitId}',
            path: {
                'classid': classid,
                'nodeid': nodeid,
                'submitId': submitId,
            },
            errors: {
                500: `服务端错误`,
            },
        });
    }
    /**
     * 获取参数
     * @param classId
     * @param nodeId
     * @returns any
     * @throws ApiError
     */
    public static getApiV1StuClassNodeWriteThoughtsParams(
        classId: number,
        nodeId: number,
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
        data: WriteThoughtParams;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/stu/class/{classId}/node/{nodeId}/write-thoughts/params',
            path: {
                'classId': classId,
                'nodeId': nodeId,
            },
            errors: {
                500: `服务端错误`,
            },
        });
    }
}
