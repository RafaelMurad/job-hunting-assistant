/**
 * NextAuth Type Augmentation
 *
 * Extends NextAuth's built-in types to include custom user properties.
 * This provides type safety for session and JWT token data throughout the app.
 *
 * @module types/auth
 * @see https://next-auth.js.org/getting-started/typescript
 */

import { type UserRole } from "./database";

declare module "next-auth" {
  /**
   * Extends the built-in session user object
   */
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: UserRole;
      isTrusted: boolean;
    };
  }

  /**
   * Extends the built-in user object
   */
  interface User {
    role?: UserRole;
    isTrusted?: boolean;
  }
}

declare module "next-auth/jwt" {
  /**
   * Extends the JWT token object
   */
  interface JWT {
    id?: string;
    role?: UserRole | string;
    isTrusted?: boolean;
  }
}

export {};
