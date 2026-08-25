"use server";

import { compare, hash } from "bcrypt";
import { headers } from "next/headers";
import { returnValidationErrors } from "next-safe-action";
import { z } from "zod";

import { actionClient } from "@/lib/action-client";
import { extractDashboardToken, parseDashboardToken } from "@/lib/dashboard-auth";
import { prisma } from "@/lib/prisma";

const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, "Informe a senha atual"),
    newPassword: z.string().min(6, "A nova senha deve ter no mínimo 6 caracteres"),
    confirmPassword: z.string().min(1, "Confirme a nova senha"),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "As senhas não correspondem",
    path: ["confirmPassword"],
});

export const changeDashboardPassword = actionClient
    .inputSchema(changePasswordSchema)
    .action(async ({ parsedInput: { currentPassword, newPassword } }) => {
        const requestHeaders = await headers();
        const token = extractDashboardToken(
            requestHeaders.get("authorization") ?? undefined,
            requestHeaders.get("cookie") ?? undefined,
        );
        const userPayload = parseDashboardToken(token);

        if (!userPayload) {
            return returnValidationErrors(changePasswordSchema, {
                _errors: ["Sessão expirada. Faça login novamente."],
            });
        }

        const user = await prisma.user.findUnique({
            where: { id: userPayload.id },
            select: { password: true },
        });

        if (!user?.password) {
            return returnValidationErrors(changePasswordSchema, {
                _errors: ["Este usuário não possui senha para ser alterada."],
            });
        }

        const isCurrentPasswordValid = await compare(currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            return returnValidationErrors(changePasswordSchema, {
                _errors: ["A senha atual está incorreta."],
            });
        }

        await prisma.user.update({
            where: { id: userPayload.id },
            data: { password: await hash(newPassword, 10) },
        });

        return { success: true };
    });
