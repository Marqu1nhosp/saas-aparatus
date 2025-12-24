export type BookingStatus = "confirmado" | "finalizado";

export interface BookingStatusResult {
    status: BookingStatus;
    isCancelled: boolean;
    isFinished: boolean;
}

export function getBookingStatus(
    date: Date | string,
    cancelledAt: Date | string | null,
): BookingStatusResult {
    const now = new Date();
    const bookingDateObj = date instanceof Date ? date : new Date(date);
    const cancelledAtObj = cancelledAt
        ? cancelledAt instanceof Date
            ? cancelledAt
            : new Date(cancelledAt)
        : null;

    const isCancelled = cancelledAtObj !== null;
    const isFinished = isCancelled || bookingDateObj < now;
    const status: BookingStatus = isFinished ? "finalizado" : "confirmado";

    return {
        status,
        isCancelled,
        isFinished,
    };
}


