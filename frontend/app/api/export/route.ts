import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const extractedResults = formData.get("extracted_results") as string

    if (!extractedResults) {
      return NextResponse.json({ error: "No se proporcionaron resultados para exportar" }, { status: 400 })
    }

    // Crear un nuevo FormData para enviar a la API de Python
    const apiFormData = new FormData()
    apiFormData.append("extracted_results", extractedResults)

    // URL de la API de Python (ajustar según corresponda)
    const apiUrl = process.env.PYTHON_API_URL || "http://localhost:8000/export"

    const response = await fetch(apiUrl, {
      method: "POST",
      body: apiFormData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Error en la API: ${response.status} - ${errorText}`)
    }

    // Obtener el blob del Excel
    const blob = await response.blob()

    // Crear una respuesta con el blob
    return new NextResponse(blob, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": "attachment; filename=extraccion_comprobantes.xlsx",
      },
    })
  } catch (error) {
    console.error("Error procesando la solicitud:", error)
    return NextResponse.json(
      { error: `Error interno del servidor: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 },
    )
  }
}
