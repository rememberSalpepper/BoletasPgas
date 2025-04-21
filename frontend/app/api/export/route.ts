import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const extractedResults = formData.get("extracted_results") as string
    // ... (validación de extractedResults) ...

    const apiFormData = new FormData()
    apiFormData.append("extracted_results", extractedResults)

    // ¡URL CORRECTA PARA ESTE ENDPOINT!
    const apiUrl = `${process.env.PYTHON_API_URL || "http://localhost:8000"}/export` // <-- Apunta a /export

    const response = await fetch(apiUrl, { method: "POST", body: apiFormData })
    // ... (manejo de errores y respuesta - incluyendo blob y headers) ...
    if (!response.ok) { /* ... error handling ... */ throw new Error(/*...*/); }
    const blob = await response.blob();
    return new NextResponse(blob, { headers: { /*...*/ } });
  } catch (error) {
    // ... (manejo de catch) ...
    return NextResponse.json({ error: /*...*/ }, { status: 500 });
  }
}