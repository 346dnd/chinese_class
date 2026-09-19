/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type GetParams = {
    /**
     * 导入气泡文字
     */
    introBubbleText: string;
    /**
     * 标题
     */
    title: string;
    /**
     * 任务说明（诗歌、剧本、海报）
     */
    description: string;
    inputs: Array<{
        /**
         * 输入项id
         */
        'id ': string;
        /**
         * 占位符
         */
        placeholder: string;
    }>;
};

