/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CSBpDragSortEntry } from './CSBpDragSortEntry';
export type CSBpDragSortParams = {
    /**
     * 标题
     */
    title: string;
    /**
     * 描述
     */
    description: string;
    /**
     * 导入气泡文字
     */
    introBubbleText?: string;
    /**
     * 尾部描述
     */
    trailingText?: string;
    /**
     * 操作说明
     */
    instruction: string;
    /**
     * 放置位
     */
    blanks: Array<{
        /**
         * 头部文字
         */
        leadingText: string;
    }>;
    /**
     * 可用词条
     */
    entries: Array<CSBpDragSortEntry>;
};

