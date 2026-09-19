/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { MomentExtraObj } from './MomentExtraObj';
import type { UserBaseInfo } from './UserBaseInfo';
export type Moment = {
    /**
     * 朋友圈动态 ID
     */
    id: number;
    /**
     * 发布者信息
     */
    author: UserBaseInfo;
    /**
     * 动态内容
     */
    content: string;
    /**
     * 可选的图片列表
     */
    images?: Array<{
        /**
         * 图片链接，必须是一个相对链接，以 `/` 开头
         */
        url: string;
    }>;
    /**
     * 可选的 JSON 对象列表
     */
    objs?: Array<MomentExtraObj>;
    /**
     * 发布时间，Unix 时间戳 (秒)
     */
    createdAt: number;
    /**
     * 获得的点赞列表
     */
    likes: Array<{
        /**
         * 点赞者信息
         */
        user: UserBaseInfo;
    }>;
    /**
     * 获得的评论列表
     */
    comments: Array<{
        /**
         * 评论 ID
         */
        id: number;
        /**
         * 评论者信息
         */
        user: any;
        /**
         * 评论内容
         */
        content: string;
    }>;
    /**
     * 我 (当前用户) 是否点赞了这条动态
     */
    likedByMe: boolean;
    /**
     * 单条动态点赞数量
     */
    likeCount: number | null;
    /**
     * 单条动态评论数量
     */
    commentCount: number | null;
};

