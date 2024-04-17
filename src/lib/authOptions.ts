import bcrypt from 'bcryptjs';
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from './db';
import { User } from '@prisma/client';
import { NextAuthOptions } from 'next-auth';

const authOptions: NextAuthOptions = {
  debug: true,
  providers: [
    CredentialsProvider({
    id: "normal",
    name: "Username / Password", 
    // @ts-ignore
    async authorize (credentials) {
      const { username, password } = credentials as { username: string, password: string };
      try {
        const user = await prisma.user.findFirst({
          where: {
            username: {
              equals: username
            }
          }
        });
        if (user != null) {
          const samePassword = await bcrypt.compare(password, user.password);
          if (samePassword) {
            let { id, username, profilePicture, liked_comments, role } = user;
            return { id, username, profilePicture, liked_comments, role } as User;
          }
        }
      } catch (error) {
        console.log("error", JSON.stringify(error));
      }
      return null;
    }
  })],
  callbacks: {
    async session({ session, token }) {
      if (token) {
        // @ts-ignore
        let id = token.userId as number;

        const user = await prisma.user.findFirst({
          where: {
            id: {
              equals: id
            }
          }
        });

        if (user !== null) {
          const {['password']: omitted, ...rest } = user;
          Object.assign(session.user, rest);
        }
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
      }
      return token;
    }
  },
  secret: process.env.NEXTAUTH_SECRET
};

export { authOptions };