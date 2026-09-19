/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { IntroVideo } from './IntroVideo';
export type HeritageCulturalParams = {
    /**
     * 节点标题
     */
    string: string;
    /**
     * 活动导入视频
     */
    introVideo: IntroVideo;
    /**
     * 导入气泡
     */
    introBubbles: Array<{
        /**
         * 角色
         */
        role: 'foreigner' | 'native';
        /**
         * 文本
         */
        text: string;
    }>;
};

