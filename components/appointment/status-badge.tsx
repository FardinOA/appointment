import { Badge } from "@/components/ui/badge";
import { Appointment } from "./appointment-management";
import { cn } from "@/lib/utils";
export default function StatusBadge({
    status,
}: {
    status: Appointment["status"];
}) {
    const statusColors = {
        pending: "text-yellow-100 bg-yellow-800",
        accept: "text-green-100 bg-green-800",
        decline: "bg-red-100 text-red-800",
        cancel: "text-red-100 bg-red-800",
    };

    return (
        <Badge className={cn("capitalize", statusColors[status])}>
            {/* {status.charAt(0).toUpperCase() + status.slice(1)} */}
            {status}
        </Badge>
    );
}
