import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { Calendar1Icon, Calendar as CalendarIcon } from "lucide-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/redux/store";

const formSchema = z.object({
    title: z.string().min(2, {
        message: "Title must be at least 2 characters.",
    }),
    description: z.string().min(10).optional().or(z.literal("")),
    date: z.date({
        required_error: "A date is required.",
    }),
    time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
        message: "Please enter a valid time in HH:MM format.",
    }),
});

interface CreateAppointmentProps {
    userId: string;
    userName: string;
}

export function CreateAppointment({
    userId,
    userName,
}: CreateAppointmentProps) {
    const [open, setOpen] = useState(false);
    const supabase = createClientComponentClient();
    const { user } = useSelector((state: RootState) => state.user);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            description: "",
            time: "",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            const { data, error } = await supabase
                .from("appointment")
                .insert([
                    {
                        title: values.title,
                        description: values.description,
                        date: values.date.toISOString().split("T")[0],
                        time: values.time,
                        user_ids: [userId, user?.id],
                        created_by: user?.id,
                    },
                ])
                .select();

            if (error) {
                console.log(error);
                toast.error(
                    "Failed to schedule appointment. Please try again."
                );
                return;
            }

            toast.success("Appointment scheduled successfully!");
            setOpen(false);
            form.reset();
        } catch (error) {
            console.error("Error scheduling appointment:", error);
            toast.error("Failed to schedule appointment. Please try again.");
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="icon">
                    <Calendar1Icon className="h-4 w-4  " />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] overflow-auto ">
                <DialogHeader>
                    <DialogTitle>
                        Schedule Appointment with {userName}
                    </DialogTitle>
                    <DialogDescription>
                        Fill in the details for your appointment. Click save
                        when you&apos;re done.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-8"
                    >
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Title</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Appointment title"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Enter a title for your appointment.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Describe the purpose of the appointment"
                                            className="resize-none"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Provide details about the appointment.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="date"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Date</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant={"outline"}
                                                    className={` pl-3 text-left font-normal w-full ${
                                                        !field.value &&
                                                        "text-muted-foreground"
                                                    }`}
                                                >
                                                    {field.value ? (
                                                        format(
                                                            field.value,
                                                            "PPP"
                                                        )
                                                    ) : (
                                                        <span>Pick a date</span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent
                                            className="w-auto p-0"
                                            align="start"
                                        >
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                disabled={(date) =>
                                                    date <
                                                    new Date(
                                                        new Date().setDate(
                                                            new Date().getDate() -
                                                                1
                                                        )
                                                    )
                                                }
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormDescription>
                                        Select the date for your appointment.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="time"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Time</FormLabel>
                                    <FormControl>
                                        <Input type="time" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        Choose a time for your appointment.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="submit">Schedule Appointment</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
