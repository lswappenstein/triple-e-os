"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/context/auth-context";

const statusOptions = ["To Do", "In Progress", "Done"];

export default function QuickWinsPage() {
  const { user } = useAuth();
  const [quickWins, setQuickWins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newTask, setNewTask] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newExample, setNewExample] = useState("");

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    supabase
      .from("quick_wins")
      .select("id, task, description, example, status")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          setError(error.message);
          setLoading(false);
          return;
        }
        setQuickWins(data || []);
        setLoading(false);
      });
  }, [user]);

  const handleAdd = async () => {
    if (!user || !newTask) return;
    setSaving(true);
    setError(null);
    const { data, error } = await supabase.from("quick_wins").insert({
      user_id: user.id,
      task: newTask,
      description: newDescription,
      example: newExample,
      status: "To Do",
    }).select();
    if (error) {
      setError(error.message);
      setSaving(false);
      return;
    }
    setQuickWins([...(data || []), ...quickWins]);
    setNewTask("");
    setNewDescription("");
    setNewExample("");
    setSaving(false);
  };

  const handleStatusChange = async (id: number, status: string) => {
    setSaving(true);
    setError(null);
    const { error } = await supabase.from("quick_wins").update({ status }).eq("id", id);
    if (error) {
      setError(error.message);
      setSaving(false);
      return;
    }
    setQuickWins(quickWins.map(qw => qw.id === id ? { ...qw, status } : qw));
    setSaving(false);
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Quick Wins Engine</h1>
      <div className="mb-6 bg-white rounded-lg shadow p-4">
        <h2 className="font-semibold mb-2">Add Quick Win</h2>
        <input
          className="border rounded px-2 py-1 mr-2 mb-2"
          placeholder="Task"
          value={newTask}
          onChange={e => setNewTask(e.target.value)}
        />
        <input
          className="border rounded px-2 py-1 mr-2 mb-2"
          placeholder="Description"
          value={newDescription}
          onChange={e => setNewDescription(e.target.value)}
        />
        <input
          className="border rounded px-2 py-1 mr-2 mb-2"
          placeholder="Example"
          value={newExample}
          onChange={e => setNewExample(e.target.value)}
        />
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          onClick={handleAdd}
          disabled={saving}
        >
          {saving ? "Adding..." : "Add"}
        </button>
      </div>
      <div className="space-y-4">
        {quickWins.map(qw => (
          <div key={qw.id} className="bg-white rounded-lg shadow p-4 flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <div className="font-semibold">{qw.task}</div>
              <div className="text-gray-600 text-sm">{qw.description}</div>
              <div className="text-gray-400 text-xs italic">{qw.example}</div>
            </div>
            <div className="mt-2 md:mt-0 flex items-center space-x-2">
              {statusOptions.map(status => (
                <button
                  key={status}
                  className={`px-3 py-1 rounded-full border text-xs font-bold focus:outline-none ${qw.status === status ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-700"}`}
                  onClick={() => handleStatusChange(qw.id, status)}
                  disabled={saving}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 