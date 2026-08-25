"use server";
import { returnValidationErrors } from "next-safe-action";
import { z } from "zod";

import { protectedActionClient } from "@/lib/action-client";

const inputSchema = z.object({
    serviceId: z.uuid(),
    date: z.coerce.date().refine((date) => !Number.isNaN(date.getTime()), {
        message: "Data inválida",
    }),
    employeeId: z.string().uuid().optional(),
});

export const createBookingCheckoutSession = protectedActionClient
    .inputSchema(inputSchema)
    .action(async ({ parsedInput: { serviceId, date, employeeId }, ctx: { user } }) => {
        return returnValidationErrors(inputSchema, {
            _errors: ["Integração Stripe desativada. O agendamento deve ser feito sem pagamento online."],
        });
    });
