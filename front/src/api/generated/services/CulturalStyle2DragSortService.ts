/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AsyncSubmitResp } from '../models/AsyncSubmitResp';
import type { CSBpDragSortEntry } from '../models/CSBpDragSortEntry';
import type { CSBpDragSortParams } from '../models/CSBpDragSortParams';
import type { CSBpDragSortState } from '../models/CSBpDragSortState';
import type { CSBpDragSortSubmitResult } from '../models/CSBpDragSortSubmitResult';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class CulturalStyle2DragSortService {
    /**
     * 获取参数
     * @param classId
     * @param nodeId
     * @param bpId
     * @returns any
     * @throws ApiError
     */
    public static getApiV1StuClassNodeCulturalStyleBreakpointsDragSortParams(
        classId: number,
        nodeId: number,
        bpId: string,
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
        data: CSBpDragSortParams;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/stu/class/{classId}/node/{nodeId}/cultural-style/breakpoints/drag-sort/{bpId}/params',
            path: {
                'classId': classId,
                'nodeId': nodeId,
                'bpId': bpId,
            },
            errors: {
                500: `服务端错误`,
            },
        });
    }
    /**
     * 获取状态
     * @param classId
     * @param nodeId
     * @param bpId
     * @returns any
     * @throws ApiError
     */
    public static getApiV1StuClassNodeCulturalStyleBreakpointsDragSortState(
        classId: number,
        nodeId: number,
        bpId: string,
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
        data: CSBpDragSortState;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/stu/class/{classId}/node/{nodeId}/cultural-style/breakpoints/drag-sort/{bpId}/state',
            path: {
                'classId': classId,
                'nodeId': nodeId,
                'bpId': bpId,
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
     * @param bpId
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static postApiV1StuClassNodeCulturalStyleBreakpointsDragSortSubmissions(
        classId: number,
        nodeId: number,
        bpId: string,
        requestBody: {
            answer: Array<CSBpDragSortEntry>;
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
            url: '/api/v1/stu/class/{classId}/node/{nodeId}/cultural-style/breakpoints/drag-sort/{bpId}/submissions',
            path: {
                'classId': classId,
                'nodeId': nodeId,
                'bpId': bpId,
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
     * @param classId
     * @param nodeId
     * @param bpId
     * @param submitId
     * @returns any
     * @throws ApiError
     */
    public static getApiV1StuClassNodeCulturalStyleBreakpointsDragSortSubmissions(
        classId: number,
        nodeId: number,
        bpId: string,
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
        data: CSBpDragSortSubmitResult;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/stu/class/{classId}/node/{nodeId}/cultural-style/breakpoints/drag-sort/{bpId}/submissions/{submitId}',
            path: {
                'classId': classId,
                'nodeId': nodeId,
                'bpId': bpId,
                'submitId': submitId,
            },
            errors: {
                500: `服务端错误`,
            },
        });
    }
}
