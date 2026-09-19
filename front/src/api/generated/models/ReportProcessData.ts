/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CSBpDragSortParams } from './CSBpDragSortParams';
import type { CSBpDragSortState } from './CSBpDragSortState';
import type { GetState } from './GetState';
import type { HeritageCulturalState } from './HeritageCulturalState';
import type { InitialInsightState } from './InitialInsightState';
import type { WenMingZhongWaiParams } from './WenMingZhongWaiParams';
import type { WenMingZhongWaiState } from './WenMingZhongWaiState';
import type { WriteThoughtState } from './WriteThoughtState';
import type { ZhaoZhouQiaoState } from './ZhaoZhouQiaoState';
export type ReportProcessData = ({
    type: string;
    data: {
        state: WriteThoughtState;
    };
} | {
    type: string;
    data: {
        state: InitialInsightState;
    };
} | {
    type: string;
    data: Array<{
        /**
         * 问题标题
         */
        title: string;
        bpRecord: ({
            /**
             * 交互点类型
             */
            bpType: string;
            /**
             * 选择的选项
             */
            selected: {
                /**
                 * 选项文本
                 */
                text: string;
                /**
                 * 用时，单位为秒
                 */
                duration?: number | null;
            };
        } | {
            /**
             * 交互点类型
             */
            bpType: string;
            params: CSBpDragSortParams;
            state: CSBpDragSortState;
        });
    }>;
} | {
    type: string;
    data: {
        state: ZhaoZhouQiaoState;
    };
} | {
    type: string;
    data: {
        params: WenMingZhongWaiParams;
        state: WenMingZhongWaiState;
    };
} | {
    type: string;
    data: {
        /**
         * 标题
         */
        title: string;
        state: HeritageCulturalState;
    };
} | {
    type: string;
    data: Array<{
        /**
         * 标题
         */
        title: string;
        /**
         * 功能点记录
         */
        fnRecord: ({
            /**
             * 功能点类型
             */
            fnType: string;
            logs: Array<GetState>;
        } | {
            fnType: string;
            logs: GetState;
        });
    }>;
});

