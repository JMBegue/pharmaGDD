import { useState, useEffect } from 'react'

export function useProducts() {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'

    const fetchProducts = async () => {
        try {
            setLoading(true)
            setError(null)

            const response = await fetch(`${API_BASE_URL}/api/products`, {
                headers: {
                    "Content-Type": "application/json"
                }
            })

            if (!response.ok) {
                throw new Error(`Erreur ${response.status}: ${response.statusText}`)
            }

            const data = await response.json()

            // S'assurer que data est un tableau
            const productsArray = Array.isArray(data) ? data :
                Array.isArray(data.data) ? data.data :
                    Array.isArray(data.products) ? data.products : [];

            setProducts(productsArray)

            return data
        } catch (err) {
            setError(err.message)
            console.error('Error fetching products:', err)
            throw err
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchProducts()
    }, [])

    const refreshProducts = () => {
        return fetchProducts()
    }

    const createProduct = async (formData) => {
        try {
            setLoading(true)
            const response = await fetch(`${API_BASE_URL}/api/products`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData),
                credentials: 'include'
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                throw new Error(errorData.message || `Erreur ${response.status}`)
            }

            const result = await response.json()
            await fetchProducts() // Rafraîchir la liste
            return result
        } catch (err) {
            setError(err.message)
            console.error('Error creating product:', err)
            throw err
        } finally {
            setLoading(false)
        }
    }

    const updateProduct = async (id, formData) => {
        try {
            setLoading(true)
            const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData)
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                throw new Error(errorData.message || `Erreur ${response.status}`)
            }

            const result = await response.json()
            await fetchProducts() // Rafraîchir la liste
            return result
        } catch (err) {
            setError(err.message)
            console.error('Error updating product:', err)
            throw err
        } finally {
            setLoading(false)
        }
    }

    const deleteProduct = async (id) => {
        try {
            setLoading(true)
            const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
                method: "DELETE"
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                throw new Error(errorData.message || `Erreur ${response.status}`)
            }

            await fetchProducts() // Rafraîchir la liste
            return { success: true }
        } catch (err) {
            setError(err.message)
            console.error('Error deleting product:', err)
            throw err
        } finally {
            setLoading(false)
        }
    }

    return {
        products,
        loading,
        error,
        refreshProducts,
        createProduct,
        updateProduct,
        deleteProduct
    }
}

export default useProducts