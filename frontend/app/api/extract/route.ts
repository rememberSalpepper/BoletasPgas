import { type NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file || !(file instanceof File)) {
      console.error("Error en /api/extract: Archivo inválido o no proporcionado.");
      return NextResponse.json({ error: "Archivo inválido o no proporcionado" }, { status: 400 });
    }

    const apiFormData = new FormData();
    apiFormData.append("file", file, file.name);

    const apiBaseUrl = process.env.PYTHON_API_URL || "http://localhost:8000";
    const apiUrl = `${apiBaseUrl}/extract`;

    console.log(`Enviando a API Python (extract): ${apiUrl}`);

    const response = await fetch(apiUrl, {
      method: "POST",
      body: apiFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error desde API Python (${apiUrl}): ${response.status} - ${errorText}`);
      return NextResponse.json(
         { error: `Error al procesar en el servidor backend [${response.status}]` },
         { status: response.status }
      );
    }

    const data = await response.json();
    console.log(`Respuesta OK de API Python (extract)`);
    return NextResponse.json(data);

  } catch (error) {
    console.error("Error inesperado en /api/extract:", error);
    return NextResponse.json(
      { error: `Error interno del servidor.` },
      { status: 500 }
    );
  }
}