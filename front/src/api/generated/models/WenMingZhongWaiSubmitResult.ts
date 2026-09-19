/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type WenMingZhongWaiSubmitResult = {
    /**
     * 提交 ID
     */
    id: string;
    /**
     * 学生提交的回答; 该对象中每个成员的键对应一个 `blankId`
     */
    answers: Record<string, string>;
    /**
     * 是否还在处理中
     */
    isProcessing: boolean;
    /**
     * 出错的位置，空数组或为空代表全部回答正确
     */
    errors?: Array<{
        /**
         * 错误项所在的行 ID
         */
        rowId: string;
        /**
         * 错误的填空 ID
         */
        blankId: string;
        /**
         * 错误提示
         */
        msg?: string | null;
    }> | null;
    /**
     * 是否完成; 回答正确或到达最大提交次数时为 `true`
     */
    isCompleted?: boolean | null;
    /**
     * 参考答案; 在 `isCompleted` 为 `true` 时，返回参考答案
     */
    referenceAnswer?: Record<string, string> | null;
    /**
     * AI 反馈的文本，前端显示为数字人气泡
     */
    feedback?: string | null;
    /**
     * 在 `isCompleted` 为 `true` 时，返回总结信息
     */
    ending?: {
        /**
         * 说明
         */
        instruction: string;
        /**
         * 总结视频
         */
        video: {
            /**
             * 视频文件 ID
             */
            id: string;
            /**
             * 视频链接 (支持相对或绝对链接)
             */
            src: string;
        };
    } | null;
    /**
     * 用时，单位为秒
     */
    duration?: number | null;
};

