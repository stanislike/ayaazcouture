import type { NextAuthConfig } from "next-auth";
import { NextResponse } from "next/server";

export const authConfig = {
  providers: [], // Required by NextAuthConfig type
  callbacks: {
    authorized({ request, auth }: any) {
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
} satisfies NextAuthConfig;
