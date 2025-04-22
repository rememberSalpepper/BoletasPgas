import { type NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  console.log("--- /api/extract INICIADO ---");
  const pythonApiUrlFromEnv = process.env.PYTHON_API_URL; // Leerla SIEMPRE
  console.log("Valor DEBUG de process.env.PYTHON_API_URL:", pythonApiUrlFromEnv); // Loguear valor actual

  // Usar el valor leído o el fallback (aunque esperamos que el hardcodeado funcione ahora)
  const apiBaseUrl = pythonApiUrlFromEnv || "http://localhost:8000";
  const apiUrl = `${apiBaseUrl}/extract`;

  console.log(`Intentando fetch a API Python (extract): ${apiUrl}`);

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
    // Este catch ahora es MUY importante si fetch falla
    console.error("Error CATCH en /api/extract:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
     // Devuelve el error específico de fetch si ocurre
    if (errorMessage.toLowerCase().includes('fetch failed') || errorMessage.toLowerCase().includes('econnrefused')) {
         return NextResponse.json({ error: `Error interno al conectar con la API backend: ${errorMessage}` }, { status: 502 }); // 502 Bad Gateway
    }
    return NextResponse.json( { error: `Error interno en API Route: ${errorMessage}` }, { status: 500 });
  }
}