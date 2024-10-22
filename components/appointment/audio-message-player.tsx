import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Button } from "../ui/button";
import { Mic } from "lucide-react";
export default function AudioMessagePlayer({ audioUrl }: { audioUrl: string }) {
    const [isPlaying, setIsPlaying] = useState(false);

    const togglePlay = () => {
        setIsPlaying(!isPlaying);
        // TODO: Implement actual audio playback logic
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <Mic className="h-4 w-4 mr-2" /> Play Audio Message
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Audio Message</DialogTitle>
                    <DialogDescription>
                        Listen to the audio message left by the scheduler.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex justify-center items-center p-4">
                    <Button onClick={togglePlay}>
                        {isPlaying ? "Pause" : "Play"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
