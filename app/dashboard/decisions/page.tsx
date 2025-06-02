"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/context/auth-context";

export default function DecisionsPage() {
  const { user } = useAuth();
  const [decisions, setDecisions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [decision, setDecision] = useState("");
  const [assumptions, setAssumptions] = useState("");
  const [validation, setValidation] = useState("");
  const [outcome, setOutcome] = useState("");

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    supabase
      .from("decisions")
      .select("id, decision, assumptions, validation, outcome, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          setError(error.message);
          setLoading(false);
          return;
        }
        setDecisions(data || []);
        setLoading(false);
      });
  }, [user]);

  const handleAdd = async () => {
    if (!user || !decision) return;
    setSaving(true);
    setError(null);
    const { data, error } = await supabase.from("decisions").insert({
      user_id: user.id,
      decision,
      assumptions,
      validation,
      outcome,
    }).select();
    if (error) {
      setError(error.message);
      setSaving(false);
      return;
    }
    setDecisions([...(data || []), ...decisions]);
    setDecision("");
    setAssumptions("");
    setValidation("");
    setOutcome("");
    setSaving(false);
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Decision Journal</h1>
      <div className="mb-6 bg-white rounded-lg shadow p-4">
        <h2 className="font-semibold mb-2">Log a Decision</h2>
        <input
          className="border rounded px-2 py-1 mr-2 mb-2"
          placeholder="Decision"
          value={decision}
          onChange={e => setDecision(e.target.value)}
        />
        <input
          className="border rounded px-2 py-1 mr-2 mb-2"
          placeholder="Assumptions"
          value={assumptions}
          onChange={e => setAssumptions(e.target.value)}
        />
        <input
          className="border rounded px-2 py-1 mr-2 mb-2"
          placeholder="Validation"
          value={validation}
          onChange={e => setValidation(e.target.value)}
        />
        <input
          className="border rounded px-2 py-1 mr-2 mb-2"
          placeholder="Outcome"
          value={outcome}
          onChange={e => setOutcome(e.target.value)}
        />
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          onClick={handleAdd}
          disabled={saving}
        >
          {saving ? "Adding..." : "Add Decision"}
        </button>
      </div>
      <div className="space-y-4">
        {decisions.map(d => (
          <div key={d.id} className="bg-white rounded-lg shadow p-4">
            <div className="font-semibold">{d.decision}</div>
            <div className="text-gray-600 text-sm mb-1">Assumptions: {d.assumptions}</div>
            <div className="text-gray-600 text-sm mb-1">Validation: {d.validation}</div>
            <div className="text-gray-600 text-sm mb-1">Outcome: {d.outcome}</div>
            <div className="text-xs text-gray-400">Logged: {new Date(d.created_at).toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
} 