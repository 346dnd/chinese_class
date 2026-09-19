/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type AsyncSubmitStateResp = {
    /**
     * 是否还在处理中
     */
    isProcessing: boolean;
    /**
     * 是否通过
     */
    passed: boolean;
    /**
     * 通过或不通过的理由
     */
    comment: string;
    /**
     * 错误次数
     */
    errorCount?: number;
    /**
     * 是否能揭露答案
     */
    revealed: boolean | null;
    /**
     * 正确答案
     *
     */
    correctAnswer?: string;
};

