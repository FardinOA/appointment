import React from "react";
import { SidebarTrigger } from "../ui/sidebar";
import { ToggleTheme } from "./toggle-theme";

const Header = () => {
    return (
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6   ">
            <SidebarTrigger />{" "}
            <div className="flex items-center justify-between w-full">
                <h1 className="text-xl font-semibold">Dashboard</h1>

                <div>
                    <ToggleTheme />
                </div>
            </div>
        </header>
    );
};

export default Header;
