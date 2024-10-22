"use client";

import { useState, useEffect, useCallback } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/redux/store";
import _ from "lodash";
import { toast } from "sonner";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Search, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AppointmentList from "./appointment-list";
import LoadingSkeleton from "./loading-skeleton";
import { CreateAppointment } from "./create-appointment";

export type Appointment = {
    id: string;
    title: string;
    date: string;
    time: string;
    status: "pending" | "accept" | "decline" | "cancel";
    audio_message?: string;
    isUpcoming: boolean;
    user_ids: string[];
    created_by: string;
};

const ITEMS_PER_PAGE: number = Number(process.env.ITEMS_PER_PAGE || 9);

export default function AppointmentManagement() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState("upcoming");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [statusFilter, setStatusFilter] = useState<string | undefined>();
    const [initialLoad, setInitialLoad] = useState(true);
    const { user } = useSelector((state: RootState) => state.user);
    const supabase = createClientComponentClient();

    const fetchAppointments = useCallback(async () => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE - 1;

        let query = supabase
            .from("appointment")
            .select("*", { count: "exact" })
            .contains("user_ids", [user?.id]);

        if (searchTerm) {
            query = query.or(
                `title.ilike.%${searchTerm}%,date.ilike.%${searchTerm}%,time.ilike.%${searchTerm}%`
            );
        }

        if (statusFilter) {
            query = query.eq("status", statusFilter);
        }

        const { data, error, count } = await query
            .order("date", { ascending: true })
            .order("time", { ascending: true })
            .range(startIndex, endIndex);

        if (error) {
            toast.error("Error fetching appointments");
        } else {
            setAppointments(data || []);
            setTotalCount(count || 0);
        }
        setInitialLoad(false);
    }, [currentPage, supabase, user?.id, searchTerm, statusFilter]);

    useEffect(() => {
        // Set up the real-time subscription
        const subscription = supabase
            .channel("schema-db-changes")
            .on(
                "postgres_changes",
                { event: "INSERT", schema: "public", table: "appointment" },
                () => {
                    fetchAppointments();
                }
            )
            .subscribe();

        // Cleanup subscription on component unmount
        return () => {
            supabase.removeChannel(subscription);
        };
    }, []);

    useEffect(() => {
        fetchAppointments();
    }, [fetchAppointments]);

    const handleAppointmentAction = async (
        id: string,
        action: "accept" | "decline" | "cancel"
    ) => {
        const { error } = await supabase
            .from("appointment")
            .update({ status: action })
            .eq("id", id);
        if (error) toast.error(`Error ${action}ing appointment`);
        else {
            toast.success(`Appointment ${action}ed successfully`);
            fetchAppointments();
        }
    };

    const debouncedSearch = useCallback(
        _.debounce((term: string) => {
            setSearchTerm(term);
            setCurrentPage(1);
        }, 300),
        []
    );

    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
    const filterAppointments = (
        appointments: Appointment[],
        isUpcoming: boolean
    ) => {
        const now = new Date();

        return appointments.filter((appointment: Appointment) => {
            const appointmentDateTime = new Date(
                `${appointment.date}T${appointment.time}`
            );

            // Filter upcoming appointments if isUpcoming is true
            if (isUpcoming) {
                return appointmentDateTime > now;
            }

            // Filter past appointments if isUpcoming is false
            return appointmentDateTime <= now;
        });
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Appointment Management</h1>
            <div className="flex flex-col md:flex-row md:justify-between gap-4 mb-4 w-full   ">
                <div className="w-full lg:w-[80%] flex flex-col md:flex-row gap-4 ">
                    <div className="mb-4 relative w-full">
                        <Input
                            type="text"
                            placeholder="Search appointments..."
                            onChange={(e) => debouncedSearch(e.target.value)}
                            className="w-full pl-10"
                        />
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400  " />
                    </div>
                    <Select
                        value={statusFilter || "all"}
                        onValueChange={(value) => {
                            setStatusFilter(
                                value === "all" ? undefined : value
                            );
                            setCurrentPage(1);
                        }}
                    >
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={"all"}>All statuses</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="accept">Accepted</SelectItem>
                            <SelectItem value="decline">Declined</SelectItem>
                            <SelectItem value="cancel">Cancelled</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <CreateAppointment
                    triggerButton={
                        <Button>
                            <Plus className="size-4" /> Create
                        </Button>
                    }
                />
            </div>
            <Tabs
                value={activeTab}
                onValueChange={(value) => {
                    setActiveTab(value);
                    setCurrentPage(1);
                }}
            >
                <TabsList className="mb-4">
                    <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                    <TabsTrigger value="past">Past</TabsTrigger>
                </TabsList>

                <TabsContent value="upcoming">
                    {initialLoad ? (
                        <LoadingSkeleton />
                    ) : (
                        <AppointmentList
                            userId={user?.id}
                            isUpcoming={true}
                            appointments={filterAppointments(
                                appointments,
                                true
                            )}
                            onAction={handleAppointmentAction}
                        />
                    )}
                </TabsContent>
                <TabsContent value="past">
                    {initialLoad ? (
                        <LoadingSkeleton />
                    ) : (
                        <AppointmentList
                            userId={user?.id}
                            appointments={filterAppointments(
                                appointments,
                                false
                            )}
                            onAction={handleAppointmentAction}
                        />
                    )}
                </TabsContent>
            </Tabs>
            {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2 mt-4">
                    <Button
                        onClick={() =>
                            setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                        disabled={currentPage === 1 || initialLoad}
                        size="sm"
                        variant="outline"
                    >
                        <ChevronLeft size={16} />
                    </Button>
                    <span className="text-sm">
                        Page {currentPage} of {totalPages}
                    </span>
                    <Button
                        onClick={() =>
                            setCurrentPage((prev) =>
                                Math.min(prev + 1, totalPages)
                            )
                        }
                        disabled={currentPage === totalPages || initialLoad}
                        size="sm"
                        variant="outline"
                    >
                        <ChevronRight size={16} />
                    </Button>
                </div>
            )}
        </div>
    );
}
