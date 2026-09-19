/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GetUserResp } from './GetUserResp';
export type AuthSigninResp = {
    /**
     * 认证 token，客户端请求时会将它放在 Authorization 请求头中
     */
    token: string;
    /**
     * 用户信息对象
     */
    user: GetUserResp;
};

