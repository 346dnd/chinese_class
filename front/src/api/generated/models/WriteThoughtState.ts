/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { WriteThoughtSubmitResult } from './WriteThoughtSubmitResult';
export type WriteThoughtState = {
    /**
     * 问题列表，长度为 3
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
         * 输入框占位符
         */
        placeholder?: string;
        /**
         * 提交记录
         */
        submitLogs: Array<WriteThoughtSubmitResult>;
    }>;
};

