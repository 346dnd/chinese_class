/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BaseActivityStatusString } from './BaseActivityStatusString';
export type GetStuClassReport = {
    /**
     * 课堂标题
     */
    title: string;
    /**
     * 概要信息
     */
    summary: {
        /**
         * 学习节点(活动)总数
         */
        nodeCount: number;
        /**
         * 已完成的节点数
         */
        finishedNodeCount: number;
        /**
         * 获赞数
         */
        likeCount: number;
        /**
         * 评论我的数量
         */
        commentReceivedCount: number;
        /**
         * 学习用时，即所有已完成节点的用时总和，单位为秒
         */
        studyDuration: number;
        /**
         * 学习积分
         */
        points: number;
        /**
         * 学习积分的最近一次变动数，可以是负数
         */
        pointsChange: number;
    };
    /**
     * 节点
     */
    nodes: Array<{
        id: string;
        /**
         * 标题
         */
        title: string;
        /**
         * 完成状态
         */
        status: BaseActivityStatusString;
    }>;
};

