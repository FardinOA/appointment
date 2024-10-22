"use client";

import { useState, useEffect, useCallback } from "react";
import { Calendar1Icon, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import debounce from "lodash/debounce";
import { CreateAppointment } from "../appointment/create-appointment";

export interface User {
    id: string;
    name: string;
    email: string;
}

function LoadingSkeleton() {
    return (
        <div className="space-y-4">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>
                            <Skeleton className="h-6 w-[100px]" />
                        </TableHead>
                        <TableHead>
                            <Skeleton className="h-6 w-[150px]" />
                        </TableHead>
                        <TableHead>
                            <Skeleton className="h-6 w-[100px]" />
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {[...Array(5)].map((_, index) => (
                        <TableRow key={index}>
                            <TableCell>
                                <Skeleton className="h-6 w-[150px]" />
                            </TableCell>
                            <TableCell>
                                <Skeleton className="h-6 w-[200px]" />
                            </TableCell>
                            <TableCell>
                                <Skeleton className="h-8 w-[120px]" />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const supabase = createClientComponentClient();

    const fetchUsers = useCallback(
        async (query: string = "") => {
            setLoading(true);
            try {
                const {
                    data: { user },
                } = await supabase.auth.getUser();
                const { data, error } = await supabase
                    .from("users")
                    .select("*")
                    .or(`name.ilike.%${query}%,email.ilike.%${query}%`)
                    .neq("id", user?.id);

                if (error) throw error;
                setUsers(data || []);
            } catch (error) {
                console.error("Error fetching users:", error);
            } finally {
                setLoading(false);
            }
        },
        [supabase]
    );

    const debouncedSearch = useCallback(
        debounce((query: string) => fetchUsers(query), 300),
        [fetchUsers]
    );

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    useEffect(() => {
        debouncedSearch(searchQuery);
    }, [searchQuery, debouncedSearch]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    return (
        <div className="container mx-auto py-10">
            <h1 className="text-2xl font-bold mb-5">Users</h1>
            <div className="mb-6">
                <div className="flex w-full max-w-sm items-center space-x-2">
                    <Input
                        type="search"
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                    />
                    <Button
                        type="button"
                        onClick={() => fetchUsers(searchQuery)}
                    >
                        <Search className="h-4 w-4 mr-2" />
                        Search
                    </Button>
                </div>
            </div>
            {loading ? (
                <LoadingSkeleton />
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell>{user.name}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>
                                    <CreateAppointment
                                        userId={user?.id}
                                        userName={user?.name}
                                        triggerButton={
                                            <Button size="icon">
                                                <Calendar1Icon className="h-4 w-4  " />
                                            </Button>
                                        }
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </div>
    );
}
