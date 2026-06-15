export const queryKeys = {
    getDateAvailableTimeSlots: (barbershopId: string, serviceId: string, date?: Date) => [
        "available-time-slots",
        barbershopId,
        serviceId,
        date,
    ],
    getAvailableEmployees: (barbershopId: string, dateTime?: Date, durationMinutes?: number) => [
        "available-employees",
        barbershopId,
        dateTime,
        durationMinutes,
    ],
}
