import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const pincode = request.nextUrl.searchParams.get("code");

  if (!pincode || !/^\d{6}$/.test(pincode)) {
    return NextResponse.json(
      { success: false, error: "Invalid PIN code" },
      { status: 400 },
    );
  }

  try {
    const res = await fetch(
      `https://api.postalpincode.in/pincode/${pincode}`,
      { next: { revalidate: 86400 } }, // Cache for 24 hours
    );
    const data = await res.json();

    if (data?.[0]?.Status === "Success" && data[0].PostOffice?.length > 0) {
      const postOffices = data[0].PostOffice;
      const state = postOffices[0].State;
      const district = postOffices[0].District;
      const cities: string[] = Array.from(
        new Set(postOffices.map((po: any) => po.Name as string)),
      );

      return NextResponse.json({
        success: true,
        state,
        district,
        cities,
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid PIN code" },
      { status: 404 },
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to fetch pincode data" },
      { status: 500 },
    );
  }
}
