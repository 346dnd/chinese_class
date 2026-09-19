/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type PostMomentsReq = {
    /**
     * 来源
     */
    source?: string;
    /**
     * 动态内容
     */
    content: string;
    /**
     * 可选的图片列表
     */
    images?: Array<{
        /**
         * 图片文件 ID
         */
        picId: string;
    }>;
};

