/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ZhaoZhouQiaoSumbitResp } from './ZhaoZhouQiaoSumbitResp';
export type ZhaoZhouQiaoState = {
    /**
     * 问题卡列表
     */
    cards: Array<{
        /**
         * 问题卡 ID
         */
        id: string;
        /**
         * 问题
         */
        title: string;
        /**
         * 额外描述
         */
        description?: string | null;
        /**
         * 输入框配置
         */
        input?: {
            /**
             * 占位符
             */
            placeholder?: string;
            /**
             * 字数要求
             */
            length?: any;
        };
        /**
         * 是否只允许语音输入，为 `true` 时表示朗读题
         */
        voiceOnly?: boolean;
        /**
         * 额外资源
         */
        assets?: Array<{
            /**
             * 类型
             */
            type: 'image' | 'video';
            /**
             * 资源链接 (支持相对或绝对链接)
             */
            src: string;
        }>;
        /**
         * 提交记录
         */
        submitLogs: Array<ZhaoZhouQiaoSumbitResp>;
    }>;
};

