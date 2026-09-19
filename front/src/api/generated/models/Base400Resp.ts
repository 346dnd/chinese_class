/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * 客户端请求错误；如错误为用户未认证，必须返回 HTTP 401
 */
export type Base400Resp = {
    /**
     * code 为 4xx
     */
    code: number;
    /**
     * 【重要】在前端显示给用户的错误信息，必填，不可为空
     */
    tip: string;
    /**
     * 供内部记录、日志等使用的消息，可以为 null
     */
    msg: string | null;
    /**
     * 错误响应也可以有响应数据，可以为 null
     */
    data: any;
};

