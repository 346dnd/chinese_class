/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type GetResult = {
    /**
     * 提交id
     */
    id: string;
    /**
     * 是否处理中
     */
    isProcessing: boolean;
    /**
     * 是否处理成功
     */
    isSuccessful: boolean;
    /**
     * 是否完成
     */
    isCompleted: boolean;
    /**
     * AI反馈的文本
     */
    feedback: string;
    /**
     * 用户输入的内容
     */
    content: any;
    AIimage: {
        /**
         * 图片id
         */
        id: string;
        /**
         * 链接
         */
        src: string;
    };
    /**
     * 是否发布
     */
    isPublish: boolean;
    /**
     * 用时
     */
    duration: number;
    /**
     * 任务类型
     */
    taskType: string;
};

