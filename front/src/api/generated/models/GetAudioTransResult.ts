/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type GetAudioTransResult = {
    /**
     * 对应语音文件的fileId
     */
    fileId: string;
    /**
     * 状态枚举：processing / finish / fail
     */
    status: GetAudioTransResult.status;
    /**
     * 转写文字，未完成或失败时为空
     */
    text?: string | null;
};
export namespace GetAudioTransResult {
    /**
     * 状态枚举：processing / finish / fail
     */
    export enum status {
        PROCESSING = 'processing',
        FINISH = 'finish',
        FAIL = 'fail',
    }
}

