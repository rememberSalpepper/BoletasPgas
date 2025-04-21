import { type NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0 || !files.every(file => file instanceof File)) {
       console.error("Error en /api/extract-multi: Archivos inválidos o no proporcionados.");
       return NextResponse.json({ error: "Archivos inválidos o no proporcionados" }, { status: 400 });
    }
    if (files.length > 10) {
        console.error("Error en /api/extract-multi: Demasiados archivos.");
        return NextResponse.json({ error: "Máximo 10 archivos permitidos" }, { status: 400 });
    }

    const apiFormData = new FormData();
    files.forEach((file, index) => {
      apiFormData.append("files", file, file.name || `file_${index}`);
    });

    const apiBaseUrl = process.env.PYTHON_API_URL || "http://localhost:8000";
    const apiUrl = `${apiBaseUrl}/extract_multi`;

    console.log(`Enviando a API Python (extract-multi): ${apiUrl} con ${files.length} archivos`);

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
    console.log(`Respuesta OK de API Python (extract-multi)`);
    return NextResponse.json(data);

  } catch (error) {
    console.error("Error inesperado en /api/extract-multi:", error);
    return NextResponse.json(
      { error: `Error interno del servidor.` },
      { status: 500 }
    );
  }
}