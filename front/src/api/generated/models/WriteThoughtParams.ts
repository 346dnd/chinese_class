/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { IntroVideo } from './IntroVideo';
import type { StyleOverridableText } from './StyleOverridableText';
export type WriteThoughtParams = {
    /**
     * 节点标题
     */
    title: string;
    /**
     * 活动导入视频
     */
    introVideo?: IntroVideo;
    /**
     * 导入气泡文字
     */
    introBubbleText?: string;
    /**
     * 右侧说明区标题
     */
    subtitle: string;
    /**
     * 描述
     */
    description: Array<StyleOverridableText>;
};

