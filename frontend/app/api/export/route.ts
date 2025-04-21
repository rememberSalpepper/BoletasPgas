import { type NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const extractedResults = formData.get("extracted_results") as string | null;

    if (!extractedResults || typeof extractedResults !== 'string') {
       console.error("Error en /api/export: No se proporcionaron 'extracted_results' válidos.");
       return NextResponse.json({ error: "No se proporcionaron resultados válidos para exportar" }, { status: 400 });
    }

    try { JSON.parse(extractedResults); } catch(e) {
        console.error("Error en /api/export: 'extracted_results' no es un JSON válido.");
        return NextResponse.json({ error: "Los datos a exportar no tienen formato JSON válido" }, { status: 400 });
    }

    const apiFormData = new FormData();
    apiFormData.append("extracted_results", extractedResults);

    const apiBaseUrl = process.env.PYTHON_API_URL || "http://localhost:8000";
    const apiUrl = `${apiBaseUrl}/export`;

    console.log(`Enviando a API Python (export): ${apiUrl}`);

    const response = await fetch(apiUrl, {
      method: "POST",
      body: apiFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error desde API Python (${apiUrl}): ${response.status} - ${errorText}`);
      return NextResponse.json(
         { error: `Error al generar el Excel en el servidor backend [${response.status}]` },
         { status: response.status }
      );
    }

    const blob = await response.blob();
    console.log(`Respuesta OK de API Python (export): Blob recibido`);

    const headers = new Headers();
    headers.set("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    headers.set("Content-Disposition", "attachment; filename=extraccion_comprobantes.xlsx");

    return new NextResponse(blob, { status: 200, statusText: "OK", headers });

  } catch (error) {
    console.error("Error inesperado en /api/export:", error);
    return NextResponse.json(
      { error: `Error interno del servidor.` },
      { status: 500 }
    );
  }
}