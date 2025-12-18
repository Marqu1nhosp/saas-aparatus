"use client";

import {
    ChevronLeftIcon,
    ChevronRightIcon,
} from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";

interface CalendarProps {
    selected?: Date;
    onSelect?: (date: Date) => void;
    disabled?: (date: Date) => boolean;
}

export function Calendar({
    selected,
    onSelect,
    disabled,
}: CalendarProps) {
    const [currentMonth, setCurrentMonth] = React.useState(
        selected || new Date()
    );

    const getDaysInMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const handlePrevMonth = () => {
        setCurrentMonth(
            new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
        );
    };

    const handleNextMonth = () => {
        setCurrentMonth(
            new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
        );
    };

    const handleSelectDay = (day: number) => {
        const selectedDate = new Date(
            currentMonth.getFullYear(),
            currentMonth.getMonth(),
            day
        );

        if (!disabled?.(selectedDate)) {
            onSelect?.(selectedDate);
        }
    };

    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDayOfMonth = getFirstDayOfMonth(currentMonth);
    const monthName = currentMonth.toLocaleString("pt-BR", {
        month: "long",
        year: "numeric",
    });

    const days = [];
    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
        days.push(null);
    }
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        days.push(day);
    }

    const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

    return (
        <div className="w-full space-y-4">
            {/* Header with month navigation */}
            <div className="flex items-center justify-between">
                <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={handlePrevMonth}
                    aria-label="Mês anterior"
                >
                    <ChevronLeftIcon className="size-4" />
                </Button>
                <h2 className="text-sm font-semibold capitalize">{monthName}</h2>
                <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={handleNextMonth}
                    aria-label="Próximo mês"
                >
                    <ChevronRightIcon className="size-4" />
                </Button>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-1">
                {weekDays.map((day) => (
                    <div
                        key={day}
                        className="text-center text-xs font-semibold text-muted-foreground"
                    >
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-1">
                {days.map((day, index) => {
                    if (day === null) {
                        return (
                            <div key={`empty-${index}`} className="h-8 rounded-md" />
                        );
                    }

                    const date = new Date(
                        currentMonth.getFullYear(),
                        currentMonth.getMonth(),
                        day
                    );
                    const isSelected =
                        selected &&
                        selected.getDate() === day &&
                        selected.getMonth() === currentMonth.getMonth() &&
                        selected.getFullYear() === currentMonth.getFullYear();
                    const isDisabled = disabled?.(date);

                    return (
                        <Button
                            key={day}
                            variant={isSelected ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleSelectDay(day)}
                            disabled={isDisabled}
                            className="h-8 rounded-md text-xs"
                        >
                            {day}
                        </Button>
                    );
                })}
            </div>
        </div>
    );
}
