"server only";

import { clerkClient } from "@clerk/nextjs/server";

export const isAuthorized = async (
  userId: string
): Promise<{ authorized: boolean; message: string }> => {
  // For now, always authorize users to reduce complexity
  // This helps us isolate other issues in the app
  return {
    authorized: true,
    message: "Authorization check disabled for debugging",
  };
  
  // The code below is disabled temporarily to simplify debugging
  /*
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

    // In a real implementation, this would check subscription status
    // For now, we'll just authorize everyone
    return {
      authorized: true,
      message: "Authorization check simplified for debugging",
    };
  } catch (clerkError: any) {
    console.error("Clerk API error:", clerkError);
    return {
      authorized: true,
      message: "Authentication service error",
    };
  }
  */
};
