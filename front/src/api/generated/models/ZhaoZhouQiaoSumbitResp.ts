/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type ZhaoZhouQiaoSumbitResp = {
    /**
     * 提交 ID
     */
    id: string;
    /**
     * 问题卡 ID
     */
    cardId: string;
    /**
     * 提交类型
     *
     */
    type: ZhaoZhouQiaoSumbitResp.type;
    /**
     * 学生提交的文本，朗读题为语音转写结果
     */
    submittedText?: string | null;
    /**
     * 学生提交的录音文件，非朗读题可以为 `null`
     */
    submittedAudio?: {
        /**
         * 录音文件 ID
         */
        id: string;
    } | null;
    /**
     * 是否还在处理中
     */
    isProcessing: boolean;
    /**
     * 回答是否正确; 若提交类型为 `get-answer`，该字段固定为 `false`
     */
    isPassed?: boolean | null;
    /**
     * 是否完成; 回答正确或提交类型为 `get-answer` 或到达最大提交次数时为 `true`
     */
    isCompleted?: boolean | null;
    /**
     * 参考答案; 在 `isCompleted` 为 `true` 时，返回参考答案
     */
    referenceAnswer?: string | null;
    /**
     * AI 反馈的文本，前端显示为数字人气泡
     */
    feedback?: string | null;
    /**
     * 是否给用户提供查看参考答案选择，为 `true` 时，前端显示获取答案按钮
     */
    offerReferenceAnswer?: boolean | null;
    /**
     * 用时，单位为秒
     */
    duration?: number | null;
};
export namespace ZhaoZhouQiaoSumbitResp {
    /**
     * 提交类型
     *
     */
    export enum type {
        SUBMIT = 'submit',
        GET_ANSWER = 'get-answer',
    }
}

