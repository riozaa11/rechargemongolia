import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ ok: true, hint: "Use POST /api/admin/login" });
}

export async function POST(req: Request) {
  const { username, password } = await req.json().catch(() => ({}));

  if (username === "admin" && password === "1234") {
    return NextResponse.json({ ok: true, token: "demo-token" });
  }

  return NextResponse.json({ ok: false, error: "Invalid credentials" }, { status: 401 });
}
