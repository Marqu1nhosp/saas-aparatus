import { MenuIcon } from "lucide-react";
import Image from "next/image";

import { Button } from "./ui/button";

export default function Header() {
    return (
        <div className="flex items-center justify-between bg-background px-5 py-6">
            <Image src="/logo.svg" alt="Aparatus" width={91} height={24} />
            <Button variant={"outline"}>
                <MenuIcon />
            </Button>
        </div>
    );
}
