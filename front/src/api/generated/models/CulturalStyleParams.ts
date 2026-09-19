/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { IntroVideo } from './IntroVideo';
export type CulturalStyleParams = {
    /**
     * 节点标题
     */
    title: string;
    /**
     * 活动导入视频
     */
    introVideo?: IntroVideo;
    /**
     * 互动视频
     */
    video: {
        /**
         * 视频的 URL (支持相对或绝对链接)
         */
        url: string;
    };
};

