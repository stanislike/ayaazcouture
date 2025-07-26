import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./db/prisma";
import CredentialsProvider from "next-auth/providers/credentials";
import { compareSync } from "bcrypt-ts-edge";
import type { NextAuthConfig, Session, User } from "next-auth";
import type { JWT } from "next-auth/jwt";
import { NextResponse } from "next/server";

interface CustomUser extends User {
  role: string;
}

interface CustomSession extends Session {
  user: CustomUser;
}

declare module "next-auth" {
  interface User {
    role: string;
  }
  interface Session {
    user: CustomUser;
  }
}

export const config: NextAuthConfig = {
  pages: {
    signIn: "/auth/sign-in",
    error: "/auth/sign-in",
    signOut: "/auth/sign-out",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      credentials: {
        email: { type: "email" },
        password: { type: "password" },
      },
      async authorize(credentials) {
        if (credentials == null) return null;

        const user = await prisma.user.findFirst({
          where: {
            email: credentials.email as string,
          },
        });

        if (user && user.password) {
          const isMatch = compareSync(
            credentials.password as string,
            user.password
          );

          //password correct
          if (isMatch) {
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
            };
          }
        }

        return null;
      },
    }),
  ],

  callbacks: {
    async session({
      session,
      user,
      trigger,
      token,
    }: {
      session: CustomSession;
      user: CustomUser;
      trigger?: "update" | string;
      token: JWT & { role?: string };
    }) {
      session.user.id = token.sub as string;
      session.user.role = token.role as string;
      session.user.name = token.name as string;

      if (trigger === "update") {
        session.user.name = user.name;
      }

      return session;
    },
    async jwt({
      token,
      user,
      trigger,
      session,
    }: {
      token: JWT & { role?: string };
      user?: CustomUser;
      trigger?: "signIn" | "signUp" | "update";
      session?: CustomSession;
    }) {
      // assign user field to token
      if (user) {
        token.role = user.role;

        //If user has no name then use the email
        if (user.name === "NO_NAME") {
          token.name = user.email!.split("@")[0];

          // Update database to reflect the name change
          await prisma.user.update({
            where: { id: user.id },
            data: { name: token.name },
          });
        }
      }
      return token;
    },
    authorized({ request, auth }) {
      //Check for session cart cookie
      if (!request.cookies.get("sessionCartId")) {
        // generate new session cart id cookie
        const sessionCartId = crypto.randomUUID();

        // Clone the request headers
        const newRequestHeaders = new Headers(request.headers);

        //Create new response and add the new headers
        const response = NextResponse.next({
          request: {
            headers: newRequestHeaders,
          },
        });

        // Set newly generated sessionCartId in the response cookies
        response.cookies.set("sessionCartId", sessionCartId);

        return response;
      } else {
        return true;
      }
    },
  },
};
export const { handlers, auth, signIn, signOut } = NextAuth(config);
