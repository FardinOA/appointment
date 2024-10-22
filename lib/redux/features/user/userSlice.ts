import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

interface User {
    id: string | undefined;
    email: string | undefined;
    created_at: string | undefined;
    phone: string | undefined;
}

export interface userState {
    user: User | null;
}

const initialState: userState = {
    user: null,
};

export const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        saveUser: (state, action: PayloadAction<User>) => {
            state.user = action.payload;
        },
    },
});

export const { saveUser } = userSlice.actions;

export default userSlice.reducer;
