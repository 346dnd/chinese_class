/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CSBpQuickSelectParams } from '../models/CSBpQuickSelectParams';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class CulturalStyle1QuickSelectService {
    /**
     * 获取参数
     * @param classId
     * @param nodeId
     * @param bpId
     * @returns any
     * @throws ApiError
     */
    public static getApiV1StuClassNodeCulturalStyleBreakpointsQuickSelectParams(
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
        data: CSBpQuickSelectParams;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/stu/class/{classId}/node/{nodeId}/cultural-style/breakpoints/quick-select/{bpId}/params',
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
     * 提交选择
     * @param classId
     * @param nodeId
     * @param bpId
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static postApiV1StuClassNodesCulturalStyleBreakpointsQuickSelectSubmit(
        classId: number,
        nodeId: number,
        bpId: string,
        requestBody: {
            /**
             * 选择的选项 ID，为 `null` 表示超时未选择
             */
            selectedId: string | null;
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
            method: 'POST',
            url: '/api/v1/stu/class/{classId}/nodes/{nodeId}/cultural-style/breakpoints/quick-select/{bpId}/submit',
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
}
