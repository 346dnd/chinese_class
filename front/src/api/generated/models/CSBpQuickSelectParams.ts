/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type CSBpQuickSelectParams = {
    /**
     * 标题
     */
    title: string;
    /**
     * 描述
     */
    description: string;
    /**
     * 气泡框文字
     */
    introBubbleText?: string;
    /**
     * 15秒计时
     */
    timeLimit?: number;
    /**
     * 选项
     */
    selections: Array<{
        /**
         * 选项id
         */
        id: string;
        /**
         * 选项文本
         */
        text: string;
    }>;
};

