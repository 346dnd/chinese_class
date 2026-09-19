/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type MomentExtraObj = ({
    type: string;
    obj: Array<{
        /**
         * 问题
         */
        title: string;
        content: string;
        /**
         * 是否通过，`false` 展示为红色
         */
        isPassed: boolean;
    }>;
} | {
    type: string;
    obj: {
        /**
         * 学生回答
         */
        answer: string;
        /**
         * 参考范文
         */
        reference?: string;
        /**
         * 排版方向，默认为纵向 (垂直方向)
         */
        layoutDirection?: MomentExtraObj.layoutDirection;
    };
});
export namespace MomentExtraObj {
    /**
     * 排版方向，默认为纵向 (垂直方向)
     */
    export enum layoutDirection {
        VERTICAL = 'vertical',
        HORIZONTAL = 'horizontal',
    }
}

