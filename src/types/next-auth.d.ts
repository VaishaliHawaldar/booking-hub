import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    /** Auth0 access token, forwarded to the .NET Core Web API. */
    accessToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
  }
}
