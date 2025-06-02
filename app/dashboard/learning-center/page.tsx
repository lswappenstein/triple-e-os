"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/context/auth-context";

export default function LearningCenterPage() {
  const { user } = useAuth();
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");

  // Assume admin if user.email ends with '@triplee.com' (customize as needed)
  const isAdmin = user && user.email && user.email.endsWith("@triplee.com");

  useEffect(() => {
    setLoading(true);
    supabase
      .from("learning_resources")
      .select("id, title, description, link, created_at")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) setError(error.message);
        else setResources(data || []);
        setLoading(false);
      });
  }, []);

  if (!user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !link.trim()) return;
    setSaving(true);
    setError(null);
    const { error } = await supabase.from("learning_resources").insert({
      user_id: user.id,
      title,
      description,
      link,
    });
    if (error) setError(error.message);
    else {
      setTitle("");
      setDescription("");
      setLink("");
      // Refresh resources
      const { data } = await supabase
        .from("learning_resources")
        .select("id, title, description, link, created_at")
        .order("created_at", { ascending: false });
      setResources(data || []);
    }
    setSaving(false);
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-4">Learning Center (Academia Triple E)</h1>
      {isAdmin && (
        <form onSubmit={handleSubmit} className="mb-6">
          <input
            className="w-full border rounded p-2 mb-2"
            placeholder="Title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            disabled={saving}
          />
          <textarea
            className="w-full border rounded p-2 mb-2"
            rows={2}
            placeholder="Description (optional)"
            value={description}
            onChange={e => setDescription(e.target.value)}
            disabled={saving}
          />
          <input
            className="w-full border rounded p-2 mb-2"
            placeholder="Link (URL)"
            value={link}
            onChange={e => setLink(e.target.value)}
            disabled={saving}
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
            disabled={saving || !title.trim() || !link.trim()}
          >
            {saving ? "Saving..." : "Add Resource"}
          </button>
          {error && <div className="text-red-600 mt-2">{error}</div>}
        </form>
      )}
      <h2 className="text-lg font-semibold mb-2">Resources</h2>
      {loading ? (
        <div>Loading...</div>
      ) : resources.length === 0 ? (
        <div className="text-gray-500">No resources yet.</div>
      ) : (
        <ul className="space-y-4">
          {resources.map(resource => (
            <li key={resource.id} className="border rounded p-3 bg-white">
              <a href={resource.link} target="_blank" rel="noopener noreferrer" className="text-blue-700 font-semibold hover:underline">
                {resource.title}
              </a>
              {resource.description && <div className="text-gray-700 mt-1">{resource.description}</div>}
              <div className="text-xs text-gray-400 mt-1">
                {new Date(resource.created_at).toLocaleString()}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
} 