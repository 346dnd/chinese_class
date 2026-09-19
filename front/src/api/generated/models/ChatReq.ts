/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AIMessages } from './AIMessages';
export type ChatReq = {
    /**
     * 历史对话组成的消息列
     */
    messages?: AIMessages;
    /**
     * 用户输入的一条消息，如传递该字段且没有传递 `messages`，表明该对话无需历史记录或历史记录由服务端通过 Session 管理
     */
    promot?: string;
};

