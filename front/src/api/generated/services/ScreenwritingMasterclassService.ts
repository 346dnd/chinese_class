/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AsyncSubmitResp } from '../models/AsyncSubmitResp';
import type { IntroVideo } from '../models/IntroVideo';
import type { WenMingZhongWaiParams } from '../models/WenMingZhongWaiParams';
import type { WenMingZhongWaiState } from '../models/WenMingZhongWaiState';
import type { WenMingZhongWaiSubmitResult } from '../models/WenMingZhongWaiSubmitResult';
import type { ZhaoZhouQiaoState } from '../models/ZhaoZhouQiaoState';
import type { ZhaoZhouQiaoSumbitResp } from '../models/ZhaoZhouQiaoSumbitResp';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ScreenwritingMasterclassService {
    /**
     * 获取状态
     * @param classid
     * @param nodeid
     * @returns any
     * @throws ApiError
     */
    public static getApiV1StuClassNodeZhaozhouqiaoState(
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
        data: ZhaoZhouQiaoState;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/stu/class/{classid}/node/{nodeid}/zhaozhouqiao/state',
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
     * 提交回答
     * @param classid
     * @param nodeid
     * @param questionId
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static postApiV1StuClassNodeZhaozhouqiaoSubmissions(
        classid: number,
        nodeid: number,
        questionId: string,
        requestBody: {
            /**
             * 问题卡 ID
             */
            cardId: string;
            /**
             * 提交类型
             */
            type: 'submit' | 'get-answer';
            /**
             * 学生作答的文本，提交类型为 `submit` 时必填，朗读题为语音转写结果
             */
            text?: string | null;
            /**
             * 朗读录音
             */
            audio?: {
                /**
                 * 录音文件 ID
                 */
                id: string;
            } | null;
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
            url: '/api/v1/stu/class/{classid}/node/{nodeid}/zhaozhouqiao/{questionId}/submissions',
            path: {
                'classid': classid,
                'nodeid': nodeid,
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
     * 查询提交结果
     * @param classid
     * @param nodeid
     * @param submitId
     * @returns any
     * @throws ApiError
     */
    public static getApiV1StuClassNodeZhaozhouqiaoSubmissions(
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
        data: ZhaoZhouQiaoSumbitResp;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/stu/class/{classid}/node/{nodeid}/zhaozhouqiao/submissions/{submitId}',
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
     * @param classid
     * @param nodeid
     * @returns any
     * @throws ApiError
     */
    public static getApiV1StuClassNodeZhaozhouqiaoParams(
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
        data: {
            /**
             * 节点标题
             */
            title: string;
            /**
             * 活动导入视频
             */
            introVideo?: IntroVideo;
            /**
             * 导入气泡文字
             */
            introBubbleText?: string;
        };
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/stu/class/{classid}/node/{nodeid}/zhaozhouqiao/params',
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
     * 获取状态
     * @param classid
     * @param nodeid
     * @returns any
     * @throws ApiError
     */
    public static getApiV1StuClassNodeWenmingzhongwaiState(
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
        data: WenMingZhongWaiState;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/stu/class/{classid}/node/{nodeid}/wenmingzhongwai/state',
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
     * 提交回答
     * @param classid
     * @param nodeid
     * @param questionId
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static postApiV1StuClassNodeWenmingzhongwaiSubmissions(
        classid: number,
        nodeid: number,
        questionId: string,
        requestBody: {
            /**
             * 提交类型
             */
            type: 'submit' | 'get-answer';
            /**
             * 该对象中每个成员的键对应一个 `blankId`
             */
            answers?: Record<string, string> | null;
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
            url: '/api/v1/stu/class/{classid}/node/{nodeid}/wenmingzhongwai/{questionId}/submissions',
            path: {
                'classid': classid,
                'nodeid': nodeid,
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
     * 查询提交状态
     * @param classid
     * @param nodeid
     * @param submitId
     * @returns any
     * @throws ApiError
     */
    public static getApiV1StuClassNodeWenmingzhongwaiSubmissions(
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
        data: WenMingZhongWaiSubmitResult;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/stu/class/{classid}/node/{nodeid}/wenmingzhongwai/submissions/{submitId}',
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
     * @param classid
     * @param nodeid
     * @returns any
     * @throws ApiError
     */
    public static getApiV1StuClassNodeWenmingzhongwaiParams(
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
        data: WenMingZhongWaiParams;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/stu/class/{classid}/node/{nodeid}/wenmingzhongwai/params',
            path: {
                'classid': classid,
                'nodeid': nodeid,
            },
            errors: {
                500: `服务端错误`,
            },
        });
    }
}
