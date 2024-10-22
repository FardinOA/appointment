"use client";
import Main from "@/components/layout/main";
import { TooltipProvider } from "@/components/ui/tooltip";
import { store } from "@/lib/redux/store";
import { Provider } from "react-redux";
import { Toaster } from "sonner";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <Provider store={store}>
            <Toaster richColors={true} />
            <TooltipProvider>
                {" "}
                <Main>{children}</Main>
            </TooltipProvider>
        </Provider>
    );
}
