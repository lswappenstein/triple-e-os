"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/context/auth-context";

const staticArchetypes = [
  {
    name: "Fixes That Fail",
    description: "A solution is applied to a problem, but it only alleviates symptoms and leads to worse problems later.",
  },
  {
    name: "Shifting the Burden",
    description: "Short-term solutions are used instead of fundamental ones, causing dependency and long-term issues.",
  },
  {
    name: "Limits to Growth",
    description: "Initial growth slows or stops as a limiting factor is encountered.",
  },
  {
    name: "Tragedy of the Commons",
    description: "Individuals use a shared resource for personal gain, depleting or spoiling it for the group.",
  },
  {
    name: "Success to the Successful",
    description: "Resources are given to the most successful, making it harder for others to catch up.",
  },
  {
    name: "Escalation",
    description: "Parties compete by continually increasing their efforts, leading to a lose-lose situation.",
  },
  {
    name: "Accidental Adversaries",
    description: "Parties that should cooperate end up undermining each other due to miscommunication or misaligned incentives.",
  },
  {
    name: "Drifting Goals",
    description: "Goals are gradually lowered in response to failure, leading to mediocrity.",
  },
];

export default function SystemArchetypesPage() {
  const { user } = useAuth();
  const [archetypes, setArchetypes] = useState(staticArchetypes);
  const [selected, setSelected] = useState<boolean[]>(Array(staticArchetypes.length).fill(false));
  const [intensity, setIntensity] = useState<number[]>(Array(staticArchetypes.length).fill(0));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch user's archetypes from Supabase
  useEffect(() => {
    if (!user) return;
    setLoading(true);
    supabase
      .from("arquetipos")
      .select("name, description, selected, intensity")
      .eq("user_id", user.id)
      .then(({ data, error }) => {
        if (error) {
          setError(error.message);
          setLoading(false);
          return;
        }
        if (data && data.length > 0) {
          // Map DB data to UI state
          setArchetypes(data.map((a: any) => ({ name: a.name, description: a.description })));
          setSelected(data.map((a: any) => !!a.selected));
          setIntensity(data.map((a: any) => a.intensity || 0));
        } else {
          // No data, use static
          setArchetypes(staticArchetypes);
          setSelected(Array(staticArchetypes.length).fill(false));
          setIntensity(Array(staticArchetypes.length).fill(0));
        }
        setLoading(false);
      });
  }, [user]);

  // Save to Supabase
  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setError(null);
    // Upsert each archetype for the user
    for (let i = 0; i < archetypes.length; i++) {
      const { name, description } = archetypes[i];
      const sel = selected[i];
      const inten = intensity[i];
      const { error } = await supabase.from("arquetipos").upsert({
        user_id: user.id,
        name,
        description,
        selected: sel,
        intensity: inten,
      }, { onConflict: "user_id,name" });
      if (error) {
        setError(error.message);
        setSaving(false);
        return;
      }
    }
    setSaving(false);
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">System Archetypes Map</h1>
      <div className="space-y-6">
        {archetypes.map((archetype, idx) => (
          <div key={archetype.name} className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-center mb-2">
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selected[idx]}
                    onChange={() => {
                      const newSelected = [...selected];
                      newSelected[idx] = !newSelected[idx];
                      setSelected(newSelected);
                    }}
                  />
                  <span className="text-lg font-semibold">{archetype.name}</span>
                </label>
                <p className="text-gray-600 text-sm">{archetype.description}</p>
              </div>
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    className={`w-8 h-8 rounded-full border text-sm font-bold focus:outline-none ${
                      intensity[idx] === num ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-700"
                    }`}
                    onClick={() => {
                      const newIntensity = [...intensity];
                      newIntensity[idx] = num;
                      setIntensity(newIntensity);
                    }}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      <button
        className="mt-6 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        onClick={handleSave}
        disabled={saving}
      >
        {saving ? "Saving..." : "Save"}
      </button>
    </div>
  );
} 