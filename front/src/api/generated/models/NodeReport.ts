/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ReportDetails } from './ReportDetails';
export type NodeReport = {
    /**
     * 节点 ID
     */
    id: number;
    /**
     * 当前节点标题
     */
    title: string;
    /**
     * 完成用时
     *
     */
    time?: number | null;
    /**
     * 当前节点获得积分数
     */
    pointsEarned?: number | null;
    /**
     * 错误信息，如果当前节点的报告生成出错可以将错误信息写在这里，供日志记录
     */
    errMsg?: string | null;
    details?: ReportDetails | null;
};

