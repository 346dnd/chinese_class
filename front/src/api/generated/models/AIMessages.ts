/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AISearchReference } from './AISearchReference';
export type AIMessages = Array<{
    /**
     * 角色
     */
    role: string;
    /**
     * 消息内容
     */
    content: string;
    /**
     * ai搜索中用到的参考列表
     */
    references?: Array<AISearchReference> | null;
}>;
