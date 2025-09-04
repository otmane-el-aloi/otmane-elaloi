import type { Post } from "../types";

declare global {
  interface Window {
    __POSTS__?: Post[];
    __BASE__?: string;
  }
}
export {};
