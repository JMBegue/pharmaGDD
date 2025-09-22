import { NextResponse } from 'next/server'

export async function GET() {
    try {
        const response = await fetch(`${process.env.BACKEND_URL}/api/brands`)

        if (!response.ok) {
            return NextResponse.json(
                { error: 'Erreur lors de la récupération des marques' },
                { status: response.status }
            )
        }

        const data = await response.json()

        // Retourner toujours un tableau
        let brands = []
        if (Array.isArray(data)) {
            brands = data
        } else if (data.data && Array.isArray(data.data)) {
            brands = data.data
        } else if (data.brands && Array.isArray(data.brands)) {
            brands = data.brands
        }

        return NextResponse.json(brands)

    } catch (error) {
        return NextResponse.json(
            { error: 'Erreur serveur' },
            { status: 500 }
        )
    }
}

export async function POST(request) {
    try {
        const body = await request.json()

        const response = await fetch(`${process.env.BACKEND_URL}/api/brands`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        })

        if (!response.ok) {
            return NextResponse.json(
                { error: 'Erreur lors de la création de la marque' },
                { status: response.status }
            )
        }

        const newBrand = await response.json()
        return NextResponse.json(newBrand)

    } catch (error) {
        return NextResponse.json(
            { error: 'Erreur serveur' },
            { status: 500 }
        )
    }
}