/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Video } from './Video';
export type CulturalStyleState = {
    title: string;
    desc: string;
    video: Video;
    /**
     * 问题
     */
    questions: Array<{
        id: string;
        /**
         * 问题类型
         */
        type: 'order' | 'choice';
        /**
         * 如：思考时刻
         */
        title: string;
        /**
         * 问题文本
         */
        text: string;
        /**
         * 题目是否完成
         */
        completed: boolean;
        /**
         * 排序题
         */
        items?: Array<{
            id: string;
            content: string;
        }>;
        /**
         * 选择题
         */
        options?: Array<{
            id: string;
            /**
             * 选项内容
             */
            content: string;
        }>;
    }>;
    /**
     * 是否完成学习
     *
     */
    completed: boolean;
};

