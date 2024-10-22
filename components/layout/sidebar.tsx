"use client";

import {
    LayoutDashboard,
    Users,
    Calendar,
    ChevronRight,
    ChevronLeft,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

interface SidebarProps {
    isExpanded: boolean;
    setIsExpanded: (value: boolean) => void;
}
const Sidebar: React.FC<SidebarProps> = ({ isExpanded, setIsExpanded }) => {
    const toggleSidebar = () => {
        setIsExpanded(!isExpanded);
    };
    return (
        <aside
            className={`fixed inset-y-0 left-0 z-20 flex h-full flex-col border-r bg-background transition-all duration-300 ${
                isExpanded ? "w-64" : "w-16"
            }`}
        >
            <nav className="flex flex-col flex-1 p-2">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className={`rounded-lg ${
                                isExpanded ? "w-full justify-start px-2" : ""
                            }`}
                            aria-label="Dashboard"
                        >
                            <LayoutDashboard className="size-5" />
                            {isExpanded && (
                                <span className="ml-2">Dashboard</span>
                            )}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right" sideOffset={5}>
                        Dashboard
                    </TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className={`rounded-lg mt-2 ${
                                isExpanded ? "w-full justify-start px-2" : ""
                            }`}
                            aria-label="Users"
                        >
                            <Users className="size-5" />
                            {isExpanded && <span className="ml-2">Users</span>}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right" sideOffset={5}>
                        Users
                    </TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className={`rounded-lg mt-2 ${
                                isExpanded ? "w-full justify-start px-2" : ""
                            }`}
                            aria-label="Appointments"
                        >
                            <Calendar className="size-5" />
                            {isExpanded && (
                                <span className="ml-2">Appointments</span>
                            )}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right" sideOffset={5}>
                        Appointments
                    </TooltipContent>
                </Tooltip>
            </nav>
            <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className="self-end mb-4 mr-2"
                aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
            >
                {isExpanded ? (
                    <ChevronLeft className="size-5" />
                ) : (
                    <ChevronRight className="size-5" />
                )}
            </Button>
        </aside>
    );
};

export default Sidebar;
