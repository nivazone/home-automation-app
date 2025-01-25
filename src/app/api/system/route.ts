import { NextResponse } from "next/server";
import { getSystemDetails } from "@/lib/system";

export async function GET() {
  try {
    const systemInfo = await getSystemDetails();
    return NextResponse.json(systemInfo);
  } catch (error) {
    console.error("Error fetching system details:", error);
    return NextResponse.json(
      { error: "Failed to fetch system details" },
      { status: 500 }
    );
  }
}
