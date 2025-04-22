// app/api/extract-multi/route.ts
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  console.log("--- /api/extract-multi INICIADO ---");

  const pythonApiUrl =
    process.env.PYTHON_API_URL
    ?? "https://api-551745267811.us-central1.run.app";

  console.log("PYTHON_API_URL =", pythonApiUrl);

  try {
    const formData = await req.formData();
    console.log("FormData recibido en /api/extract-multi");
    const files = formData.getAll("files") as File[];

    if (!files.length || !files.every(f => f instanceof File)) {
      console.error("Error en /api/extract-multi: archivos inválidos.");
      return NextResponse.json(
        { error: "Archivos inválidos o no proporcionados" },
        { status: 400 }
      );
    }
    if (files.length > 10) {
      console.error("Error en /api/extract-multi: demasiados archivos.");
      return NextResponse.json(
        { error: "Máximo 10 archivos permitidos" },
        { status: 400 }
      );
    }

    const proxyForm = new FormData();
    files.forEach((file, i) => proxyForm.append("files", file, file.name || `file_${i}`));

    const apiUrl = `${pythonApiUrl}/extract_multi`;
    console.log(`Fetch a Python API (extract-multi): ${apiUrl} con ${files.length} archivos`);

    const res = await fetch(apiUrl, { method: "POST", body: proxyForm });
    console.log("Respuesta de backend Python (extract-multi):", res.status);

    if (!res.ok) {
      const txt = await res.text();
      console.error(`Error desde Python [${res.status}]:`, txt);
      return NextResponse.json(
        { error: `Error del backend: ${txt}` },
        { status: res.status }
      );
    }

    const json = await res.json();
    return NextResponse.json(json);

  } catch (err) {
    console.error("Error CATCH en /api/extract-multi:", err);
    return NextResponse.json(
      { error: `Error interno en API Route: ${err instanceof Error ? err.message : String(err)}` },
      { status: 500 }
    );
  }
}
