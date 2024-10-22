import { Appointment } from "./appointment-management";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import StatusBadge from "./status-badge";
import { Calendar, Check, Clock, X } from "lucide-react";
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
    const formatTime = (time: string) => {
        const parsedTime = parse(time, "HH:mm:ss", new Date());
        return format(parsedTime, "h:mm a");
    };
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex justify-between items-center">
                    {appointment.title}
                    <StatusBadge status={appointment.status} />
                </CardTitle>
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
                {/* {appointment.audioMessage && (
                    <AudioMessagePlayer audioUrl={appointment.audioMessage} />
                )} */}
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
