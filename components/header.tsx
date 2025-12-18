"use client";

import Image from "next/image";

import { MenuSheet } from "./menu-sheet";

export default function Header() {
    return (
        <div className="flex items-center justify-between bg-background px-5 py-6">
            <Image src="/logo.svg" alt="Aparatus" width={91} height={24} />
            <MenuSheet />
        </div>
    );
}
