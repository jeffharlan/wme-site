/// <reference path="../.astro/types.d.ts" />

declare namespace App {
  interface Locals {
    user: {
      sessionId: string;
      userId: string;
      expiresAt: string;
      username: string;
      totpEnabled: boolean | null;
    } | null;
  }
}
