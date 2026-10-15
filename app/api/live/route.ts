import { getLiveStatus } from "@/utils/liveStatus";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const data = await getLiveStatus();
    return Response.json(data);
  } catch (error: any) {
    return Response.json(
      { error: error?.message || "Failed to fetch live F1 status" },
      { status: 500 }
    );
  }
}
