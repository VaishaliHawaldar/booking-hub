import NextAuth from "next-auth";
import Okta from "next-auth/providers/okta";

/**
 * Auth.js (NextAuth v5) configuration using Okta as an OIDC provider.
 *
 * Required environment variables (see .env.example):
 *   - AUTH_SECRET        random string used to encrypt the session JWT
 *   - AUTH_OKTA_ID       Okta application client ID
 *   - AUTH_OKTA_SECRET   Okta application client secret
 *   - AUTH_OKTA_ISSUER   Okta issuer URL, e.g. https://dev-123.okta.com/oauth2/default
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Okta({
      clientId: process.env.AUTH_OKTA_ID,
      clientSecret: process.env.AUTH_OKTA_SECRET,
      issuer: process.env.AUTH_OKTA_ISSUER,
    }),
  ],
  callbacks: {
    // Persist the Okta access token on the JWT so we can forward it to the
    // .NET Core Web API later.
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    // Expose the access token to the client/server via the session object.
    async session({ session, token }) {
      session.accessToken = token.accessToken as string | undefined;
      return session;
    },
  },
});
