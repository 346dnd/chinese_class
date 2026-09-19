/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type Publish_result = {
    /**
     * 点评
     */
    comment: string;
    /**
     * 点赞个数
     */
    likeCount?: number;
    /**
     * 发表的内容
     */
    content: {
        image: {
            id: string;
            src: string;
        } | null;
    };
};

