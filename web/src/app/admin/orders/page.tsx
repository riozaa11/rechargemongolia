"use client";

import { useEffect, useState } from "react";

const API = "http://localhost:5050";
const STATUSES = ["PENDING","WAITING_PROOF","PAID","PROCESSING","DONE","REJECTED"] as const;

type Order = {
  id: string;
  game: string;
  product: string;
  player_identifier: string;
  amount_mnt: number;
  status: string;
  created_at: string;
};

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [err, setErr] = useState("");

  async function load() {
    setErr("");
    const token = localStorage.getItem("admin_token");
    if (!token) return (location.href = "/admin");

    const res = await fetch(API + "/api/admin/orders", {
      headers: { Authorization: "Bearer " + token },
    });

    const data = await res.json();
    if (!res.ok) {
      setErr(data?.error || "Failed to load orders");
      if (res.status === 401) location.href = "/admin";
      return;
    }
    setOrders(data.orders || []);
  }

  async function setStatus(id: string, status: string) {
    const token = localStorage.getItem("admin_token");
    if (!token) return;

    const res = await fetch(API + "/api/admin/orders/" + id + "/status", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({ status }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setErr(data?.error || "Status update failed");
      return;
    }
    load();
  }

  async function delOrder(id: string) {
    const token = localStorage.getItem("admin_token");
    if (!token) return;

    const res = await fetch(API + "/api/admin/orders/" + id, {
      method: "DELETE",
      headers: { Authorization: "Bearer " + token },
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setErr(data?.error || "Delete failed");
      return;
    }
    load();
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 3000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Orders</h2>
        <div className="flex gap-2">
          <button
            onClick={load}
            className="text-sm bg-white/10 hover:bg-white/15 border border-white/10 rounded-xl px-3 py-2"
          >
            Refresh
          </button>
          <button
            onClick={() => { localStorage.removeItem("admin_token"); location.href = "/admin"; }}
            className="text-sm bg-white/10 hover:bg-white/15 border border-white/10 rounded-xl px-3 py-2"
          >
            Logout
          </button>
        </div>
      </div>

      {err && (
        <div className="text-sm bg-red-500/10 border border-red-500/20 text-red-200 rounded-xl p-3">
          {err}
        </div>
      )}

      <div className="rounded-2xl overflow-hidden border border-white/10">
        <div className="grid grid-cols-12 gap-2 p-3 text-xs text-zinc-300 bg-white/5">
          <div className="col-span-3">Order ID</div>
          <div className="col-span-3">Player</div>
          <div className="col-span-2">Item</div>
          <div className="col-span-2">Amount</div>
          <div className="col-span-2">Actions</div>
        </div>

        {orders.length === 0 ? (
          <div className="p-6 text-sm text-zinc-400">Одоогоор захиалга алга.</div>
        ) : orders.map(o => (
          <div key={o.id} className="grid grid-cols-12 gap-2 p-3 border-t border-white/10 items-center">
            <div className="col-span-3">
              <div className="font-mono text-xs text-zinc-200">{o.id}</div>
              <div className="text-[11px] text-zinc-500">{o.game}</div>
            </div>
            <div className="col-span-3">
              <div className="text-sm font-semibold">{o.player_identifier}</div>
              <div className="text-[11px] text-zinc-500">{new Date(o.created_at).toLocaleString()}</div>
            </div>
            <div className="col-span-2 text-sm">{o.product}</div>
            <div className="col-span-2 text-sm">{o.amount_mnt.toLocaleString()}₮</div>
            <div className="col-span-2 flex items-center gap-2 justify-end">
              <select
                className="bg-zinc-900 border border-white/10 rounded-xl px-2 py-2 text-xs"
                value={o.status}
                onChange={(e) => setStatus(o.id, e.target.value)}
              >
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <button
                onClick={() => delOrder(o.id)}
                className="text-xs bg-red-500/10 hover:bg-red-500/15 border border-red-500/20 text-red-200 rounded-xl px-2 py-2"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="text-xs text-zinc-500">
        Auto refresh: 3 секунд тутам
      </div>
    </div>
  );
}
