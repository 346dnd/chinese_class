/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type GetState = {
    /**
     * 创作记录
     */
    creationLogs: Array<{
        /**
         * 用户输入的内容
         */
        content: string;
        /**
         * 提交id
         */
        id: string;
        /**
         * AI反馈
         */
        feedback: string;
        /**
         * 是否处理中
         */
        isProcessing: boolean;
        /**
         * 处理是否成功
         */
        isSuccessful: boolean;
        /**
         * 是否完成
         */
        isCompleted: string;
        AIimage: {
            /**
             * 图片id
             */
            id: string;
            src: string;
        } | null;
    }>;
    /**
     * 是否发布
     */
    isPublish: boolean;
    /**
     * 用时
     */
    duration: string;
};

