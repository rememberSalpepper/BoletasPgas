// app/api/export/route.ts
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  console.log("--- /api/export INICIADO ---");

  try {
    const formData = await req.formData();
    console.log("FormData recibido en /api/export");
    const extractedResults = formData.get("extracted_results");
    if (!extractedResults || typeof extractedResults !== "string") {
      console.error("Error en /api/export: 'extracted_results' inválido.");
      return NextResponse.json(
        { error: "No se proporcionaron resultados válidos para exportar" },
        { status: 400 }
      );
    }

    // valida JSON
    try {
      JSON.parse(extractedResults);
      console.log("'extracted_results' es JSON válido.");
    } catch (e) {
      console.error("Error parseando JSON en /api/export:", e);
      return NextResponse.json(
        { error: "Los datos a exportar no tienen formato JSON válido" },
        { status: 400 }
      );
    }

    const pythonApiUrl =
      process.env.PYTHON_API_URL
      ?? "https://api-551745267811.us-central1.run.app";
    const apiUrl = `${pythonApiUrl}/export`;

    console.log(`Fetch a Python API (export): ${apiUrl}`);

    const proxyForm = new FormData();
    proxyForm.append("extracted_results", extractedResults);

    const res = await fetch(apiUrl, { method: "POST", body: proxyForm });
    console.log("Respuesta de backend Python (export):", res.status);

    if (!res.ok) {
      const txt = await res.text();
      console.error(`Error desde Python [${res.status}]:`, txt);
      return NextResponse.json(
        { error: `Error al generar el Excel en el backend [${res.status}]` },
        { status: res.status }
      );
    }

    const blob = await res.blob();
    console.log("Blob recibido de Python (export)");

    const headers = new Headers({
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": "attachment; filename=extraccion_comprobantes.xlsx"
    });

    return new NextResponse(blob, { status: 200, headers });

  } catch (err) {
    console.error("Error CATCH en /api/export:", err);
    return NextResponse.json(
      { error: `Error interno del servidor en API Route: ${err instanceof Error ? err.message : String(err)}` },
      { status: 500 }
    );
  }
}
