"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/context/auth-context";

const nodeTypes = ["hypothesis", "decision", "experiment"];

export default function StrategyMapPage() {
  const { user } = useAuth();
  const [nodes, setNodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState(nodeTypes[0]);
  const [parentId, setParentId] = useState("");

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    supabase
      .from("strategy_map")
      .select("id, node_id, title, content, type, parent_id, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          setError(error.message);
          setLoading(false);
          return;
        }
        setNodes(data || []);
        setLoading(false);
      });
  }, [user]);

  const handleAdd = async () => {
    if (!user || !title) return;
    setSaving(true);
    setError(null);
    const { data, error } = await supabase.from("strategy_map").insert({
      user_id: user.id,
      title,
      content,
      type,
      parent_id: parentId || null,
    }).select();
    if (error) {
      setError(error.message);
      setSaving(false);
      return;
    }
    setNodes([...(data || []), ...nodes]);
    setTitle("");
    setContent("");
    setType(nodeTypes[0]);
    setParentId("");
    setSaving(false);
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Strategy Process Map</h1>
      <div className="mb-6 bg-white rounded-lg shadow p-4">
        <h2 className="font-semibold mb-2">Add Node</h2>
        <input
          className="border rounded px-2 py-1 mr-2 mb-2"
          placeholder="Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
        <input
          className="border rounded px-2 py-1 mr-2 mb-2"
          placeholder="Content"
          value={content}
          onChange={e => setContent(e.target.value)}
        />
        <select
          className="border rounded px-2 py-1 mr-2 mb-2"
          value={type}
          onChange={e => setType(e.target.value)}
        >
          {nodeTypes.map(nt => (
            <option key={nt} value={nt}>{nt}</option>
          ))}
        </select>
        <select
          className="border rounded px-2 py-1 mr-2 mb-2"
          value={parentId}
          onChange={e => setParentId(e.target.value)}
        >
          <option value="">No Parent</option>
          {nodes.map(n => (
            <option key={n.node_id} value={n.node_id}>{n.title}</option>
          ))}
        </select>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          onClick={handleAdd}
          disabled={saving}
        >
          {saving ? "Adding..." : "Add Node"}
        </button>
      </div>
      <div className="space-y-4">
        {nodes.map(node => (
          <div key={node.node_id} className="bg-white rounded-lg shadow p-4">
            <div className="font-semibold">{node.title} <span className="text-xs text-gray-400">({node.type})</span></div>
            <div className="text-gray-600 text-sm mb-1">{node.content}</div>
            {node.parent_id && (
              <div className="text-xs text-gray-400">Parent: {nodes.find(n => n.node_id === node.parent_id)?.title || node.parent_id}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 