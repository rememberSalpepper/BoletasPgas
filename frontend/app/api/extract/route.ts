import { type NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  console.log("--- /api/extract INICIADO ---");
  const pythonApiUrlFromEnv = process.env.PYTHON_API_URL;

  if (!pythonApiUrlFromEnv) {
      console.error("¡ERROR CRÍTICO! La variable de entorno PYTHON_API_URL NO está definida o está vacía.");
      return NextResponse.json( { error: "Configuración del servidor incompleta: Falta URL de la API backend." }, { status: 503 });
  }
  console.log("Valor leído de process.env.PYTHON_API_URL:", pythonApiUrlFromEnv);

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

    const apiUrl = `${pythonApiUrlFromEnv}/extract`;

    console.log(`Intentando fetch a API Python (extract): ${apiUrl}`);
    const response = await fetch(apiUrl, { method: "POST", body: apiFormData });
    console.log(`Respuesta recibida de API Python (extract): Status ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error desde API Python (${apiUrl}): ${response.status} - ${errorText}`);
      return NextResponse.json( { error: `Error del backend: ${errorText}` }, { status: response.status });
    }

    const data = await response.json();
    console.log(`Respuesta JSON OK de API Python (extract)`);
    return NextResponse.json(data);

  } catch (error) {
    console.error("Error CATCH en /api/extract:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json( { error: `Error interno en API Route: ${errorMessage}` }, { status: 500 });
  }
}