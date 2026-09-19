/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CulturalStyleParams } from '../models/CulturalStyleParams';
import type { CulturalStyleState } from '../models/CulturalStyleState';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class CulturalStyleService {
    /**
     * 获取状态
     * @param classid
     * @param nodeid
     * @returns any
     * @throws ApiError
     */
    public static getApiV1StuClassNodeCulturalStyleState(
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
        data: CulturalStyleState;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/stu/class/{classid}/node/{nodeid}/cultural-style/state',
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
     * 获取参数
     * @param classId
     * @param nodeId
     * @returns any
     * @throws ApiError
     */
    public static getApiV1StuClassNodeCulturalStyleParams(
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
        data: CulturalStyleParams;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/stu/class/{classId}/node/{nodeId}/cultural-style/params',
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
     * 更新播放进度
     * @param classId
     * @param nodeId
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static patchApiV1StuClassNodeCuturalStyleStateSyncTime(
        classId: number,
        nodeId: number,
        requestBody: {
            /**
             * 当前播放到的秒数
             */
            currentTime: number;
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
        data: null;
    }> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/v1/stu/class/{classId}/node/{nodeId}/cutural-style/state:sync-time',
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
     * 视频播放完毕 获取结束语
     * @param classId
     * @param nodeId
     * @returns any
     * @throws ApiError
     */
    public static getApiV1StuClassNodeCulturalStyleEnding(
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
             * 是否处理中
             */
            isProcessing: boolean;
            /**
             * 理由/反馈/点评
             *
             */
            comment: string;
        };
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/stu/class/{classId}/node/{nodeId}/cultural-style/ending',
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
