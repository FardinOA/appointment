import { Loader } from "lucide-react";
import React from "react";

const LoadingOverlay = ({ isLoading }: { isLoading: boolean }) => {
    if (!isLoading) return null;
    return (
        <div className="absolute z-10 inset-0 flex items-center justify-center bg-white/50 backdrop-blur-md">
            <Loader className="animate-spin text-primary " />
        </div>
    );
};

export default LoadingOverlay;
