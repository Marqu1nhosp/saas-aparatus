"use server";

import { returnValidationErrors } from "next-safe-action";
import { z } from "zod";

import { protectedActionClient } from "@/lib/action-client";
import { checkTimeAvailability, findAvailableEmployee } from "@/lib/business-hours-utils";
import prisma from "@/lib/prisma";

const inputSchema = z.object({
    serviceId: z.string().uuid(),
    date: z.coerce.date().refine((date) => !Number.isNaN(date.getTime()), {
        message: "Data inválida",
    }),
    employeeId: z.string().uuid().optional(),
});

export const createBooking = protectedActionClient
    .inputSchema(inputSchema)
    .action(async ({ parsedInput: { serviceId, date, employeeId }, ctx: { user } }) => {
        const service = await prisma.barbershopService.findUnique({
            where: { id: serviceId },
        });

        if (!service) {
            return returnValidationErrors(inputSchema, {
                _errors: ["Serviço não encontrado"],
            });
        }

        let selectedEmployeeId = employeeId;

        if (selectedEmployeeId) {
            const employee = await prisma.user.findFirst({
                where: {
                    id: selectedEmployeeId,
                    barbershopId: service.barbershopId,
                    role: "EMPLOYEE",
                },
            });

            if (!employee) {
                return returnValidationErrors(inputSchema, {
                    _errors: ["Barbeiro não encontrado ou não pertence a esta barbearia"],
                });
            }
        }

        const timeAvailability = await checkTimeAvailability(
            service.barbershopId,
            date,
            service.durationMinutes,
            selectedEmployeeId,
        );

        if (!timeAvailability.available) {
            return returnValidationErrors(inputSchema, {
                _errors: [timeAvailability.reason || "Horário indisponível"],
            });
        }

        if (!selectedEmployeeId) {
            const availableEmployee = await findAvailableEmployee(
                service.barbershopId,
                date,
                service.durationMinutes,
            );

            if (!availableEmployee) {
                return returnValidationErrors(inputSchema, {
                    _errors: ["Nenhum barbeiro disponível nesta barbearia"],
                });
            }

            selectedEmployeeId = availableEmployee.id;
        }

        const booking = await prisma.booking.create({
            data: {
                userId: user.id,
                barbershopId: service.barbershopId,
                serviceId,
                date,
                employeeId: selectedEmployeeId,
            },
        });

        return booking;
    });
