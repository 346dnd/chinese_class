/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { InitialImpressionsSubmitResult } from './InitialImpressionsSubmitResult';
import type { StyleOverridableText } from './StyleOverridableText';
import type { TextLengthLimit } from './TextLengthLimit';
export type InitialInsightState = {
    /**
     * 问题列表，长度为 2
     */
    questions: Array<{
        /**
         * 问题 ID
         */
        id: string;
        /**
         * 问题标题
         */
        title: string;
        /**
         * 题目内容
         */
        content: Array<({
            type: string;
            value: StyleOverridableText;
        } | {
            type: string;
            /**
             * 填空位 ID
             */
            id: string;
            /**
             * 状态
             */
            state: 'UNANSWERED' | 'PENDING' | 'RETRYING' | 'CORRECT' | 'WRONG';
            /**
             * 状态为 `CORRECT` 或 `WRONG` 时，在这里返回参考答案
             */
            referenceAnswer?: string | null;
            /**
             * 未作答时的占位符
             */
            placeholder?: string | null;
            /**
             * 等待重新作答时的占位符
             */
            retryPlaceholder?: string | null;
            /**
             * 学生填空长度要求
             */
            length?: TextLengthLimit;
        })>;
        /**
         * 提交记录
         */
        submitLogs: Array<InitialImpressionsSubmitResult>;
    }>;
};

