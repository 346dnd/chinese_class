/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AIevaluation } from '../models/AIevaluation';
import type { AsyncSubmitResp } from '../models/AsyncSubmitResp';
import type { Base200Resp } from '../models/Base200Resp';
import type { GetMomentSourcesResp } from '../models/GetMomentSourcesResp';
import type { GetMomentsResp } from '../models/GetMomentsResp';
import type { GetParams } from '../models/GetParams';
import type { GetResult } from '../models/GetResult';
import type { GetState } from '../models/GetState';
import type { GetStuClassReport } from '../models/GetStuClassReport';
import type { GetUserResp } from '../models/GetUserResp';
import type { Moment } from '../models/Moment';
import type { MomentStats } from '../models/MomentStats';
import type { NodeEvaluation } from '../models/NodeEvaluation';
import type { NodeReport } from '../models/NodeReport';
import type { PostMomentsCommentsReq } from '../models/PostMomentsCommentsReq';
import type { PostMomentsReq } from '../models/PostMomentsReq';
import type { Publish_result } from '../models/Publish_result';
import type { StuClassV1DetailResp } from '../models/StuClassV1DetailResp';
import type { submit } from '../models/submit';
import type { UtilsDownloadResp } from '../models/UtilsDownloadResp';
import type { UtilsTranscriptionsResp } from '../models/UtilsTranscriptionsResp';
import type { UtilsUploadResp } from '../models/UtilsUploadResp';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class Service {
    /**
     * 用户登录
     * @param formData
     * @returns any
     * @throws ApiError
     */
    public static postApiV1AccountsLogin(
        formData: {
            username?: string;
            password?: string;
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
        data: {
            /**
             * 认证 token，客户端请求时会将它放在 Authorization 请求头中
             */
            token: string;
            /**
             * 用户信息对象
             */
            user: GetUserResp;
        };
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/accounts:login',
            formData: formData,
            mediaType: 'application/x-www-form-urlencoded',
        });
    }
    /**
     * 获取用户登录状态
     * @returns any
     * @throws ApiError
     */
    public static getApiV1AccountsStatus(): CancelablePromise<{
        /**
         * HTTP 状态码为 200 时，响应中的 code 也一定为 200
         */
        code: number;
        /**
         * 供内部记录、日志等使用的消息，可以为 null
         *
         */
        msg: string | null;
        data: GetUserResp;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/accounts:status',
            errors: {
                500: `服务端错误`,
            },
        });
    }
    /**
     * 创作手抄报与海报
     * @param classId
     * @param nodeId
     * @param taskId
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static postApiV1StuClassNodeCreationWorkshopGenerationSubmit(
        classId: number,
        nodeId: number,
        taskId: string,
        requestBody: submit,
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
            url: '/api/v1/stu/class/{classId}/node/{nodeId}/creation-workshop/{taskId}/generation/submit',
            path: {
                'classId': classId,
                'nodeId': nodeId,
                'taskId': taskId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                500: `服务端错误`,
            },
        });
    }
    /**
     * 返回AI生成结果
     * @param classId
     * @param nodeId
     * @param taskId
     * @param submitId
     * @returns any
     * @throws ApiError
     */
    public static getApiV1StuClassNodeCreationWorkshopGenerationResult(
        classId: number,
        nodeId: number,
        taskId: string,
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
        data: GetResult;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/stu/class/{classId}/node/{nodeId}/creation-workshop/{taskId}/generation/{submitId}/result',
            path: {
                'classId': classId,
                'nodeId': nodeId,
                'taskId': taskId,
                'submitId': submitId,
            },
            errors: {
                500: `服务端错误`,
            },
        });
    }
    /**
     * 查询发布结果
     * @param classId
     * @param nodeId
     * @param taskId
     * @param submitId
     * @returns any
     * @throws ApiError
     */
    public static getApiV1StuClassNodeCreationWorkshopGenerationSubmitPublishResult(
        classId: number,
        nodeId: number,
        taskId: string,
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
        data: Publish_result;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/stu/class/{classId}/node/{nodeId}/creation-workshop/{taskId}/generation/submit/{submitId}/publish-result',
            path: {
                'classId': classId,
                'nodeId': nodeId,
                'taskId': taskId,
                'submitId': submitId,
            },
            errors: {
                500: `服务端错误`,
            },
        });
    }
    /**
     * 发表作品
     * @param classId
     * @param nodeId
     * @param taskId 任务Id
     * @param submitId 提交Id
     * @returns Base200Resp
     * @throws ApiError
     */
    public static postApiV1StuClassNodeCreationWorkshopGenerationSubmit1(
        classId: number,
        nodeId: number,
        taskId: string,
        submitId: string,
    ): CancelablePromise<Base200Resp> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/stu/class/{classId}/node/{nodeId}/creation-workshop/{taskId}/generation/submit/{submitId}',
            path: {
                'classId': classId,
                'nodeId': nodeId,
                'taskId': taskId,
                'submitId': submitId,
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
     * @param taskId
     * @returns any
     * @throws ApiError
     */
    public static getApiV1StuClassNodeCreationWorkshopGenerationState(
        classId: number,
        nodeId: number,
        taskId: string,
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
        data: GetState;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/stu/class/{classId}/node/{nodeId}/creation-workshop/{taskId}/generation/state',
            path: {
                'classId': classId,
                'nodeId': nodeId,
                'taskId': taskId,
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
     * @param taskId
     * @returns any
     * @throws ApiError
     */
    public static getApiV1StuClassNodeCreationWorkshopGenerationParams(
        classId: string,
        nodeId: string,
        taskId: string,
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
        data: GetParams;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/stu/class/{classId}/node/{nodeId}/creation-workshop/{taskId}/generation/params',
            path: {
                'classId': classId,
                'nodeId': nodeId,
                'taskId': taskId,
            },
            errors: {
                500: `服务端错误`,
            },
        });
    }
    /**
     * 诗歌与剧本
     * @param classId
     * @param nodeId
     * @param taskId
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static postApiV1StuClassNodeCreationWorkshopPoemscriptsSubmit(
        classId: number,
        nodeId: number,
        taskId: string,
        requestBody: submit,
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
            url: '/api/v1/stu/class/{classId}/node/{nodeId}/creation-workshop/{taskId}/poemscripts/submit',
            path: {
                'classId': classId,
                'nodeId': nodeId,
                'taskId': taskId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                500: `服务端错误`,
            },
        });
    }
    /**
     * 获取状态
     * @param classId
     * @param nodeId
     * @param taskId
     * @returns any
     * @throws ApiError
     */
    public static getApiV1StuClassNodeCreationWorkshopPoemscriptsState(
        classId: number,
        nodeId: number,
        taskId: string,
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
        data: GetState;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/stu/class/{classId}/node/{nodeId}/creation-workshop/{taskId}/poemscripts/state',
            path: {
                'classId': classId,
                'nodeId': nodeId,
                'taskId': taskId,
            },
            errors: {
                500: `服务端错误`,
            },
        });
    }
    /**
     * 发表作品
     * @param classId
     * @param nodeId
     * @param taskId
     * @param submitId
     * @returns Base200Resp
     * @throws ApiError
     */
    public static postApiV1StuClassNodeCreationWorkshopPoemscriptsSubmit1(
        classId: number,
        nodeId: number,
        taskId: string,
        submitId: string,
    ): CancelablePromise<Base200Resp> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/stu/class/{classId}/node/{nodeId}/creation-workshop/{taskId}/poemscripts/submit/{submitId}',
            path: {
                'classId': classId,
                'nodeId': nodeId,
                'taskId': taskId,
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
     * @param taskId
     * @returns any
     * @throws ApiError
     */
    public static getApiV1StuClassNodeCreationWorkshopPoemscriptsParams(
        classId: number,
        nodeId: number,
        taskId: string,
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
        data: GetParams;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/stu/class/{classId}/node/{nodeId}/creation-workshop/{taskId}/poemscripts/params',
            path: {
                'classId': classId,
                'nodeId': nodeId,
                'taskId': taskId,
            },
            errors: {
                500: `服务端错误`,
            },
        });
    }
    /**
     * 查询发表结果
     * @param classId
     * @param nodeId
     * @param taskId
     * @param submitId
     * @returns any
     * @throws ApiError
     */
    public static getApiV1StuClassNodeCreationWorkshopPoemscriptsSubmitPublishResult(
        classId: number,
        nodeId: number,
        taskId: string,
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
        data: Publish_result;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/stu/class/{classId}/node/{nodeId}/creation-workshop/{taskId}/poemscripts/submit/{submitId}/publish-result',
            path: {
                'classId': classId,
                'nodeId': nodeId,
                'taskId': taskId,
                'submitId': submitId,
            },
            errors: {
                500: `服务端错误`,
            },
        });
    }
    /**
     * 查询作品结果
     * @param classId
     * @param nodeId
     * @param taskId
     * @param submitId
     * @returns any
     * @throws ApiError
     */
    public static getApiV1StuClassNodeCreationWorkshopPoemscriptsResult(
        classId: number,
        nodeId: number,
        taskId: string,
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
        data: GetResult;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/stu/class/{classId}/node/{nodeId}/creation-workshop/{taskId}/poemscripts/{submitId}/result',
            path: {
                'classId': classId,
                'nodeId': nodeId,
                'taskId': taskId,
                'submitId': submitId,
            },
            errors: {
                500: `服务端错误`,
            },
        });
    }
    /**
     * 分享讲解
     * @param classId
     * @param nodeId
     * @param taskId
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static postApiV1StuClassNodeCreationWorkshopShareSubmit(
        classId: number,
        nodeId: number,
        taskId: string,
        requestBody: {
            /**
             * 输入的文字信息
             */
            textContent: string;
            /**
             * 创作类型
             */
            taskType: string;
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
            url: '/api/v1/stu/class/{classId}/node/{nodeId}/creation-workshop/{taskId}/share/submit',
            path: {
                'classId': classId,
                'nodeId': nodeId,
                'taskId': taskId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                500: `服务端错误`,
            },
        });
    }
    /**
     * AI修改与评价
     * @param classId
     * @param nodeId
     * @param taskId
     * @param submitId
     * @returns any
     * @throws ApiError
     */
    public static getApiV1StuClassNodeCreationWorkshopShareResult(
        classId: number,
        nodeId: number,
        taskId: string,
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
        data: AIevaluation;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/stu/class/{classId}/node/{nodeId}/creation-workshop/{taskId}/share/{submitId}/result',
            path: {
                'classId': classId,
                'nodeId': nodeId,
                'taskId': taskId,
                'submitId': submitId,
            },
            errors: {
                500: `服务端错误`,
            },
        });
    }
    /**
     * 课文内容获取
     * @param classId
     * @param nodeId
     * @param textId
     * @returns any
     * @throws ApiError
     */
    public static getApiV1StuClassNodeCreationWorkshopTextcontent(
        classId: number,
        nodeId: number,
        textId: number,
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
             * 课文内容
             */
            textcontent: string;
            /**
             * 课文id
             */
            textId: number;
            /**
             * 课文名称
             */
            textname: string;
        };
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/stu/class/{classId}/node/{nodeId}/creation-workshop/{textId}/textcontent',
            path: {
                'classId': classId,
                'nodeId': nodeId,
                'textId': textId,
            },
            errors: {
                500: `服务端错误`,
            },
        });
    }
    /**
     * 表达（宣传文化有关）
     * @param classId
     * @param nodeId
     * @param taskId
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static postApiV1StuClassNodeCreationWorkshopExpressSubmit(
        classId: number,
        nodeId: number,
        taskId: string,
        requestBody: submit,
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
            url: '/api/v1/stu/class/{classId}/node/{nodeId}/creation-workshop/{taskId}/express/submit',
            path: {
                'classId': classId,
                'nodeId': nodeId,
                'taskId': taskId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                500: `服务端错误`,
            },
        });
    }
    /**
     * 学生进入课堂节点
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static postApiV1StuEventsEnterClassNode(
        requestBody: {
            classId: number;
            nodeId: number;
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
        data: {
            isFirstVisit: boolean;
        };
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/stu/events/enter-class-node',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                500: `服务端错误`,
            },
        });
    }
    /**
     * 获取课堂详细信息
     * @param classId
     * @returns any
     * @throws ApiError
     */
    public static getApiV1StuClass(
        classId: number,
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
        data: StuClassV1DetailResp;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/stu/class/{classId}',
            path: {
                'classId': classId,
            },
            errors: {
                500: `服务端错误`,
            },
        });
    }
    /**
     * 获取语音转写结果
     * @param resourceId 录音文件资源 ID
     * @returns any
     * @throws ApiError
     */
    public static getApiUtilsTranscriptions(
        resourceId: string,
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
        data: UtilsTranscriptionsResp;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/utils/transcriptions/{resourceId}',
            path: {
                'resourceId': resourceId,
            },
            errors: {
                500: `服务端错误`,
            },
        });
    }
    /**
     * 创作与分享的提交
     * @param classId
     * @param nodeId
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static postApiV1StuClassNodeCreationWorkshopTaskCreationSubmit(
        classId: string,
        nodeId: string,
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
        data: any;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/stu/class/{classId}/node/{nodeId}/creation-workshop/task/creationSubmit',
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
     * 文件上传
     * 上传录音音频、拍照图片，返回文件在线访问地址
     * @param formData
     * @returns any
     * @throws ApiError
     */
    public static postApiUtilsUpload(
        formData: {
            /**
             * 单个文件
             */
            file: Blob;
            /**
             * 文件类型
             */
            media_type: string;
            /**
             * 文件来源
             */
            resource_source: string;
            /**
             * 文件简介
             */
            resource_info?: string;
            /**
             * 压缩图片
             */
            image_compress?: boolean;
            /**
             * 压缩视频
             */
            video_compress?: boolean;
            /**
             * 是否上传
             */
            upload_oss?: boolean;
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
        data: UtilsUploadResp;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/utils/upload',
            formData: formData,
            mediaType: 'multipart/form-data',
            errors: {
                500: `服务端错误`,
            },
        });
    }
    /**
     * 文件下载
     * @param id 文件资源id
     * @param urlExpired URL过期
     * @returns any
     * @throws ApiError
     */
    public static getApiUtilsDownload(
        id: string,
        urlExpired?: number,
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
        data: UtilsDownloadResp;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/utils/download/{id}',
            path: {
                'id': id,
            },
            query: {
                'url_expired': urlExpired,
            },
            errors: {
                500: `服务端错误`,
            },
        });
    }
    /**
     * OCR
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static postApiUtilsOcr(
        requestBody: {
            /**
             * 图片文件资源 ID
             *
             */
            resourceId: string;
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
        data: {
            /**
             * 识别到的文字
             */
            text: string;
        };
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/utils/ocr',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                500: `服务端错误`,
            },
        });
    }
    /**
     * tts语音转文本
     * @param text
     * @returns any
     * @throws ApiError
     */
    public static postApiUtilsTts(
        text: string,
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
             * 音频文件的相对路径，以 / 开头
             */
            url: string;
        };
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/utils/tts',
            query: {
                'text': text,
            },
            errors: {
                500: `服务端错误`,
            },
        });
    }
    /**
     * 获取互动统计信息
     * @param classId
     * @returns any
     * @throws ApiError
     */
    public static getApiStuClassMomentsMeStats(
        classId: number,
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
        data: MomentStats;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/stu/class/{classId}/moments/me/stats',
            path: {
                'classId': classId,
            },
            errors: {
                500: `服务端错误`,
            },
        });
    }
    /**
     * 获取活动列表
     * @param classId
     * @returns any
     * @throws ApiError
     */
    public static getApiStuClassMomentsSources(
        classId: number,
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
        data: GetMomentSourcesResp;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/stu/class/{classId}/moments/sources',
            path: {
                'classId': classId,
            },
            errors: {
                500: `服务端错误`,
            },
        });
    }
    /**
     * 获取朋友圈列表
     * @param classId
     * @returns any
     * @throws ApiError
     */
    public static getApiStuClassMoments(
        classId: number,
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
        data: GetMomentsResp;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/stu/class/{classId}/moments',
            path: {
                'classId': classId,
            },
            errors: {
                500: `服务端错误`,
            },
        });
    }
    /**
     * 发送朋友圈
     * @param classId
     * @returns PostMomentsReq
     * @throws ApiError
     */
    public static postApiStuClassMoments(
        classId: number,
    ): CancelablePromise<PostMomentsReq> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/stu/class/{classId}/moments',
            path: {
                'classId': classId,
            },
            errors: {
                500: `服务端错误`,
            },
        });
    }
    /**
     * 获取单条朋友圈动态
     * @param classId
     * @param momentId
     * @returns any
     * @throws ApiError
     */
    public static getApiStuClassMoments1(
        classId: number,
        momentId: number,
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
        data: Moment;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/stu/class/{classId}/moments/{momentId}',
            path: {
                'classId': classId,
                'momentId': momentId,
            },
            errors: {
                500: `服务端错误`,
            },
        });
    }
    /**
     * 点赞
     * @param classId
     * @param momentId
     * @returns any
     * @throws ApiError
     */
    public static postApiStuClassMomentsLike(
        classId: number,
        momentId: number,
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
            url: '/api/stu/class/{classId}/moments/{momentId}/like',
            path: {
                'classId': classId,
                'momentId': momentId,
            },
            errors: {
                500: `服务端错误`,
            },
        });
    }
    /**
     * 取消点赞
     * @param classId
     * @param momentId
     * @returns any
     * @throws ApiError
     */
    public static deleteApiStuClassMomentsLike(
        classId: number,
        momentId: number,
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
            method: 'DELETE',
            url: '/api/stu/class/{classId}/moments/{momentId}/like',
            path: {
                'classId': classId,
                'momentId': momentId,
            },
            errors: {
                500: `服务端错误`,
            },
        });
    }
    /**
     * 评论
     * @param classId
     * @param momentId
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static postApiStuClassMomentsComments(
        classId: number,
        momentId: number,
        requestBody: PostMomentsCommentsReq,
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
        data: any;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/stu/class/{classId}/moments/{momentId}/comments',
            path: {
                'classId': classId,
                'momentId': momentId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                500: `服务端错误`,
            },
        });
    }
    /**
     * 删除我的评论
     * @param classId
     * @param commentId
     * @returns any
     * @throws ApiError
     */
    public static deleteApiStuClassMomentsComments(
        classId: number,
        commentId: number,
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
        data?: null;
    }> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/stu/class/{classId}/moments/comments/{commentId}',
            path: {
                'classId': classId,
                'commentId': commentId,
            },
            errors: {
                500: `服务端错误`,
            },
        });
    }
    /**
     * 获取学生课堂报告
     * @param classId
     * @returns any
     * @throws ApiError
     */
    public static getApiV1StuClassReport(
        classId: number,
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
        data: GetStuClassReport;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/stu/class/{classId}/report',
            path: {
                'classId': classId,
            },
            errors: {
                500: `服务端错误`,
            },
        });
    }
    /**
     * 获取各节点进度报告
     * @param classId
     * @param nodeId
     * @returns any
     * @throws ApiError
     */
    public static getApiV1StuClassNodeReport(
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
        data: NodeReport;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/stu/class/{classId}/node/{nodeId}/report',
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
     * 获取节点综合评价
     * @param classId
     * @param nodeId
     * @returns any
     * @throws ApiError
     */
    public static getApiV1StuClassNodeEvaluation(
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
        data: NodeEvaluation;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/stu/class/{classId}/node/{nodeId}/evaluation',
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
