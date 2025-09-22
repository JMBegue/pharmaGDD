import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const response = await fetch(`${process.env.BACKEND_URL}/api/suppliers`)

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des fournisseurs' },
        { status: response.status }
      )
    }

    const data = await response.json()

    // Retourner toujours un tableau
    let suppliers = []
    if (Array.isArray(data)) {
      suppliers = data
    } else if (data.data && Array.isArray(data.data)) {
      suppliers = data.data
    } else if (data.suppliers && Array.isArray(data.suppliers)) {
      suppliers = data.suppliers
    }

    return NextResponse.json(suppliers)

  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}