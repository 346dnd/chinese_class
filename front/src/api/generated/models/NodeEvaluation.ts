/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

/**
 * 等级标签颜色
 */
export type NodeEvaluationRatingColor = {
    /**
     * 背景色
     */
    bg: string;
    /**
     * 前景色
     */
    fg: string;
};

/**
 * 分项
 */
export type NodeEvaluationItem = {
    title: string;
    text: string;
};

/**
 * 任务评价
 */
export type NodeEvaluationEvaluation = {
    /**
     * 标题
     */
    title: string;
    /**
     * 等级
     */
    rating?: 'S' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
    /**
     * 等级标签颜色
     */
    ratingColor?: NodeEvaluationRatingColor;
    /**
     * 点评
     */
    comment?: string;
    /**
     * 分项
     */
    items?: Array<NodeEvaluationItem>;
};

/**
 * 节点综合评价
 */
export type NodeEvaluation = {
    /**
     * 是否在处理中
     */
    isProcessing: boolean;
    /**
     * 任务评价
     */
    evaluation?: NodeEvaluationEvaluation | null;
};
