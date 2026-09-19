/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type Base401Resp = {
    /**
     * code为401
     */
    code: number;
    /**
     * 空字符串即可，http 401
     */
    tip: string;
    /**
     * 内部记录，日志等使用
     */
    msg: string | null;
    /**
     * 错误响应也可以有响应数
     */
    data: any;
};

