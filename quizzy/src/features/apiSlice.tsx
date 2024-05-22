import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
// import { logout } from "../redux/authSlice";
import store from "../redux/store";

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.REACT_APP_BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    headers.set("Content-Type", "application/json");
    const token = getState()?.auth?.token;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
  let result: any = await baseQuery(args, api, extraOptions);

  if (result.error?.status === 401) {
    const errorMsg = [
      "invalid signature",
      "invalid token",
      "jwt malformed",
      "jwt expired",
    ];
    if (errorMsg.includes(result.error?.data?.msg)) {
      store.dispatch(logout());
    }
  }

  return result;
};

export const apiSlice = createApi({
  reducerPath: "apiSlice",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Post"],
  endpoints: (builder) => ({
    signUp: builder.mutation({
      query: (formData) => ({
        url: "auth/sign-up",
        method: "POST",
        body: formData,
      }),
    }),
    signIn: builder.mutation({
      query: ({ email, password }) => ({
        url: "auth/login",
        method: "POST",
        body: {
          email,
          password,
        },
      }),
    }),
    getAppointment: builder.query({
      query: () => ({
        url: "appointment",
      }),
    }),
  }),
});

export const { useSignUpMutation, useSignInMutation, useGetAppointmentQuery } =
  apiSlice;
