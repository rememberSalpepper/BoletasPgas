import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const files = formData.getAll("files") as File[]

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No se proporcionaron archivos" }, { status: 400 })
    }

    // Crear un nuevo FormData para enviar a la API de Python
    const apiFormData = new FormData()
    files.forEach((file) => {
      apiFormData.append("files", file)
    })

    // URL de la API de Python (ajustar según corresponda)
    const apiUrl = process.env.PYTHON_API_URL || "http://localhost:8000/extract_multi"

    const response = await fetch(apiUrl, {
      method: "POST",
      body: apiFormData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Error en la API: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error procesando la solicitud:", error)
    return NextResponse.json(
      { error: `Error interno del servidor: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 },
    )
  }
}
