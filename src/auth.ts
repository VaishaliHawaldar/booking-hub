import NextAuth from "next-auth";
import Auth0 from "next-auth/providers/auth0";

/**
 * Auth.js (NextAuth v5) configuration using Auth0 as an OIDC provider.
 *
 * Required environment variables (see .env.example):
 *   - AUTH_SECRET         random string used to encrypt the session JWT
 *   - AUTH_AUTH0_ID       Auth0 application client ID
 *   - AUTH_AUTH0_SECRET   Auth0 application client secret
 *   - AUTH_AUTH0_ISSUER   Auth0 issuer URL, e.g. https://your-tenant.us.auth0.com
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Auth0({
      clientId: process.env.AUTH_AUTH0_ID,
      clientSecret: process.env.AUTH_AUTH0_SECRET,
      issuer: process.env.AUTH_AUTH0_ISSUER,
    }),
  ],
  callbacks: {
    // Persist the Auth0 access token on the JWT so we can forward it to the
    // .NET Core Web API later.
    async jwt({ token, account }) {
      if (account) {
        console.log("Auth0 access token:", account.access_token);
        token.accessToken = account.access_token;
      }
      return token;
    },
    // Expose the access token to the client/server via the session object.
    // (Auth0 access token, forwarded to the .NET Core Web API.)
    async session({ session, token }) {
      session.accessToken = token.accessToken as string | undefined;
      return session;
    },
  },
});
