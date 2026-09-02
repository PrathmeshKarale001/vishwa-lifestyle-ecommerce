import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "./supabase";
import { isAdmin } from "./admin";

/**
 * Authenticate API request - returns user or null
 */
export async function authenticateRequest(request: NextRequest): Promise<{
  user: any;
  error?: NextResponse;
} | null> {
  const authHeader = request.headers.get("authorization");

  // Try to get token from Authorization header or cookie
  let token: string | null = null;

  if (authHeader?.startsWith("Bearer ")) {
    token = authHeader.substring(7);
  } else {
    // Try to get from cookie (Supabase stores it)
    const cookieHeader = request.headers.get("cookie");
    if (cookieHeader) {
      const cookies = Object.fromEntries(
        cookieHeader.split("; ").map((c) => c.split("=")),
      );
      token = cookies["sb-access-token"] || null;
    }
  }

  if (!token) {
    return {
      user: null,
      error: NextResponse.json(
        { error: "Unauthorized - No authentication token" },
        { status: 401 },
      ),
    };
  }

  // Verify token with Supabase
  const serverClient = createServerClient();
  if (!serverClient) {
    return {
      user: null,
      error: NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 },
      ),
    };
  }

  try {
    const {
      data: { user },
      error,
    } = await serverClient.auth.getUser(token);

    if (error || !user) {
      return {
        user: null,
        error: NextResponse.json(
          { error: "Unauthorized - Invalid token" },
          { status: 401 },
        ),
      };
    }

    return { user };
  } catch (error) {
    console.error("Auth error:", error);
    return {
      user: null,
      error: NextResponse.json(
        { error: "Authentication failed" },
        { status: 401 },
      ),
    };
  }
}

/**
 * Require authentication for API route
 */
export async function requireAuth(request: NextRequest) {
  const authResult = await authenticateRequest(request);

  if (!authResult || !authResult.user) {
    return (
      authResult?.error ||
      NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    );
  }

  return authResult.user;
}

/**
 * Require admin access for API route
 */
export async function requireAdmin(request: NextRequest) {
  const user = await requireAuth(request);

  if (user instanceof NextResponse) {
    return user; // Error response
  }

  // Check admin status
  const serverClient = createServerClient();
  if (!serverClient) {
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 },
    );
  }

  try {
    // Check admin_users table
    const { data: adminUser } = await serverClient
      .from("admin_users")
      .select("is_active, role")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .single();

    if (adminUser) {
      return { user, adminUser };
    }

    // Fallback to email check
    // Server-only: prefer ADMIN_EMAILS. NEXT_PUBLIC_ADMIN_EMAILS is a legacy
    // fallback and must not be relied on (it ships to the browser bundle).
    const adminEmails = (
      process.env.ADMIN_EMAILS ||
      process.env.NEXT_PUBLIC_ADMIN_EMAILS ||
      ""
    )
      .split(",")
      .map((e) => e.trim())
      .filter(Boolean);
    if (adminEmails.length > 0 && adminEmails.includes(user.email || "")) {
      return { user, adminUser: { role: "admin" as const } };
    }

    return NextResponse.json(
      { error: "Forbidden - Admin access required" },
      { status: 403 },
    );
  } catch (error) {
    console.error("Admin check error:", error);
    return NextResponse.json(
      { error: "Authorization failed" },
      { status: 500 },
    );
  }
}

/**
 * Check if user owns a resource
 */
export async function requireResourceOwnership(
  request: NextRequest,
  resourceType: "order" | "address",
  resourceId: string,
) {
  const user = await requireAuth(request);

  if (user instanceof NextResponse) {
    return user; // Error response
  }

  const serverClient = createServerClient();
  if (!serverClient) {
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 },
    );
  }

  try {
    if (resourceType === "order") {
      const { data: order } = await serverClient
        .from("orders")
        .select("user_id")
        .eq("id", resourceId)
        .single();

      if (!order) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }

      // Allow if user owns the order OR if user is admin
      if (order.user_id === user.id) {
        return { user, resource: order };
      }

      // Check if admin
      const adminResult = await requireAdmin(request);
      if (adminResult instanceof NextResponse) {
        return NextResponse.json(
          { error: "Unauthorized - You can only access your own orders" },
          { status: 403 },
        );
      }

      return { user, resource: order };
    }

    if (resourceType === "address") {
      const { data: address } = await serverClient
        .from("addresses")
        .select("user_id")
        .eq("id", resourceId)
        .single();

      if (!address) {
        return NextResponse.json(
          { error: "Address not found" },
          { status: 404 },
        );
      }

      if (address.user_id !== user.id) {
        return NextResponse.json(
          { error: "Unauthorized - You can only access your own addresses" },
          { status: 403 },
        );
      }

      return { user, resource: address };
    }
  } catch (error) {
    console.error("Resource ownership check error:", error);
    return NextResponse.json(
      { error: "Authorization failed" },
      { status: 500 },
    );
  }
}
