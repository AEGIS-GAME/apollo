import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";

export const Route = createFileRoute("/")({
  component: App,
});

async function uploadFile(formData: FormData) {
  const res = await fetch("http://localhost:8080/api/upload", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) throw new Error("Upload failed");
  return res.json();
}

function App() {
  const [worldFile, setWorldFile] = useState<File | null>(null);
  const [agentFile, setAgentFile] = useState<File | null>(null);

  const mutation = useMutation({
    mutationFn: (formData: FormData) => uploadFile(formData),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!worldFile && !agentFile) return;

    const formData = new FormData();
    if (worldFile) formData.append("world", worldFile);
    if (agentFile) formData.append("agent", agentFile);

    mutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center">
          Upload World & Agent
        </h1>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block mb-1 font-medium">World file</label>
            <input
              type="file"
              accept=".world"
              onChange={(e) => setWorldFile(e.target.files?.[0] || null)}
              className="w-full border border-gray-300 rounded px-2 py-1"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Agent file</label>
            <input
              type="file"
              accept=".py"
              onChange={(e) => setAgentFile(e.target.files?.[0] || null)}
              className="w-full border border-gray-300 rounded px-2 py-1"
            />
          </div>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full bg-blue-600 text-white font-semibold py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {mutation.isPending ? "Uploading..." : "Upload"}
          </button>
        </form>

        {mutation.isPending && (
          <p className="mt-4 text-gray-700 text-center">Uploading...</p>
        )}
        {mutation.isError && (
          <p className="mt-4 text-red-600 text-center">
            Upload failed: {(mutation.error as Error).message}
          </p>
        )}
        {mutation.isSuccess && (
          <p className="mt-4 text-green-600 text-center">Upload successful!</p>
        )}
      </div>
    </div>
  );
}
