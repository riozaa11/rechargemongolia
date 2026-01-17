"use client";

import { Coming_Soon } from "next/font/google";
import { useEffect, useMemo, useRef, useState } from "react";

type Product = { game: string; sku: string; name: string; price: number };

const API = "http://localhost:5050"; // ✅ API яг энд байна

const PRODUCTS: Product[] = [
  { game: "PUBG Mobile", sku: "UC-60", name: "60 UC", price: 4200 },
  { game: "PUBG Mobile", sku: "UC-180", name: "180 UC", price: 12400 },
  { game: "PUBG Mobile", sku: "UC-325", name: "325 UC", price: 17000},
  { game: "PUBG Mobile", sku: "660", name: "660 UC", price: 33000 },
  { game: "PUBG Mobile", sku: "UC-1800", name: "1800 UC", price: 81000 },
  { game: "PUBG Mobile", sku: "UC-3850", name: "3850UC", price: 161000 },
  { game: "PUBG Mobile", sku: "UC-8100", name: "8100UC", price: 313000 },

 { game: "Roblox", sku: "RBX-PREMIUM", name: "450 Robux", price: 20500 },
  { game: "Roblox", sku: "RBX-PREMIUM", name: "1000 Robux", price: 37000 },
  { game: "Roblox", sku: "RBX-80", name: "80 Robux", price: 4000 },
  { game: "Roblox", sku: "RBX-160", name: "160 Robux", price: 8000 },
  { game: "Roblox", sku: "RBX-240", name: "240 Robux", price: 11500 },
  { game: "Roblox", sku: "RBX-320", name: "320 Robux", price: 14000 },
  { game: "Roblox", sku: "RBX-480", name: "480 Robux", price: 17000 },
  { game: "Roblox", sku: "RBX-500", name: "500 Robux", price: 17500 },
  { game: "Roblox", sku: "RBX-800", name: "800 Robux", price: 31500 },
  { game: "Roblox", sku: "RBX-1000", name: "1000 Robux", price: 35000 },
  { game: "Roblox", sku: "RBX-1500", name: "1500 Robux", price: 56200 },
  { game: "Roblox", sku: "RBX-2000", name: "2000 Robux", price: 73000 },
  { game: "Roblox", sku: "RBX-2500", name: "2500 Robux", price: 93000 },




  
  { game: "Mobile Legends", sku: "ML-257", name: "257 Diamonds", price: 14000 },
];

const PAYMENT_INFO = {
  qpay: {
    title: "QPay төлбөр",
    qrImageUrl:
      "https://image2url.com/r2/default/images/1768407754554-267dd986-df67-4017-9fa2-afdbadbcfd3c.png",
  },
  bank: {
    title: "Банк шилжүүлэг",
    text: "Төрийн банк 106701881125\nНэр: Тэнгис \nГүйлгээний утга: Тоглоом + ID",
  },
} as const;

function fmt(n: number) {
  return new Intl.NumberFormat("mn-MN").format(n);
}

function statusLabel(s: string) {
  const map: Record<string, string> = {
    PENDING: "Хүлээгдэж байна",
    WAITING_PROOF: "Баримт хүлээн авсан",
    PAID: "Төлөгдсөн",
    PROCESSING: "Цэнэглэж байна",
    DONE: "Цэнэглэлт амжилттай манайхаар үйчлүүлсэнд баярлалаа",
    REJECTED: "Татгалзсан",
    CANCELLED: "Цуцалсан",
  };
  return map[s] ?? s ?? "—";
}

export default function HomePage() {
  const games = useMemo(() => Array.from(new Set(PRODUCTS.map((p) => p.game))).sort(), []);
  const [catalogGame, setCatalogGame] = useState(games[0] ?? "PUBG Mobile");
  const [game, setGame] = useState(games[0] ?? "PUBG Mobile");

  const packs = useMemo(
    () => PRODUCTS.filter((p) => p.game === game).sort((a, b) => a.price - b.price),
    [game]
  );

  const [packSku, setPackSku] = useState(packs[0]?.sku ?? "");
  useEffect(() => {
    setPackSku(packs[0]?.sku ?? "");
  }, [game]);

  const selectedPack = useMemo(
    () => packs.find((p) => p.sku === packSku) ?? packs[0],
    [packs, packSku]
  );

  const [accountId, setAccountId] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [payment, setPayment] = useState<"qpay" | "bank">("qpay");
  const [note, setNote] = useState("");

  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<any>(null);
  function showToast(msg: string) {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3800);
  }

  const [trackId, setTrackId] = useState("");
  const [trackStatus, setTrackStatus] = useState("—");
  const pollTimer = useRef<any>(null);

  // ✅ ЭНД Л ГОЛ FIX: /api биш API(5050) руу явуулна
  async function refreshStatus(id: string) {
    const r = await fetch(`${API}/api/orders/${encodeURIComponent(id)}`, { method: "GET" });
    const data = await r.json();
    if (!r.ok) throw new Error(data?.error || "Захиалга олдсонгүй");
    setTrackStatus(statusLabel(data.status));
  }

  function startAutoRefresh(id: string) {
    if (pollTimer.current) clearInterval(pollTimer.current);
    pollTimer.current = setInterval(() => {
      refreshStatus(id).catch(() => {});
    }, 4000);
  }

  useEffect(() => {
    return () => {
      if (pollTimer.current) clearInterval(pollTimer.current);
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  useMemo(
    () => PRODUCTS.filter((p) => p.game === catalogGame).sort((a, b) => a.price - b.price),
    [catalogGame]
  );

  // ✅ ЭНД Л ГОЛ FIX: payload + URL-г API-д тааруулна
  async function submitOrder(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedPack) return showToast("❗ Багц сонгоно уу.");
    if (!accountId.trim() || !phone.trim()) return showToast("❗ ID/утсаа бүрэн бөглөнө үү.");

    const payload = {
      game: game,
      product: `${selectedPack.name} (${selectedPack.sku})`,
      player_identifier: accountId.trim(),
      amount_mnt: selectedPack.price,
      contact: `${phone.trim()}${email.trim() ? `, ${email.trim()}` : ""}`,
      note: `Payment=${payment}${note.trim() ? ` | ${note.trim()}` : ""}`,
    };

    try {
      const r = await fetch(`${API}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data?.error || "Алдаа гарлаа");

      const id = data.id || data.orderId; // API чинь ихэвчлэн id буцаадаг
      showToast(`✅ Захиалга амжилттай. Дугаар: ${id}`);
      setTrackId(id);
      await refreshStatus(id);
      startAutoRefresh(id);
      setNote("");
    } catch (err: any) {
      showToast("❗ " + (err?.message || "Алдаа гарлаа"));
    }
  }

  return (
    <>
      <style jsx global>{`
        :root{
          --bg:#0b1020;
          --card:rgba(18,26,51,.72);
          --card2:rgba(15,23,48,.55);
          --text:#e8ecff;
          --muted:#a8b0d9;
          --border:rgba(255,255,255,.12);
          --brand:#7c5cff;
          --ok:#22c55e;
          --shadow:0 14px 40px rgba(0,0,0,.40);
          --r:18px;
        }
        html{ color-scheme: dark; }
        *{box-sizing:border-box}
        body{
          margin:0;
          font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
          background:
            radial-gradient(1200px 600px at 20% 0%, rgba(124,92,255,.22), transparent 60%),
            radial-gradient(900px 500px at 90% 20%, rgba(34,197,94,.16), transparent 55%),
            var(--bg);
          color:var(--text);
        }
        a{color:inherit}
        .wrap{max-width:1100px;margin:0 auto;padding:24px}
        header{
          position: static;
          top:auto;
          z-index:1;
          border:1px solid var(--border);
          border-radius:var(--r);
          background:rgba(18,26,51,.75);
          backdrop-filter: blur(10px);
          box-shadow:var(--shadow);
        }
        .topbar{
          display:flex;
          gap:12px;
          align-items:center;
          justify-content:space-between;
          padding:14px 16px;
          flex-wrap:wrap;
        }
        .brand{display:flex;gap:10px;align-items:center}
        .logo{
          width:40px;height:40px;border-radius:14px;
          background: conic-gradient(from 220deg, var(--brand), var(--ok), #38bdf8, var(--brand));
          box-shadow: 0 10px 30px rgba(124,92,255,.22);
          flex:0 0 auto;
        }
        .brand h1{margin:0;font-size:15px;letter-spacing:.2px}
        .brand p{margin:2px 0 0;color:var(--muted);font-size:12px}
        nav{display:flex;gap:10px;flex-wrap:wrap;justify-content:flex-end}
        .btn.primary{ margin-right: 10px; }
        .btn{
          border:1px solid var(--border);
          background:linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.02));
          color:var(--text);padding:10px 12px;border-radius:14px;
          cursor:pointer;display:inline-flex;gap:8px;align-items:center;font-weight:650;
          transition:.15s transform,.15s border-color;
          user-select:none;text-decoration:none;
        }
        .btn:hover{transform:translateY(-1px);border-color:rgba(255,255,255,.20)}
        .btn.primary{
          background:linear-gradient(180deg, rgba(124,92,255,.9), rgba(124,92,255,.65));
          border-color:rgba(124,92,255,.55);
        }
        .btn.ok{
          background:linear-gradient(180deg, rgba(34,197,94,.95), rgba(34,197,94,.65));
          border-color:rgba(34,197,94,.55);
          color:#06210f;
        }
        main{margin-top:18px}
        .grid{display:grid;grid-template-columns: 1.2fr .8fr;gap:16px}
        @media (max-width: 980px){ .grid{grid-template-columns:1fr} }
        .card{
          border:1px solid var(--border);
          background:var(--card);
          border-radius:var(--r);
          box-shadow:var(--shadow);
          overflow:hidden;
        }
        .hd{padding:16px 16px 10px;border-bottom:1px solid var(--border);background:var(--card2)}
        .hd h2{margin:0;font-size:18px;font-weight:850}
        .hd p{margin:8px 0 0;color:var(--muted);font-size:13px}
        .bd{padding:16px}
        .pill{
          font-size:12px;color:var(--muted);
          border:1px solid var(--border);border-radius:999px;padding:6px 10px;
          background:rgba(255,255,255,.04);
          display:inline-flex;gap:6px;align-items:center;white-space:nowrap;
        }
        .notice{
          padding:12px 12px;border-radius:16px;border:1px solid rgba(255,255,255,.14);
          background:rgba(255,255,255,.03);
          color:var(--muted);font-size:13px;
        }
        .notice b{color:var(--text)}
        .divider{height:1px;background:var(--border);margin:14px 0}
        .list{display:grid;grid-template-columns:repeat(2, 1fr);gap:12px;margin-top:12px}
        @media (max-width: 560px){.list{grid-template-columns:1fr}}
        .item{
          padding:14px;border:1px solid var(--border);border-radius:16px;background:rgba(255,255,255,.03);
          display:flex;flex-direction:column;gap:10px;
        }
        .item .row{display:flex;align-items:center;justify-content:space-between;gap:12px}
        .item h3{margin:0;font-size:15px}
        .price{font-weight:900}
        .muted{color:var(--muted)}
        .small{font-size:12px;color:var(--muted)}
        .two{display:grid;grid-template-columns:1fr 1fr;gap:12px}
        @media (max-width: 560px){.two{grid-template-columns:1fr}}
        label{
          font-size:12px;
          font-weight:750;
          color: rgba(232,236,255,.86);
          letter-spacing:.2px;
          display:block;
          margin-bottom:8px;
        }
        input, select, textarea{
          width:100%;
          padding:11px 12px;border-radius:14px;
          border:1px solid var(--border);
          background:rgba(255,255,255,.03);
          color:rgba(232,236,255,.96);
          outline:none;
          font-size:14px;
          font-weight:600;
        }
        input:focus, select:focus, textarea:focus{
          border-color:rgba(124,92,255,.55);
          box-shadow: 0 0 0 3px rgba(124,92,255,.14);
        }
        select{
          -webkit-appearance: none;
          appearance:none;
          background-image:
            linear-gradient(45deg, transparent 50%, rgba(232,236,255,.6) 50%),
            linear-gradient(135deg, rgba(232,236,255,.6) 50%, transparent 50%);
          background-position:
            calc(100% - 18px) calc(1em + 2px),
            calc(100% - 13px) calc(1em + 2px);
          background-size:5px 5px, 5px 5px;
          background-repeat:no-repeat;
          padding-right: 36px;
        }
        .summary{
          display:grid;gap:8px;
          padding:12px;border-radius:16px;border:1px solid rgba(255,255,255,.14);
          background:rgba(255,255,255,.03);
        }
        .summary .line{display:flex;justify-content:space-between;gap:10px}
        .summary .line b{font-weight:850}
        .toast{
          margin-top:10px;padding:10px 12px;border:1px solid var(--border);
          border-radius:14px;color:var(--muted);background:rgba(255,255,255,.04)
        }
        footer{margin:18px 0 6px;color:var(--muted);text-align:center;font-size:12px}
        .qr{
          width:100%;
          max-width:260px;
          aspect-ratio: 1/1;
          border-radius:16px;
          border:1px solid rgba(255,255,255,.14);
          background:rgba(255,255,255,.03);
          display:grid;place-items:center;
          overflow:hidden;
        }
        .qr img{width:100%;height:100%;object-fit:cover}
      `}</style>

      <div className="wrap">
        <header>
          <div className="topbar">
            <div className="brand">
              <div className="logo" aria-hidden="true"></div>
              <div>
                <h1>Kimura recharge</h1>
                <p>PUBG UC • Roblox Robux • бусад тоглоом</p>
              </div>
            </div>

            
          </div>
        </header>

        <main className="grid">
          {/* LEFT */}
          <section className="card" aria-labelledby="hero">
            <div className="hd">
              <h2 id="hero">Recharge — хурдан, найдвартай</h2>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
                <span className="pill">⏱️ Дундаж хугацаа: 5–30 минут</span>
                <span className="pill">🕘 Ажлын цаг: 10:00–00:00</span>
              </div>
            </div>

            <div className="bd">
              <div className="notice">
                <b>Анхааруулга:</b> ID/Username-ээ зөв оруулна уу. Буруу мэдээллээс үүдсэн асуудалд
                хариуцлага хүлээх боломжгүй.
              </div>

              <div className="divider" />

              <div className="two">
                <div>
                  <label>Тоглоом сонгох (үнэ харах)</label>
                  <select value={catalogGame} onChange={(e) => setCatalogGame(e.target.value)}>
                    {games.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="notice" style={{ margin: 0 }}>
                  <b>Зөвхөн сонгосон тоглоомын</b> багцууд доор харагдана.
                </div>
              </div>

              <div className="divider" />

              <div className="list">
                {PRODUCTS.filter((p) => p.game === catalogGame)
                  .sort((a, b) => a.price - b.price)
                  .map((p, i) => (
  <div className="item" key={`${p.sku}-${i}`}>

                      <div className="row">
                        <h3>{p.game}</h3>
                        <span className="pill">{p.sku}</span>
                      </div>
                      <div className="row">
                        <div>
                          <div style={{ fontWeight: 800 }}>{p.name}</div>
                          <div className="small muted">Сонгох дарвал захиалгын хэсэг автоматаар бөглөнө</div>
                        </div>
                        <div className="price">{fmt(p.price)}₮</div>
                      </div>
                      <button
                        className="btn primary"
                        type="button"
                        onClick={() => {
                          setGame(p.game);
                          setPackSku(p.sku);
                          document.getElementById("order")?.scrollIntoView({ behavior: "smooth", block: "start" });
                        }}
                      >
                        Сонгох
                      </button>
                    </div>
                  ))}
              </div>

              <div className="divider" />

              <div className="notice" id="contact">
                <b>Холбоо барих:</b><br />
                Facebook: @recharge mongolia
              </div>
            </div>
          </section>

          {/* RIGHT */}
          <section className="card" id="order" aria-labelledby="orderTitle">
            <div className="hd">
              <h2 id="orderTitle">Захиалга өгөх</h2>
              <p>Мэдээллээ бөглөөд төлбөрийн аргаа сонгоно уу.</p>
            </div>

            <div className="bd">
              <form onSubmit={submitOrder}>
                <div className="two">
                  <div>
                    <label>Тоглоом</label>
                    <select
                      value={game}
                      onChange={(e) => {
                        const g = e.target.value;
                        setGame(g);
                        setCatalogGame(g);
                      }}
                      required
                    >
                      {games.map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label>Багц</label>
                    <select value={packSku} onChange={(e) => setPackSku(e.target.value)} required>
                      {packs.map((p, i) => (
  <option key={`${p.sku}-${i}`} value={p.sku}>
    {p.name} — {fmt(p.price)}₮
  </option>
))}

                    </select>
                  </div>
                </div>

                <div className="two" style={{ marginTop: 12 }}>
                  <div>
                    <label>ID / Username</label>
                    <input
                      value={accountId}
                      onChange={(e) => setAccountId(e.target.value)}
                      placeholder="Ж: PUBG Player ID / Roblox username"
                      autoComplete="off"
                      required
                    />
                  </div>
                  <div>
                    <label>Утас</label>
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="99xxxxxx"
                      inputMode="tel"
                      type="tel"
                      required
                    />
                  </div>
                </div>

                <div className="two" style={{ marginTop: 12 }}>
                  <div>
                    <label>Имэйл</label>
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      type="email"
                      placeholder="name@gmail.com"
                    />
                  </div>
                  <div>
                    <label>Төлбөрийн арга</label>
                    <select value={payment} onChange={(e) => setPayment(e.target.value as any)} required>
                      <option value="qpay">QPay</option>
                      <option value="bank">Банк шилжүүлэг</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginTop: 12 }}>
                  <label>Тэмдэглэл</label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Нэмэлт хүсэлт / цагийн тохироо гэх мэт"
                  />
                </div>

                <div className="divider" />

                <div className="summary">
                  <div className="line">
                    <span className="muted">Сонгосон:</span>
                    <b>{game} • {selectedPack?.name ?? "—"}</b>
                  </div>
                  <div className="line">
                    <span className="muted">Үнэ:</span>
                    <b>{selectedPack ? `${fmt(selectedPack.price)}₮` : "—"}</b>
                  </div>
                  <div className="line">
                    <span className="muted">Төлбөрийн арга:</span>
                    <b>{payment}</b>
                  </div>
                </div>

                <div className="divider" />

                <div className="notice">
                  {payment === "qpay" ? (
                    <>
                      <b>{PAYMENT_INFO.qpay.title}:</b>
                      <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
                        <div className="qr">
                          <img alt="QPay QR" src={PAYMENT_INFO.qpay.qrImageUrl} />
                        </div>
                        <div className="small muted">Төлбөр хийсний дараа гүйлгээний зураг/ID-гаа бидэнд илгээнэ үү.</div>
                      </div>
                    </>
                  ) : (
                    <>
                      <b>{PAYMENT_INFO.bank.title}:</b>
                      <pre style={{ whiteSpace: "pre-wrap", margin: "10px 0 0", color: "var(--muted)" }}>
                        {PAYMENT_INFO.bank.text}
                      </pre>
                    </>
                  )}
                </div>

                <button className="btn ok" type="submit" style={{ marginTop: 12, width: "100%", justifyContent: "center" }}>
                  ✅ Захиалга илгээх
                </button>

                {toast ? <div className="toast">{toast}</div> : null}

                <div className="divider" />

                <div className="notice">
                  <b>Захиалгын төлөв шалгах</b>
                  <div className="two" style={{ marginTop: 10 }}>
                    <div>
                      <label>Захиалгын дугаар</label>
                      <input
                        value={trackId}
                        onChange={(e) => setTrackId(e.target.value)}
                        placeholder="Ж: A1B2C3"
                        autoComplete="off"
                      />
                    </div>
                    <div style={{ alignSelf: "end" }}>
                      <button
                        className="btn primary"
                        type="button"
                        style={{ width: "100%", justifyContent: "center" }}
                        onClick={async () => {
                          const id = trackId.trim();
                          if (!id) return showToast("❗ Захиалгын дугаараа оруулна уу.");
                          try {
                            await refreshStatus(id);
                            startAutoRefresh(id);
                            showToast("✅ Төлөв автоматаар шинэчлэгдэнэ.");
                          } catch (e: any) {
                            showToast("❗ " + (e?.message || "Алдаа"));
                          }
                        }}
                      >
                        🔎 Шалгах
                      </button>
                    </div>
                  </div>

                  <div style={{ marginTop: 10 }}>
                    <div className="small muted">Одоогийн төлөв:</div>
                    <div style={{ fontWeight: 900 }}>{trackStatus}</div>
                  </div>
                </div>
              </form>
            </div>
          </section>
        </main>

        <footer>© {new Date().getFullYear()} Kimura recharge. All rights reserved.</footer>
      </div>
    </>
  );
}
