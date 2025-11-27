import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";

export default function AdminAIAnalytics() {
  const { data: metrics } = useQuery({
    queryKey: ['/api/ai/metrics'],
    queryFn: async () => apiClient.get<Record<string, number>>('/ai/metrics'),
    refetchInterval: 5000,
  });
  const entries = metrics ? Object.entries(metrics) : [];
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="font-serif text-2xl mb-6">AI Assistant Analytics</h1>
      {entries.length === 0 ? (
        <p className="text-sm text-muted-foreground">No events yet</p>
      ) : (
        <div className="space-y-2">
          {entries.map(([k, v]) => (
            <div key={k} className="flex justify-between border rounded p-3">
              <span className="text-sm">{k}</span>
              <span className="text-sm font-medium">{v}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

