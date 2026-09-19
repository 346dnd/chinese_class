/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type GetUserResp = {
    /**
     * 用户 ID
     */
    id: number;
    /**
     * 登录时用的用户名
     */
    username: string;
    /**
     * 显示在客户端的姓名或昵称
     */
    name: string;
    /**
     * 用户角色
     */
    role: GetUserResp.role;
    /**
     * 用户头像链接，必须是一个相对链接，以 `/` 开头
     */
    avatar: string | null;
    /**
     * 学生信息，如果 `role` 为学生，必须包含该对象
     */
    stuInfo?: {
        /**
         * 年级名称，直接显示在前端
         */
        gradeName?: string;
        /**
         * 所属班级名称
         */
        className: string;
    };
};
export namespace GetUserResp {
    /**
     * 用户角色
     */
    export enum role {
        ADMIN = 'admin',
        STUDENT = 'student',
        TEACHER = 'teacher',
    }
}

