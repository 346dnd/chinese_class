/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CSBpDragSortEntry } from './CSBpDragSortEntry';
export type CSBpDragSortSubmitResult = {
    /**
     * 提交 ID
     */
    id: string;
    /**
     * 提交的词条排序，该数组长度必须与参数中的 `blanks` 放置位数组长度相同
     */
    answer: Array<CSBpDragSortEntry>;
    /**
     * 是否还在处理中 (等待 AI 反馈生成)
     */
    isProcessing: boolean;
    /**
     * 回答是否正确
     */
    isPassed: boolean;
    /**
     * 是否完成; 回答正确或到达最大提交次数时为 `true`
     */
    isCompleted: boolean;
    /**
     * 参考答案; 在 `isCompleted` 为 `true` 时，返回参考答案
     */
    referenceAnswer?: Array<CSBpDragSortEntry> | null;
    /**
     * AI 反馈的文本，前端显示为数字人气泡
     */
    feedback?: string | null;
    /**
     * 用时，单位为秒
     */
    duration?: number | null;
};

