"use client";
import React, { ReactNode, useEffect } from "react";

import Header from "./header";
import { SidebarProvider } from "../ui/sidebar";
import { AppSidebar } from "../app-sidebar";
import { useDispatch } from "react-redux";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { saveUser } from "@/lib/redux/features/user/userSlice";

export default function Main({ children }: { children: ReactNode }) {
    const supabase = createClientComponentClient();
    const dispatch = useDispatch();
    const getUser = async () => {
        try {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            const obj = {
                id: user?.id,
                email: user?.email,
                created_at: user?.created_at,
                phone: user?.phone,
            };
            dispatch(saveUser(obj));
        } catch (error) {
            console.log("error", error);
        }
    };

    useEffect(() => {
        getUser();
    }, []);
    return (
        <SidebarProvider>
            <AppSidebar />
            <main className="w-full">
                <Header />
                {children}
            </main>
        </SidebarProvider>
    );
}
