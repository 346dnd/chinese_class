/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { StuClassV1AvailableNodeKey } from './StuClassV1AvailableNodeKey';
export type StuClassV1Node = {
    /**
     * 节点 ID
     */
    id: number;
    /**
     * 映射到特定前端组件
     */
    key: StuClassV1AvailableNodeKey;
    /**
     * 节点标题
     */
    title: string;
    /**
     * 是否激活
     */
    isEnabled?: boolean;
    /**
     * 是否已完成
     */
    isCompleted?: boolean;
    /**
     * 是否允许完成后再次进入
     */
    allowReentry?: boolean;
};

