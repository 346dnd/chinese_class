/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { IntroVideo } from './IntroVideo';
import type { StuClassV1Section } from './StuClassV1Section';
export type StuClassV1DetailResp = {
    /**
     * 课程包信息，特殊值，代表一个客户端中写死的课程包
     */
    course: StuClassV1DetailResp.course;
    /**
     * 章节列表
     */
    sections: Array<StuClassV1Section>;
    introVideo?: IntroVideo;
};
export namespace StuClassV1DetailResp {
    /**
     * 课程包信息，特殊值，代表一个客户端中写死的课程包
     */
    export enum course {
        '_4' = 4,
    }
}

