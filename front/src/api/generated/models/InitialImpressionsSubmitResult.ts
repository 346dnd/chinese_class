/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type InitialImpressionsSubmitResult = {
    /**
     * 提交 ID
     */
    id: string;
    /**
     * 问题 ID
     */
    questionId: string;
    /**
     * 填空位 ID
     */
    blankId: string;
    /**
     * 学生提交的回答
     */
    submittedText: string;
    /**
     * 是否还在处理中
     */
    isProcessing: boolean;
    /**
     * 回答是否正确
     */
    isPassed?: boolean | null;
    /**
     * 是否完成; 回答正确或到达最大提交次数时为 `true`
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
     * 用时，单位为秒
     */
    duration?: number | null;
};

