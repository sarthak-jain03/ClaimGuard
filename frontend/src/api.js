const rawBaseUrl = (
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_BACKEND_URL ||
  "http://localhost:8000/api"
).trim().replace(/\/+$/, "");

const API_BASE_URL = rawBaseUrl.endsWith("/api") ? rawBaseUrl : `${rawBaseUrl}/api`;

export async function fetchApi(endpoint, options = {}) {
  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail || `API error ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.warn(`Backend API unreachable at ${endpoint}:`, error.message);
    throw error;
  }
}

export const api = {
  async getStatus() {
    return fetchApi("/status");
  },

  async getDashboardStats() {
    return fetchApi("/dashboard/stats");
  },

  async getClaims(status = "all", search = "") {
    const params = new URLSearchParams();
    if (status && status !== "all") params.append("status", status);
    if (search) params.append("search", search);
    const qs = params.toString() ? `?${params.toString()}` : "";
    return fetchApi(`/claims${qs}`);
  },

  async getClaim(id) {
    return fetchApi(`/claims/${id}`);
  },

  async submitClaim(claimData) {
    return fetchApi("/claims", {
      method: "POST",
      body: JSON.stringify(claimData),
    });
  },

  async rerunAiAnalysis(claimId) {
    return fetchApi(`/claims/${claimId}/analyze`, {
      method: "POST",
    });
  },




  async executeReviewAction(claimId, { action, reviewer, note, overrideCategory }) {
    return fetchApi(`/claims/${claimId}/action`, {
      method: "POST",
      body: JSON.stringify({ action, reviewer, note, overrideCategory }),
    });
  },

  async getAuditLogs() {
    return fetchApi("/audit-logs");
  },

  async clearAllData() {
    return fetchApi("/claims", {
      method: "DELETE",
    });
  },

  async bulkImportData(data) {
    return fetchApi("/claims/bulk", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};
