import { useState, useRef, useEffect } from "react";
import { Appointment } from "./appointment-management";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import StatusBadge from "./status-badge";
import { Calendar, Check, Clock, X, Play, Pause, VolumeX } from "lucide-react";
import { Button } from "../ui/button";
import { format, parse } from "date-fns";

export default function AppointmentCard({
    appointment,
    onAction,
    isUpcoming,
    userId,
}: {
    appointment: Appointment;
    onAction: (id: string, action: "accept" | "decline" | "cancel") => void;
    isUpcoming?: boolean;
    userId?: string;
}) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const formatTime = (time: string) => {
        const parsedTime = parse(time, "HH:mm:ss", new Date());
        return format(parsedTime, "h:mm a");
    };

    useEffect(() => {
        if (appointment.audio_message) {
            const audio = new Audio(appointment.audio_message);
            audioRef.current = audio;

            audio.addEventListener("canplaythrough", () => setIsLoading(false));
            audio.addEventListener("error", (e) => {
                console.error("Audio error code:", audio.error?.code);
                console.error("Audio error:", e);
                setError("Failed to load audio");
                setIsLoading(false);
            });

            return () => {
                audio.pause();
                audio.src = "";
            };
        }
    }, [appointment.audio_message]);

    const toggleAudio = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                setIsLoading(true);
                audioRef.current.play().catch((error) => {
                    console.error("Playback failed:", error);
                    setError("Playback failed. Please try again.");
                    setIsLoading(false);
                });
            }
            setIsPlaying(!isPlaying);
        }
    };

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.onended = () => setIsPlaying(false);
        }
    }, []);

    return (
        <Card>
            <CardHeader className="flex flex-row items-center gap-3 lg:gap-4 justify-between">
                <CardTitle className="w-full flex justify-between items-center gap-2 md:gap-4 ">
                    {appointment.title}
                </CardTitle>
                <StatusBadge status={appointment.status} />
            </CardHeader>

            <CardContent>
                <div className="flex items-center mb-2">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>
                        {format(new Date(appointment.date), "MMMM d, yyyy")}
                    </span>
                </div>
                <div className="flex items-center mb-2">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>{formatTime(appointment.time)}</span>
                </div>
                {appointment.audio_message && (
                    <div className="mt-2">
                        <Button
                            onClick={toggleAudio}
                            variant="outline"
                            size="sm"
                            className="w-full"
                            disabled={isLoading || !!error}
                        >
                            {isLoading ? (
                                "Loading..."
                            ) : error ? (
                                <>
                                    <VolumeX className="h-4 w-4 mr-2" />
                                    Error
                                </>
                            ) : isPlaying ? (
                                <>
                                    <Pause className="h-4 w-4 mr-2" />
                                    Pause Audio
                                </>
                            ) : (
                                <>
                                    <Play className="h-4 w-4 mr-2" />
                                    Play Audio
                                </>
                            )}
                        </Button>
                        {error && (
                            <p className="text-red-500 text-sm mt-1">{error}</p>
                        )}
                    </div>
                )}
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
                {appointment?.created_by === userId ? (
                    <>
                        {appointment.status !== "cancel" && isUpcoming && (
                            <Button
                                onClick={() =>
                                    onAction(appointment.id, "cancel")
                                }
                                variant="destructive"
                                size="sm"
                            >
                                Cancel
                            </Button>
                        )}
                    </>
                ) : (
                    <>
                        {appointment.status === "pending" && isUpcoming && (
                            <>
                                <Button
                                    onClick={() =>
                                        onAction(appointment.id, "accept")
                                    }
                                    variant="outline"
                                    size="sm"
                                >
                                    <Check className="h-4 w-4 mr-2" /> Accept
                                </Button>
                                <Button
                                    onClick={() =>
                                        onAction(appointment.id, "decline")
                                    }
                                    variant="outline"
                                    size="sm"
                                >
                                    <X className="h-4 w-4 mr-2" /> Decline
                                </Button>
                            </>
                        )}
                    </>
                )}
            </CardFooter>
        </Card>
    );
}
