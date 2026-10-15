import { getLiveStatus } from "@/utils/liveStatus";
import LiveTrackStatusClient from "./LiveTrackStatusClient";

export default async function LiveTrackStatus() {
  let initialData = null;
  try {
    initialData = await getLiveStatus();
  } catch (error) {
    console.error("Failed to load initial live status:", error);
  }

  return <LiveTrackStatusClient initialData={initialData} />;
}
