export const queryKeys = {
    getDateAvailableTimeSlots: (barbershopId: string, date?: Date) => [
        "available-time-slots",
        barbershopId,
        date,
    ],
}
