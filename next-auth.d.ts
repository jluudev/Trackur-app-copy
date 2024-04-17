import { type DefaultSession } from 'next-auth';

declare module "next-auth" {
  interface Session {
    user: {
      id: number,
      username: string,
      password: string,
      profilePicture?: string,
      post_like_count: number,
      liked_posts: number[],
      liked_comments: number[],
      role: string
    } & DefaultSession['expires'];
  }
}