/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * 矩阵表格数据模型
 */
export type matrix = {
    /**
     * 列定义
     */
    columns: Array<{
        /**
         * 列标识，cell 通过此值关联到对应列
         */
        key: string;
        /**
         * 列表头标题
         */
        title: string;
        /**
         * 弹性比例，控制列宽，默认为 1
         */
        flex?: number;
    }>;
    /**
     * 行数据
     */
    rows: Array<{
        /**
         * 行 ID
         */
        rowId: string;
        /**
         * 单元格数组，每个 cell 通过 columnKey 关联到 columns[*].key
         */
        cells: Array<{
            /**
             * 所属列的 key，对应 columns[*].key
             */
            columnKey: string;
            /**
             * 单元格类型：text-静态文本 | correct-answer-正确答案 | input-学生作答
             */
            type: 'text' | 'correct-answer' | 'input';
            /**
             * 文本内容（type 为 text 或 correct-answer 时使用）
             */
            content?: string;
            /**
             * 学生作答内容（type 为 input 时使用）
             */
            studentAnswer?: string;
            /**
             * 判分状态（type 为 input 时使用）
             */
            status?: 'passed' | 'failed';
            /**
             * 教师/AI 反馈（type 为 input 时使用）
             */
            feedback?: string;
        }>;
    }>;
};

