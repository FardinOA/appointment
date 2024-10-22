import AppointmentCard from "./appointment-card";
import { Appointment } from "./appointment-management";

export default function AppointmentList({
    appointments,
    onAction,
    isUpcoming,
    userId,
}: {
    appointments: Appointment[];
    onAction: (id: string, action: "accept" | "decline" | "cancel") => void;
    isUpcoming?: boolean;
    userId?: string;
}) {
    return (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {appointments.map((appointment) => (
                <AppointmentCard
                    userId={userId}
                    isUpcoming={isUpcoming}
                    key={appointment.id}
                    appointment={appointment}
                    onAction={onAction}
                />
            ))}
        </div>
    );
}
