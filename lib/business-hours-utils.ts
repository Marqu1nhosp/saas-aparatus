import { prisma } from '@/lib/prisma';

export interface TimeAvailability {
    available: boolean;
    reason?: string;
}

const SAO_PAULO_TIME_ZONE = 'America/Sao_Paulo';

function isValidDate(date: Date): boolean {
    return date instanceof Date && !Number.isNaN(date.getTime());
}

function getDatePartsInSaoPaulo(date: Date) {
    const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: SAO_PAULO_TIME_ZONE,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).formatToParts(date);

    const year = parts.find((part) => part.type === 'year')?.value ?? '0000';
    const month = parts.find((part) => part.type === 'month')?.value ?? '01';
    const day = parts.find((part) => part.type === 'day')?.value ?? '01';

    return { year, month, day, ymd: `${year}-${month}-${day}` };
}

function getTimeInSaoPaulo(date: Date) {
    return new Intl.DateTimeFormat('pt-BR', {
        timeZone: SAO_PAULO_TIME_ZONE,
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    }).format(date);
}

function getDayOfWeekInSaoPaulo(date: Date): number {
    const shortWeekDay = new Intl.DateTimeFormat('en-US', {
        timeZone: SAO_PAULO_TIME_ZONE,
        weekday: 'short',
    }).format(date);

    const dayMap: Record<string, number> = {
        Sun: 0,
        Mon: 1,
        Tue: 2,
        Wed: 3,
        Thu: 4,
        Fri: 5,
        Sat: 6,
    };

    return dayMap[shortWeekDay] ?? 0;
}

function compareTime(time1: string, time2: string): number {
    const [h1, m1] = time1.split(':').map(Number);
    const [h2, m2] = time2.split(':').map(Number);
    const mins1 = h1 * 60 + m1;
    const mins2 = h2 * 60 + m2;
    return mins1 - mins2;
}

function addMinutesToTime(time: string, minutes: number) {
    const [hours, mins] = time.split(':').map(Number);
    const totalMinutes = hours * 60 + mins + minutes;
    const resultHours = Math.floor(totalMinutes / 60)
        .toString()
        .padStart(2, '0');
    const resultMinutes = (totalMinutes % 60).toString().padStart(2, '0');

    return `${resultHours}:${resultMinutes}`;
}

function createSaoPauloDateTime(ymd: string, time: string): Date {
    const [hour, minute, secondPart = '00'] = time.split(':');
    const [second, millisecond = '000'] = secondPart.split('.');
    const normalizedTime = `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}:${second.padStart(2, '0')}.${millisecond.padEnd(3, '0')}`;
    return new Date(`${ymd}T${normalizedTime}-03:00`);
}

function addMinutes(date: Date, minutes: number) {
    return new Date(date.getTime() + minutes * 60000);
}

function intervalsOverlap(startA: Date, endA: Date, startB: Date, endB: Date) {
    return startA < endB && startB < endA;
}

export async function checkTimeAvailability(
    barbershopId: string,
    dateTime: Date,
    durationMinutes: number,
    employeeId?: string
): Promise<TimeAvailability> {
    try {
        if (!isValidDate(dateTime)) {
            return {
                available: false,
                reason: 'Data inválida.',
            };
        }

        const dayOfWeek = getDayOfWeekInSaoPaulo(dateTime);
        const selectedDate = getDatePartsInSaoPaulo(dateTime);
        const startTime = getTimeInSaoPaulo(dateTime);
        const endTime = addMinutesToTime(startTime, durationMinutes);

        const businessHours = await prisma.businessHours.findUnique({
            where: {
                barbershopId_dayOfWeek: {
                    barbershopId,
                    dayOfWeek,
                },
            },
        });

        if (!businessHours) {
            return {
                available: false,
                reason: 'Horários não configurados para este dia.',
            };
        }

        if (businessHours.isClosed) {
            return {
                available: false,
                reason: 'Barbearia fechada neste dia.',
            };
        }

        if (!businessHours.openingTime || !businessHours.closingTime) {
            return {
                available: false,
                reason: 'Horários não configurados para este dia.',
            };
        }

        if (compareTime(startTime, businessHours.openingTime) < 0) {
            return {
                available: false,
                reason: `Horário anterior à abertura (${businessHours.openingTime}).`,
            };
        }

        if (compareTime(endTime, businessHours.closingTime) > 0) {
            return {
                available: false,
                reason: `Horário finaliza após o fechamento (${businessHours.closingTime}).`,
            };
        }

        if (businessHours.lunchStart && businessHours.lunchEnd) {
            if (
                compareTime(startTime, businessHours.lunchStart) >= 0 &&
                compareTime(startTime, businessHours.lunchEnd) < 0
            ) {
                return {
                    available: false,
                    reason: `Horário durante o almoço (${businessHours.lunchStart} - ${businessHours.lunchEnd}).`,
                };
            }

            if (
                compareTime(startTime, businessHours.lunchStart) < 0 &&
                compareTime(endTime, businessHours.lunchStart) > 0
            ) {
                return {
                    available: false,
                    reason: `Horário cruza o intervalo de almoço (${businessHours.lunchStart} - ${businessHours.lunchEnd}).`,
                };
            }
        }

        const dayStart = createSaoPauloDateTime(selectedDate.ymd, '00:00');
        const dayEnd = createSaoPauloDateTime(selectedDate.ymd, '23:59:59.999');
        const desiredStart = createSaoPauloDateTime(selectedDate.ymd, startTime);
        const desiredEnd = createSaoPauloDateTime(selectedDate.ymd, endTime);

        if (employeeId) {
            const employee = await prisma.user.findFirst({
                where: {
                    id: employeeId,
                    barbershopId,
                    role: 'EMPLOYEE',
                },
            });

            if (!employee) {
                return {
                    available: false,
                    reason: 'Barbeiro não encontrado ou não pertence a esta barbearia.',
                };
            }

            const employeeBookings = await prisma.booking.findMany({
                where: {
                    employeeId,
                    barbershopId,
                    cancelledAt: null,
                    date: {
                        gte: dayStart,
                        lte: dayEnd,
                    },
                },
                include: {
                    service: {
                        select: {
                            durationMinutes: true,
                        },
                    },
                },
            });

            const hasOverlap = employeeBookings.some((booking) => {
                const bookingStart = booking.date;
                const bookingEnd = addMinutes(bookingStart, booking.service.durationMinutes);
                return intervalsOverlap(desiredStart, desiredEnd, bookingStart, bookingEnd);
            });

            if (hasOverlap) {
                return {
                    available: false,
                    reason: 'Este barbeiro não está disponível para este horário.',
                };
            }

            return { available: true };
        }

        const employeesCount = await prisma.user.count({
            where: {
                barbershopId,
                role: 'EMPLOYEE',
            },
        });

        if (employeesCount === 0) {
            return {
                available: false,
                reason: 'Nenhum barbeiro disponível nesta barbearia.',
            };
        }

        const bookings = await prisma.booking.findMany({
            where: {
                barbershopId,
                cancelledAt: null,
                date: {
                    gte: dayStart,
                    lte: dayEnd,
                },
            },
            include: {
                service: {
                    select: {
                        durationMinutes: true,
                    },
                },
            },
        });

        const overlappingBookings = bookings.filter((booking) => {
            const bookingStart = booking.date;
            const bookingEnd = addMinutes(bookingStart, booking.service.durationMinutes);
            return intervalsOverlap(desiredStart, desiredEnd, bookingStart, bookingEnd);
        });

        if (overlappingBookings.length >= employeesCount) {
            return {
                available: false,
                reason: 'Não há horários disponíveis para este horário.',
            };
        }

        return { available: true };
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error('Error checking time availability:', error);
        return {
            available: false,
            reason: `Erro ao verificar disponibilidade: ${message}`,
        };
    }
}

export async function findAvailableEmployee(
    barbershopId: string,
    dateTime: Date,
    durationMinutes: number,
) {
    if (!isValidDate(dateTime)) {
        return null;
    }

    const selectedDate = getDatePartsInSaoPaulo(dateTime);
    const startTime = getTimeInSaoPaulo(dateTime);
    const endTime = addMinutesToTime(startTime, durationMinutes);
    const desiredStart = createSaoPauloDateTime(selectedDate.ymd, startTime);
    const desiredEnd = createSaoPauloDateTime(selectedDate.ymd, endTime);
    const dayStart = createSaoPauloDateTime(selectedDate.ymd, '00:00');
    const dayEnd = createSaoPauloDateTime(selectedDate.ymd, '23:59:59.999');

    const employees = await prisma.user.findMany({
        where: {
            barbershopId,
            role: 'EMPLOYEE',
        },
        include: {
            employeeBookings: {
                where: {
                    cancelledAt: null,
                    date: {
                        gte: dayStart,
                        lte: dayEnd,
                    },
                },
                include: {
                    service: {
                        select: {
                            durationMinutes: true,
                        },
                    },
                },
            },
        },
    });

    for (const employee of employees) {
        const isAvailable = employee.employeeBookings.every((booking) => {
            const bookingStart = booking.date;
            const bookingEnd = addMinutes(bookingStart, booking.service.durationMinutes);
            return !intervalsOverlap(desiredStart, desiredEnd, bookingStart, bookingEnd);
        });

        if (isAvailable) {
            return employee;
        }
    }

    return null;
}
