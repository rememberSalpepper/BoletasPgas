import { type NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  console.log("--- /api/extract INICIADO ---");
  try {
    const formData = await req.formData();
    console.log("FormData recibido en /api/extract");
    const file = formData.get("file") as File | null;

    if (!file || !(file instanceof File)) {
      console.error("Error en /api/extract: Archivo inválido o no proporcionado.");
      return NextResponse.json({ error: "Archivo inválido o no proporcionado" }, { status: 400 });
    }
    console.log(`Archivo recibido: ${file.name}, Tamaño: ${file.size}`);

    const apiFormData = new FormData();
    apiFormData.append("file", file, file.name);

    const apiBaseUrl = process.env.PYTHON_API_URL || "http://localhost:8000";
    const apiUrl = `${apiBaseUrl}/extract`;

    console.log(`Intentando fetch a API Python (extract): ${apiUrl}`);

    const response = await fetch(apiUrl, {
      method: "POST",
      body: apiFormData,
      // signal: AbortSignal.timeout(30000) // Considera añadir timeout
    });

    console.log(`Respuesta recibida de API Python (extract): Status ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error desde API Python (${apiUrl}): ${response.status} - ${errorText}`);
      return NextResponse.json(
         { error: `Error al procesar en el servidor backend [${response.status}]` },
         { status: response.status }
      );
    }

    const data = await response.json();
    console.log(`Respuesta JSON OK de API Python (extract)`);
    return NextResponse.json(data);

  } catch (error) {
    console.error("Error CATCH en /api/extract:", error); // Loguea el error completo
    return NextResponse.json(
      { error: `Error interno del servidor en API Route: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
}