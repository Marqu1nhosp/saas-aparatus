'use client';

import { Bell, LogOut, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

import { clearDashboardSession, useDashboardSession } from '@/lib/use-dashboard-session';

interface DashboardHeaderProps {
    userName: string | undefined;
    barbershopName: string | null;
    role: string | undefined;
}

export function DashboardHeader({ userName, barbershopName, role }: DashboardHeaderProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [newBookingCount, setNewBookingCount] = useState(0);
    const [recentBookings, setRecentBookings] = useState<Array<{ id: string; clientName: string; serviceName: string; date: string }>>([]);
    const notificationsRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const { user: dashboardUser } = useDashboardSession();

    useEffect(() => {
        const eventName = 'dashboard-booking-created';
        let active = true;

        const fetchNewBookingCount = async () => {
            if (!dashboardUser?.barbershopId) {
                setNewBookingCount(0);
                return;
            }

            try {
                const authToken = localStorage.getItem('dashboard_auth_token');
                const headers: Record<string, string> = {};
                if (authToken) {
                    headers.Authorization = `Bearer ${authToken}`;
                }

                const lastViewedTime = localStorage.getItem('lastViewedBookingsTime');
                const params = new URLSearchParams();
                if (lastViewedTime) {
                    params.append('lastViewed', lastViewedTime);
                }

                const response = await fetch(`/api/dashboard/new-bookings?${params}`, {
                    cache: 'no-store',
                    credentials: 'include',
                    headers,
                });

                if (!response.ok) {
                    setNewBookingCount(0);
                    return;
                }

                const data = await response.json();
                if (!active) return;
                setNewBookingCount(data.newBookingCount ?? 0);
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (error) {
                if (active) {
                    setNewBookingCount(0);
                }
            }
        };

        fetchNewBookingCount();
        const intervalId = window.setInterval(fetchNewBookingCount, 15000);
        const handleNewBooking = () => {
            fetchNewBookingCount();
        };

        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'lastBookingTime') {
                fetchNewBookingCount();
            }
        };

        window.addEventListener(eventName, handleNewBooking);
        window.addEventListener('storage', handleStorageChange);

        return () => {
            active = false;
            window.clearInterval(intervalId);
            window.removeEventListener(eventName, handleNewBooking);
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [dashboardUser?.barbershopId]);

    const loadRecentBookings = useCallback(async () => {
        if (!dashboardUser?.barbershopId) {
            setRecentBookings([]);
            return;
        }

        try {
            const authToken = localStorage.getItem('dashboard_auth_token');
            const headers: Record<string, string> = {};
            if (authToken) {
                headers.Authorization = `Bearer ${authToken}`;
            }

            const response = await fetch(`/api/dashboard/recent-bookings?limit=5`, {
                cache: 'no-store',
                credentials: 'include',
                headers,
            });

            if (response.ok) {
                const data = await response.json();
                setRecentBookings(data.bookings ?? []);

                // Mark as viewed when opening the dropdown
                if (typeof window !== 'undefined') {
                    localStorage.setItem('lastViewedBookingsTime', Date.now().toString());
                }
            }
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            setRecentBookings([]);
        }
    }, [dashboardUser?.barbershopId]);

    useEffect(() => {
        if (isNotificationsOpen) {
            loadRecentBookings();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isNotificationsOpen]);

    // When closing notifications, refresh the count after a short delay to show it zeroed
    useEffect(() => {
        if (!isNotificationsOpen) {
            // Refresh count immediately after closing to show the updated badge
            setTimeout(() => {
                const authToken = localStorage.getItem('dashboard_auth_token');
                const headers: Record<string, string> = {};
                if (authToken) {
                    headers.Authorization = `Bearer ${authToken}`;
                }

                const lastViewedTime = localStorage.getItem('lastViewedBookingsTime');
                const params = new URLSearchParams();
                if (lastViewedTime) {
                    params.append('lastViewed', lastViewedTime);
                }

                fetch(`/api/dashboard/new-bookings?${params}`, {
                    cache: 'no-store',
                    credentials: 'include',
                    headers,
                })
                    .then((res) => res.json())
                    .then((data) => {
                        setNewBookingCount(data.newBookingCount ?? 0);
                    })
                    .catch(() => {
                        setNewBookingCount(0);
                    });
            }, 100);
        }
    }, [isNotificationsOpen]);

    const handleNotificationsToggle = () => {
        const willOpen = !isNotificationsOpen;

        if (willOpen) {
            localStorage.setItem('lastViewedBookingsTime', Date.now().toString());
            setNewBookingCount(0);
        }

        setIsNotificationsOpen(willOpen);
    };

    useEffect(() => {
        if (!isNotificationsOpen) return;

        const handleClickOutside = (event: MouseEvent) => {
            if (!notificationsRef.current?.contains(event.target as Node)) {
                setIsNotificationsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isNotificationsOpen]);

    const handleLogout = async () => {
        document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
        localStorage.removeItem('token');
        localStorage.removeItem('barbershopId');
        clearDashboardSession();
        router.push('/dashboard-login');
    };

    const handleOpenSettings = () => {
        router.push('/barbershops/dashboard/settings');
        setIsOpen(false);
    };

    function getRole(role: string | undefined) {
        if (role === 'EMPLOYEE') return 'Funcionário';
        return 'Administrador';
    }

    const initials = userName
        ?.split(' ')
        .map((word) => word[0].toUpperCase())
        .join('')
        .slice(0, 2) || 'AD';

    return (
        <div className="bg-white border-b border-slate-200 shadow-sm">
            <div className="flex items-center justify-between h-16 px-6">
                {/* Left - Barbershop Name */}
                <div>
                    <h2 className="text-lg font-semibold text-slate-900">{barbershopName || 'Barbearia'}</h2>
                    <p className="text-xs text-slate-500">Painel de Controle</p>
                </div>

                {/* Right - User Menu */}
                <div className="flex items-center gap-3">
                    <div ref={notificationsRef} className="relative">
                        <button
                            onClick={handleNotificationsToggle}
                            title={newBookingCount > 0 ? `${newBookingCount} novo(s) agendamento(s)` : 'Agendamentos'}
                            className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                            <Bell className="w-5 h-5 text-slate-600" />
                            {newBookingCount > 0 && (
                                <span className="absolute -top-1 -right-1 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-semibold text-white">
                                    {newBookingCount > 9 ? '9+' : newBookingCount}
                                </span>
                            )}
                        </button>

                        {/* Notifications Dropdown */}
                        {isNotificationsOpen && (
                            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-slate-200 z-50">
                                <div className="p-4 border-b border-slate-200">
                                    <h3 className="font-semibold text-slate-900">Novos Agendamentos</h3>
                                    {newBookingCount > 0 && (
                                        <p className="text-xs text-slate-500 mt-1">{newBookingCount} novo(s)</p>
                                    )}
                                </div>

                                {recentBookings.length > 0 ? (
                                    <>
                                        <div className="max-h-72 overflow-y-auto">
                                            {recentBookings.map((booking) => (
                                                <div
                                                    key={booking.id}
                                                    className="px-4 py-3 border-b border-slate-100 hover:bg-slate-50 transition-colors last:border-b-0"
                                                >
                                                    <p className="text-sm font-medium text-slate-900">{booking.clientName}</p>
                                                    <p className="text-xs text-slate-600 mt-1">{booking.serviceName}</p>
                                                    <p className="text-xs text-slate-500 mt-1">{booking.date}</p>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="p-3 border-t border-slate-200 bg-slate-50">
                                            <button
                                                onClick={() => {
                                                    setIsNotificationsOpen(false);
                                                    router.push('/barbershops/dashboard/appointments');
                                                }}
                                                className="w-full text-center py-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                                            >
                                                Ver todos os agendamentos →
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="px-4 py-8 text-center">
                                        <p className="text-sm text-slate-500">Nenhum agendamento novo</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="relative">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-slate-600 flex items-center justify-center text-white font-semibold text-sm">
                                {initials}
                            </div>
                            <div className="hidden sm:block text-left">
                                <p className="text-sm font-medium text-slate-900">{userName || 'Usuário'}</p>
                                <p className="text-xs text-slate-500">{getRole(role) || 'Admin'}</p>
                            </div>
                        </button>

                        {/* Dropdown Menu */}
                        {isOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50">
                                <button
                                    onClick={handleOpenSettings}
                                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                                >
                                    <Settings className="w-4 h-4" />
                                    <span>Configurações</span>
                                </button>

                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span>Sair</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
