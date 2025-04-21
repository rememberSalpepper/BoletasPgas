import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const files = formData.getAll("files") as File[]
    // ... (validación de files) ...

    const apiFormData = new FormData()
    files.forEach((file) => apiFormData.append("files", file) );

    // ¡URL CORRECTA PARA ESTE ENDPOINT!
    const apiUrl = `${process.env.PYTHON_API_URL || "http://localhost:8000"}/extract_multi` // <-- Apunta a /extract_multi

    const response = await fetch(apiUrl, { method: "POST", body: apiFormData })
    // ... (manejo de errores y respuesta) ...
     if (!response.ok) { /* ... error handling ... */ throw new Error(/*...*/); }
     const data = await response.json();
     return NextResponse.json(data);
  } catch (error) {
    // ... (manejo de catch) ...
    return NextResponse.json({ error: /*...*/ }, { status: 500 });
  }
}