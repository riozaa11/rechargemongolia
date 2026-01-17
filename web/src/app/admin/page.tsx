"use client";

import { useState } from "react";

const API = "http://localhost:5050";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  async function login() {
    setErr("");
    const res = await fetch(API + "/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok) return setErr(data?.error || "Login failed");
    localStorage.setItem("admin_token", data.token);
    location.href = "/admin/orders";
  }

  return (
    <div className="max-w-md bg-white/5 border border-white/10 rounded-2xl p-6">
      <h2 className="text-lg font-semibold mb-4">Admin Login</h2>

      {err && (
        <div className="mb-3 text-sm bg-red-500/10 border border-red-500/20 text-red-200 rounded-xl p-3">
          {err}
        </div>
      )}

      <label className="text-xs text-zinc-400">Username</label>
      <input
        className="w-full mb-3 mt-1 p-2 rounded bg-zinc-900 border border-white/10"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <label className="text-xs text-zinc-400">Password</label>
      <input
        type="password"
        className="w-full mb-4 mt-1 p-2 rounded bg-zinc-900 border border-white/10"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        onClick={login}
        className="w-full bg-white text-black rounded p-2 font-semibold"
      >
        Login
      </button>

      
    </div>
  );
}
