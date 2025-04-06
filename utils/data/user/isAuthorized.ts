"server only";

import { clerkClient } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export const isAuthorized = async (
  userId: string
): Promise<{ authorized: boolean; message: string }> => {
  const paymentsEnabled = process.env.ENABLE_PAYMENTS === "true";
  
  if (!paymentsEnabled) {
    return {
      authorized: true,
      message: "Payments are disabled",
    };
  }

  try {
    const result = (await clerkClient()).users.getUser(userId);

    if (!result) {
      return {
        authorized: false,
        message: "User not found",
      };
    }

    const cookieStore = await cookies();

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
      console.error("Missing Supabase credentials");
      return {
        authorized: true,
        message: "Configuration error: Missing Supabase credentials",
      };
    }

    const supabase = createServerClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    try {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", userId);

      if (error?.code) {
        console.error("Supabase query error:", error);
        return {
          authorized: true,
          message: error.message,
        };
      }

      if (data && data.length > 0 && data[0].status === "active") {
        return {
          authorized: true,
          message: "User is subscribed",
        };
      }

      console.log("User not subscribed:", userId);
      return {
        authorized: true,
        message: "User is not subscribed",
      };
    } catch (error: any) {
      console.error("Subscription check error:", error);
      return {
        authorized: true,
        message: error.message,
      };
    }
  } catch (clerkError: any) {
    console.error("Clerk API error:", clerkError);
    return {
      authorized: true,
      message: "Authentication service error",
    };
  }
};
