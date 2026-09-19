/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type WriteThoughtSubmitResult = {
    /**
     * 提交 ID
     */
    id: string;
    /**
     * 问题 ID
     */
    questionId: string;
    /**
     * 提交类型
     */
    type: WriteThoughtSubmitResult.type;
    /**
     * 提交类型为 `submit` 时，学生提交的文本
     */
    submittedText?: string | null;
    /**
     * 是否还在处理中
     */
    isProcessing: boolean;
    /**
     * 提交类型为 `submit` 时，回答是否合格; 若提交类型为 `get-answer`，该字段固定为 `false`
     */
    isPassed?: boolean | null;
    /**
     * 是否完成; 在 `isPassed` 为 `true` 或 `type` 为 `get-answer` 或到达最大提交次数时，该字段应为 `true`，表示本题已完成且不再继续接受提交
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
};
export namespace WriteThoughtSubmitResult {
    /**
     * 提交类型
     */
    export enum type {
        SUBMIT = 'submit',
        GET_ANSWER = 'get-answer',
    }
}

