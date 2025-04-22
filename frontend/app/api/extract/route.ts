// app/api/extract/route.ts

// Fuerza Node.js runtime (no Edge), donde sí están disponibles todas las env vars
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  console.log("--- /api/extract INICIADO ---");

  // Intentamos leerla, y si no existe usamos un fallback hardcodeado
  const pythonApiUrl =
    process.env.PYTHON_API_URL
    ?? "https://api-551745267811.us-central1.run.app";

  console.log("PYTHON_API_URL =", pythonApiUrl);

  const apiUrl = `${pythonApiUrl}/extract`;
  console.log("Fetch a Python API:", apiUrl);

  try {
    const formData = await req.formData();
    const fileField = formData.get("file");
    if (!(fileField instanceof File)) {
      return NextResponse.json(
        { error: "Archivo inválido o no proporcionado" },
        { status: 400 }
      );
    }

    const proxyForm = new FormData();
    proxyForm.append("file", fileField, fileField.name);

    const res = await fetch(apiUrl, { method: "POST", body: proxyForm });
    console.log("Backend response status:", res.status);

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: `Error del backend: ${text}` },
        { status: res.status }
      );
    }

    const json = await res.json();
    return NextResponse.json(json);

  } catch (err) {
    console.error("Error en /api/extract:", err);
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.toLowerCase().includes("fetch failed") || msg.toLowerCase().includes("econnrefused")) {
      return NextResponse.json(
        { error: `Error interno al conectar con la API backend: ${msg}` },
        { status: 502 }
      );
    }
    return NextResponse.json(
      { error: `Error interno en API Route: ${msg}` },
      { status: 500 }
    );
  }
}
