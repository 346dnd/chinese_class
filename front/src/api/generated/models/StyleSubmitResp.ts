/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type StyleSubmitResp = {
    Submit: string;
    /**
     * ai返回信息
     */
    tip: string;
    /**
     * 是否正确
     */
    correct: boolean;
    /**
     * 错误次数
     */
    errorCount: number;
    /**
     * 正确答案
     */
    correctAnswer?: string;
    /**
     * 是否揭露正确答案
     */
    revealed: boolean;
};

