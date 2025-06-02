"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/context/auth-context";

export default function ReviewLoopPage() {
  const { user } = useAuth();
  const [reflection, setReflection] = useState("");
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    supabase
      .from("review_loop")
      .select("id, reflection, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) setError(error.message);
        else setEntries(data || []);
        setLoading(false);
      });
  }, [user]);

  if (!user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reflection.trim()) return;
    setSaving(true);
    setError(null);
    const { error } = await supabase.from("review_loop").insert({
      user_id: user.id,
      reflection,
    });
    if (error) setError(error.message);
    else {
      setReflection("");
      // Refresh entries
      const { data } = await supabase
        .from("review_loop")
        .select("id, reflection, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setEntries(data || []);
    }
    setSaving(false);
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-4">Review Loop</h1>
      <form onSubmit={handleSubmit} className="mb-6">
        <textarea
          className="w-full border rounded p-2 mb-2"
          rows={3}
          placeholder="Write your reflection or feedback..."
          value={reflection}
          onChange={e => setReflection(e.target.value)}
          disabled={saving}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          disabled={saving || !reflection.trim()}
        >
          {saving ? "Saving..." : "Submit"}
        </button>
        {error && <div className="text-red-600 mt-2">{error}</div>}
      </form>
      <h2 className="text-lg font-semibold mb-2">Previous Entries</h2>
      {loading ? (
        <div>Loading...</div>
      ) : entries.length === 0 ? (
        <div className="text-gray-500">No entries yet.</div>
      ) : (
        <ul className="space-y-4">
          {entries.map(entry => (
            <li key={entry.id} className="border rounded p-3 bg-white">
              <div className="text-gray-800">{entry.reflection}</div>
              <div className="text-xs text-gray-400 mt-1">
                {new Date(entry.created_at).toLocaleString()}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
} 