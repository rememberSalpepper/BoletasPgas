// app/api/extract/route.ts (Prueba de Conectividad Externa - Versión Final)
import { type NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  console.log("--- /api/extract INICIADO (Prueba Conectividad Externa) ---");
  const pythonApiUrlFromEnv = process.env.PYTHON_API_URL;

  // --- ¡PRUEBA DE FETCH EXTERNO DEFINITIVA! ---
  const testUrl = "https://www.google.com"; // O "https://jsonplaceholder.typicode.com/todos/1";
  try {
    console.log(`Intentando fetch de prueba a: ${testUrl}`);
    // Usa un timeout razonable
    const testResponse = await fetch(testUrl, { method: 'GET', signal: AbortSignal.timeout(10000) }); // 10 segundos
    console.log(`Respuesta de prueba recibida: Status ${testResponse.status}`);

    if (!testResponse.ok) {
         const testErrorText = await testResponse.text();
         console.error(`Fetch de prueba EXTERNO falló! Status: ${testResponse.status}, Respuesta: ${testErrorText.substring(0, 100)}...`);
         // Devuelve un error claro indicando que la prueba falló
         return NextResponse.json({ error: `ERROR CRÍTICO: Falló la llamada de red saliente de prueba a ${testUrl}. Causa: ${testResponse.status}` }, { status: 500 });
    } else {
        console.log("Fetch de prueba EXTERNO a Google.com OK.");
        // Si esto funciona, el problema NO es la salida general a Internet.
        // Vamos a intentar la llamada a la API Python AQUI MISMO para ver si falla de nuevo
        console.log(`Fetch de prueba externo OK. Procediendo con fetch a API Python: ${pythonApiUrlFromEnv}`);
        if (!pythonApiUrlFromEnv || pythonApiUrlFromEnv.trim() === "") {
             console.error("PYTHON_API_URL NO definida después de fetch de prueba OK.");
              return NextResponse.json( { error: "ERROR CRÍTICO: PYTHON_API_URL no definida a pesar de conectividad." }, { status: 503 });
         }

         // Intenta la llamada a la API Python AHORA
         const apiFormData = await req.formData(); // Necesitas leer formData DE NUEVO si lo consumiste arriba
         const file = apiFormData.get("file") as File | null;
         if (!file || !(file instanceof File)) { console.error("Archivo inválido..."); return NextResponse.json({ error: "Archivo inválido" }, { status: 400 }); }
         const realApiFormData = new FormData(); // Nuevo FormData para la llamada real
         realApiFormData.append("file", file, file.name);

         const apiUrl = `${pythonApiUrlFromEnv}/extract`;

         console.log(`Intentando fetch REAL a API Python: ${apiUrl}`);
         const response = await fetch(apiUrl, { method: "POST", body: realApiFormData });
         console.log(`Respuesta REAL recibida de API Python: Status ${response.status}`);

         if (!response.ok) {
             const errorText = await response.text();
             console.error(`ERROR REAL desde API Python (${apiUrl}): ${response.status} - ${errorText}`);
             return NextResponse.json( { error: `Error del backend: ${errorText}` }, { status: response.status });
         }

         const data = await response.json();
         console.log(`Respuesta REAL JSON OK de API Python (extract)`);
         return NextResponse.json(data);

    }
  } catch (testError) {
    console.error("Error CATCH durante fetch de prueba EXTERNO:", testError);
    // Si el fetch de prueba falla aquí, hay un problema general de red saliente
    return NextResponse.json(
       { error: `ERROR CRÍTICO: Falló la llamada de red saliente de prueba: ${testError instanceof Error ? testError.message : String(testError)}` },
       { status: 500 }
    );
  }
  // Remueve el bloque try/catch anterior si pones esta lógica
}