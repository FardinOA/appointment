import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import {
    Calendar as CalendarIcon,
    Mic,
    StopCircle,
    Play,
    Pause,
} from "lucide-react";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/redux/store";
import { User } from "../user";
import { ScrollArea } from "@/components/ui/scroll-area";

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
    userId: z.string(),
    audioMessage: z.string().optional(),
});

interface CreateAppointmentProps {
    userId?: string;
    userName?: string;
    triggerButton: React.ReactNode;
}

export function CreateAppointment({
    userId,
    userName,
    triggerButton,
}: CreateAppointmentProps) {
    const [open, setOpen] = useState(false);
    const [users, setUsers] = useState<User[]>([]);
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const supabase = createClientComponentClient();
    const { user } = useSelector((state: RootState) => state.user);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            description: "",
            time: "",
            audioMessage: "",
        },
    });

    const fetchUsers = async () => {
        try {
            const { data, error } = await supabase
                .from("users")
                .select("*")
                .neq("id", user?.id);

            if (error) throw error;
            setUsers(data || []);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    useEffect(() => {
        if (user?.id) fetchUsers();
    }, [user?.id]);

    useEffect(() => {
        if (userId) {
            form.setValue("userId", userId);
        }
    }, [userId, form]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
            });
            mediaRecorderRef.current = new MediaRecorder(stream);
            mediaRecorderRef.current.start();
            setIsRecording(true);

            const audioChunks: BlobPart[] = [];
            mediaRecorderRef.current.addEventListener(
                "dataavailable",
                (event) => {
                    audioChunks.push(event.data);
                }
            );

            mediaRecorderRef.current.addEventListener("stop", () => {
                const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
                setAudioBlob(audioBlob);
                setIsRecording(false);
            });
        } catch (error) {
            console.error("Error starting recording:", error);
            toast.error(
                "Failed to start recording. Please check your microphone permissions."
            );
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const playAudio = () => {
        if (audioBlob && audioRef.current) {
            audioRef.current.src = URL.createObjectURL(audioBlob);
            audioRef.current.play();
            setIsPlaying(true);
        }
    };

    const pauseAudio = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            setIsPlaying(false);
        }
    };

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            let audioUrl = "";
            if (audioBlob) {
                const { data, error } = await supabase.storage
                    .from("audio_message")
                    .upload(`${user?.id}-${Date.now()}.mp3`, audioBlob);

                if (error) throw error;
                audioUrl = supabase.storage
                    .from("audio_message")
                    .getPublicUrl(data.path).data.publicUrl;
            }

            const { error } = await supabase
                .from("appointment")
                .insert([
                    {
                        title: values.title,
                        description: values.description,
                        date: format(values.date, "yyyy-MM-dd"),
                        time: values.time,
                        user_ids: [userId ?? values?.userId, user?.id],
                        created_by: user?.id,
                        audio_message: audioUrl,
                    },
                ])
                .select();

            if (error) {
                toast.error(
                    "Failed to schedule appointment. Please try again."
                );
                return;
            }

            toast.success("Appointment scheduled successfully!");
            setOpen(false);
            form.reset();
            setAudioBlob(null);
        } catch (error) {
            console.error("Error scheduling appointment:", error);
            toast.error("Failed to schedule appointment. Please try again.");
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{triggerButton}</DialogTrigger>
            <DialogContent className=" w-full sm:max-w-[425px] lg:mx-w-[550px] max-h-[90vh] flex flex-col  ">
                <ScrollArea className="flex-grow space-y-4 overflow-y-auto scrollbar-hide ">
                    <DialogHeader>
                        <DialogTitle>
                            Schedule Appointment{" "}
                            {userName && `With ${userName}`}
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
                            {!userId && (
                                <FormField
                                    control={form.control}
                                    name="userId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Select User</FormLabel>
                                            <FormControl>
                                                <Select
                                                    onValueChange={
                                                        field.onChange
                                                    }
                                                    defaultValue={field.value}
                                                >
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Select User" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {users?.map((user) => (
                                                            <SelectItem
                                                                key={user?.id}
                                                                value={user?.id}
                                                            >
                                                                {user?.name ??
                                                                    user?.email}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </FormControl>
                                            <FormDescription>
                                                Select user to schedule
                                                appointment.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}
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
                                            Provide details about the
                                            appointment.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 items-center">
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
                                                            className={`pl-3 text-left font-normal w-full ${
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
                                                                <span>
                                                                    Pick a date
                                                                </span>
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
                                                        onSelect={
                                                            field.onChange
                                                        }
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
                                                Select the date for your
                                                appointment.
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
                                                Choose a time for your
                                                appointment.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <FormField
                                control={form.control}
                                name="audioMessage"
                                render={({}) => (
                                    <FormItem>
                                        <FormLabel>
                                            Audio Message (Optional)
                                        </FormLabel>
                                        <FormControl>
                                            <div className="flex items-center space-x-2">
                                                {!isRecording && !audioBlob && (
                                                    <Button
                                                        type="button"
                                                        onClick={startRecording}
                                                        className="w-full"
                                                    >
                                                        <Mic className="w-4 h-4 mr-2" />
                                                        Start Recording
                                                    </Button>
                                                )}
                                                {isRecording && (
                                                    <Button
                                                        type="button"
                                                        onClick={stopRecording}
                                                        variant="destructive"
                                                        className="w-full"
                                                    >
                                                        <StopCircle className="w-4 h-4 mr-2" />
                                                        Stop Recording
                                                    </Button>
                                                )}
                                                {audioBlob && !isPlaying && (
                                                    <Button
                                                        type="button"
                                                        onClick={playAudio}
                                                        className="w-full"
                                                    >
                                                        <Play className="w-4 h-4 mr-2" />
                                                        Play
                                                    </Button>
                                                )}
                                                {audioBlob && isPlaying && (
                                                    <Button
                                                        type="button"
                                                        onClick={pauseAudio}
                                                        className="w-full"
                                                    >
                                                        <Pause className="w-4 h-4 mr-2" />
                                                        Pause
                                                    </Button>
                                                )}
                                            </div>
                                        </FormControl>
                                        <FormDescription>
                                            Record an optional audio message for
                                            the appointment.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </form>
                    </Form>
                </ScrollArea>
                <DialogFooter className="mt-4">
                    <Button onClick={form.handleSubmit(onSubmit)}>
                        Schedule Appointment
                    </Button>
                </DialogFooter>
            </DialogContent>
            <audio ref={audioRef} />
        </Dialog>
    );
}
