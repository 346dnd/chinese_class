/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AISearchReference } from './AISearchReference';
export type StreamChatMessage = {
    id: string;
    choices: Array<{
        delta: {
            content: string;
            role: string | null;
        };
        finish_reason: string | null;
        index: number;
    }>;
    created: number;
    usage?: {
        completion_tokens?: number | null;
        prompt_tokens?: number | null;
        total_tokens?: number | null;
        completion_tokens_details?: null;
        prompt_tokens_details?: {
            audio_tokens?: null;
            cached_tokens?: number | null;
        } | null;
    } | null;
    references?: Array<AISearchReference> | null;
};

