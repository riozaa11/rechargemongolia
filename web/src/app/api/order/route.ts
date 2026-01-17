import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ ok: true, hint: "Use POST /api/order" });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // TODO: энд захиалга хадгалах логик (DB/файл) нэмнэ
    return NextResponse.json({ ok: true, received: body });
  } catch {
    return NextResponse.json({ ok: false, error: "Bad JSON" }, { status: 400 });
  }
}
