import { httpClient } from "../../core/network/httpClient";

type ProfileStats = {
  transfers: number;
  contacts: number;
  miniApps: number;
  updatedAt: string;
};

type ProfileStatsResponse = {
  userId: string;
  stats: ProfileStats;
};

const PROFILE_API_BASE = "http://localhost:4000";

export async function fetchProfileStats(userId: string, miniApps: number): Promise<ProfileStats> {
  const response = await httpClient<ProfileStatsResponse>(
    `${PROFILE_API_BASE}/api/profile/${encodeURIComponent(userId)}/stats?miniApps=${miniApps}`,
    { method: "GET" },
  );

  return response.stats;
}

export async function saveProfileStats(
  userId: string,
  payload: Partial<Pick<ProfileStats, "transfers" | "contacts" | "miniApps">>,
): Promise<ProfileStats> {
  const response = await httpClient<ProfileStatsResponse>(
    `${PROFILE_API_BASE}/api/profile/${encodeURIComponent(userId)}/stats`,
    {
    method: "PUT",
      body: {
        ...payload,
      },
    },
  );

  return response.stats;
}
