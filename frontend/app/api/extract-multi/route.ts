import { type NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  console.log("--- /api/extract-multi INICIADO ---");
  try {
    const formData = await req.formData();
    console.log("FormData recibido en /api/extract-multi");
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0 || !files.every(file => file instanceof File)) {
       console.error("Error en /api/extract-multi: Archivos inválidos o no proporcionados.");
       return NextResponse.json({ error: "Archivos inválidos o no proporcionados" }, { status: 400 });
    }
    if (files.length > 10) {
        console.error("Error en /api/extract-multi: Demasiados archivos.");
        return NextResponse.json({ error: "Máximo 10 archivos permitidos" }, { status: 400 });
    }
    console.log(`Archivos recibidos: ${files.length}`);

    const apiFormData = new FormData();
    files.forEach((file, index) => {
      apiFormData.append("files", file, file.name || `file_${index}`);
    });

    const apiBaseUrl = process.env.PYTHON_API_URL || "http://localhost:8000";
    const apiUrl = `${apiBaseUrl}/extract_multi`;

    console.log(`Intentando fetch a API Python (extract-multi): ${apiUrl} con ${files.length} archivos`);

    const response = await fetch(apiUrl, {
      method: "POST",
      body: apiFormData,
      // signal: AbortSignal.timeout(60000) // Considera timeout más largo
    });

    console.log(`Respuesta recibida de API Python (extract-multi): Status ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error desde API Python (${apiUrl}): ${response.status} - ${errorText}`);
      return NextResponse.json(
         { error: `Error al procesar en el servidor backend [${response.status}]` },
         { status: response.status }
      );
    }

    const data = await response.json();
    console.log(`Respuesta JSON OK de API Python (extract-multi)`);
    return NextResponse.json(data);

  } catch (error) {
    console.error("Error CATCH en /api/extract-multi:", error);
    return NextResponse.json(
      { error: `Error interno del servidor en API Route: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
}