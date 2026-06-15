'use client';

import { useEffect } from 'react';

export function GlobalEventListener() {
  useEffect(() => {
    const handleBookingCreated = () => {};

    window.addEventListener('dashboard-booking-created', handleBookingCreated);

    return () => {
      window.removeEventListener('dashboard-booking-created', handleBookingCreated);
    };
  }, []);

  return null;
}
