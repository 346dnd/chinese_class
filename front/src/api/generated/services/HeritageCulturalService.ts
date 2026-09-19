/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AsyncSubmitResp } from '../models/AsyncSubmitResp';
import type { HeritageCulturalParams } from '../models/HeritageCulturalParams';
import type { HeritageCulturalState } from '../models/HeritageCulturalState';
import type { HeritageCulturalSubmitResult } from '../models/HeritageCulturalSubmitResult';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class HeritageCulturalService {
    /**
     * 获取状态
     * @param classId
     * @param nodeId
     * @returns any
     * @throws ApiError
     */
    public static getApiV1StuClassNodeHeritageCulturalState(
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
        data: HeritageCulturalState;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/stu/class/{classId}/node/{nodeId}/heritage-cultural/state',
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
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static postApiV1StuClassNodeHeritageCulturalSubmissions(
        classId: number,
        nodeId: number,
        requestBody: {
            /**
             * 回答文本
             */
            text: string;
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
            url: '/api/v1/stu/class/{classId}/node/{nodeId}/heritage-cultural/submissions',
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
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static getApiV1StuClassNodeHeritageCulturalSubmissions(
        classid: number,
        nodeid: number,
        submitId: string,
        requestBody: any,
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
        data: HeritageCulturalSubmitResult;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/stu/class/{classid}/node/{nodeid}/heritage-cultural/submissions/{submitId}',
            path: {
                'classid': classid,
                'nodeid': nodeid,
                'submitId': submitId,
            },
            body: requestBody,
            mediaType: 'application/json',
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
    public static getApiV1StuClassNodeHeritageCulturalParams(
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
        data: HeritageCulturalParams;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/stu/class/{classId}/node/{nodeId}/heritage-cultural/params',
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
     * 结束任务-获得总评信息
     * @param classId
     * @param nodeId
     * @returns any
     * @throws ApiError
     */
    public static getApiV4StuClassNodeHeritageCulturalEnding(
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
             * 是否通过
             */
            passed: boolean;
            /**
             * 通过或不通过的理由
             */
            comment: string;
            /**
             * 错误次数
             */
            errorCount?: number;
            /**
             * 是否能揭露答案
             */
            revealed: boolean | null;
            /**
             * 正确答案
             *
             */
            correctAnswer?: string;
        };
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v4/stu/class/{classId}/node/{nodeId}/heritage-cultural/ending',
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
