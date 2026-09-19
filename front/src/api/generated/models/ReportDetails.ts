/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ReportProcessData } from './ReportProcessData';
/**
 * 语文V4报告通用版
 */
export type ReportDetails = {
    data: {
        /**
         * 学习过程
         */
        process: {
            /**
             * 标题
             */
            title: string;
            /**
             * 描述
             */
            description?: string;
            /**
             * 过程数据
             */
            data: ReportProcessData;
        };
        /**
         * 任务评价
         */
        evaluation: {
            /**
             * 标题
             */
            title: string;
            /**
             * 等级
             */
            rating?: ReportDetails.rating;
            /**
             * 等级标签颜色
             */
            ratingColor?: {
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
             * 点评
             */
            comment?: string;
            /**
             * 分项
             */
            items?: Array<{
                title: string;
                text: string;
            }>;
        };
    };
};
export namespace ReportDetails {
    /**
     * 等级
     */
    export enum rating {
        S = 'S',
        A = 'A',
        B = 'B',
        C = 'C',
        D = 'D',
        E = 'E',
        F = 'F',
    }
}

