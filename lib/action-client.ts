import { headers } from "next/headers";
import { createSafeActionClient } from "next-safe-action";

import { auth } from "./auth";
import { prisma } from "./prisma";

/**
 * A protectedActionClient that retrieves the current user session and returns the Prisma client.
 * Used in server actions for authenticated operations.
 */
export async function protectedActionClient() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        throw new Error("User not authenticated");
    }

    return {
        prisma,
        user: session.user,
        session: session.session,
    };
}

/**
 * Action client for next-safe-action.
 * Use this to create safe server actions with validation.
 */
export const actionClient = createSafeActionClient();
