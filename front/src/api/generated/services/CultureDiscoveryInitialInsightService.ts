/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AsyncSubmitResp } from '../models/AsyncSubmitResp';
import type { InitialImpressionsParams } from '../models/InitialImpressionsParams';
import type { InitialImpressionsSubmitResult } from '../models/InitialImpressionsSubmitResult';
import type { InitialInsightState } from '../models/InitialInsightState';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class CultureDiscoveryInitialInsightService {
    /**
     * 获取状态
     * @param classId
     * @param nodeId
     * @returns any
     * @throws ApiError
     */
    public static getApiV1StuClassNodeInitialInsightState(
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
        data: InitialInsightState;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/stu/class/{classId}/node/{nodeId}/initial-insight/state',
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
     * 提交回答
     * @param classId
     * @param nodeId
     * @param questionId
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static postApiV1StuClassNodeInitialInsightSubmissions(
        classId: number,
        nodeId: number,
        questionId: string,
        requestBody: {
            questionId: string;
            /**
             * 填空位 ID
             */
            blankId: string;
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
            url: '/api/v1/stu/class/{classId}/node/{nodeId}/initial-insight/{questionId}/submissions',
            path: {
                'classId': classId,
                'nodeId': nodeId,
                'questionId': questionId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                500: `服务端错误`,
            },
        });
    }
    /**
     * 获取提交结果
     * @param classid
     * @param nodeid
     * @param questionId
     * @param submitId
     * @returns any
     * @throws ApiError
     */
    public static getApiV1StuClassNodeInitialInsightSubmissions(
        classid: number,
        nodeid: number,
        questionId: string,
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
        data: InitialImpressionsSubmitResult;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/stu/class/{classid}/node/{nodeid}/initial-insight/{questionId}/submissions/{submitId}',
            path: {
                'classid': classid,
                'nodeid': nodeid,
                'questionId': questionId,
                'submitId': submitId,
            },
            errors: {
                500: `服务端错误`,
            },
        });
    }
    /**
     * 获取参数
     * @param classid
     * @param nodeid
     * @returns any
     * @throws ApiError
     */
    public static getApiV1StuClassNodeInitialInsightParams(
        classid: number,
        nodeid: number,
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
        data: InitialImpressionsParams;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/stu/class/{classid}/node/{nodeid}/initial-insight/params',
            path: {
                'classid': classid,
                'nodeid': nodeid,
            },
            errors: {
                500: `服务端错误`,
            },
        });
    }
    /**
     * 获取结束语
     * @param classId
     * @param nodeId
     * @returns any
     * @throws ApiError
     */
    public static getApiV4StuClassNodeInitialInsightEnding(
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
        data: {
            /**
             * 是否还在处理中
             */
            isProcessing: boolean;
            /**
             * 理由/反馈/点评
             */
            comment: string;
        };
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v4/stu/class/{classId}/node/{nodeId}/initial-insight/ending',
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
