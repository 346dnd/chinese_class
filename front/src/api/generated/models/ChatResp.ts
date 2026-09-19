/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * api
 */
export type ChatResp = {
    /**
     * 调用唯一标识符
     */
    id: string;
    /**
     * 模型生成内容的数组，可以包含一个或多个 `choices` 对象
     */
    choices: Array<{
        finish_reason?: 'stop' | 'length' | 'tool_calls';
        /**
         * 当前响应在 `choices` 数组中的序列编号
         */
        index?: number;
        /**
         * 本次调用模型输出的消息
         */
        message: {
            /**
             * 消息的角色
             */
            role: string;
            /**
             * 调用模型生成的文本
             */
            content: string;
        };
    }>;
};

