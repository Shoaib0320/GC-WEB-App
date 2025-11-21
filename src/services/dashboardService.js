/**
 * Client-side service to fetch dashboard stats
 */
export async function getDashboardStats() {
  try {
    const res = await fetch('/api/dashboard', { cache: 'no-store' });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to fetch dashboard stats');
    }
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to fetch dashboard stats');
    return json.data;
  } catch (error) {
    console.error('dashboardService.getDashboardStats error:', error);
    throw error;
  }
}

export default { getDashboardStats };
