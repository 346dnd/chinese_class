/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { IntroVideo } from './IntroVideo';
import type { matrix } from './matrix';
export type WenMingZhongWaiParams = {
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
     * 问题描述
     */
    description: string;
    /**
     * 矩阵数据
     */
    matrix: matrix;
};

