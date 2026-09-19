/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type AIevaluation = {
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
     * AI修改的文本
     */
    feedback: string;
    evaluation: {
        text: string;
        'audio ': {
            /**
             * id
             */
            'audioId ': string;
            src: string;
        };
    };
    /**
     * 用户输入的内容
     */
    TextContent: any;
    /**
     * 用时
     */
    duration: number;
};

