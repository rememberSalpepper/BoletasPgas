import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File
    // ... (validación de file) ...

    const apiFormData = new FormData()
    apiFormData.append("file", file)

    // ¡URL CORRECTA PARA ESTE ENDPOINT!
    const apiUrl = `${process.env.PYTHON_API_URL || "http://localhost:8000"}/extract` // <-- Apunta a /extract

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