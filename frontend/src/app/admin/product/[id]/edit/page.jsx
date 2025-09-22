"use client"

import { useState, useEffect } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import "App/styles/dashboard.scss"

export default function EditProductPage() {
    const router = useRouter()
    const params = useParams()
    const searchParams = useSearchParams()
    const productId = params.id
    const variantId = searchParams.get('variant')

    const [product, setProduct] = useState(null)
    const [selectedVariant, setSelectedVariant] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [formData, setFormData] = useState({
        name: '',
        subtitle: '',
        description: '',
        base_price: '',
        is_active: true,
        // Données du variant
        variant_format: '',
        variant_quantity: '',
        variant_price: '',
        variant_sku: '',
        variant_is_active: true
    })

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true)
                const response = await fetch(`http://localhost:8000/api/products/${productId}`)

                if (!response.ok) {
                    throw new Error('Produit non trouvé')
                }

                const productData = await response.json()
                setProduct(productData)

                // Déterminer le variant à éditer
                let targetVariant = null

                if (variantId) {
                    // Si un variantId est spécifié dans l'URL, le trouver
                    targetVariant = productData.data.variants.find(v => v.id == variantId)
                }
console.log(productData)
                if (!targetVariant && productData.data.variants.length > 0) {
                    // Sinon, prendre le premier variant
                    targetVariant = productData.data.variants[0]
                }

                setSelectedVariant(targetVariant)

                // Pré-remplir le formulaire
                setFormData({
                    name: productData.data.name || '',
                    subtitle: productData.data.subtitle || '',
                    description: productData.data.description || '',
                    base_price: productData.data.base_price || '',
                    is_active: productData.data.is_active ?? true,
                    variant_format: targetVariant?.format || '',
                    variant_quantity: targetVariant?.quantity || '',
                    variant_price: targetVariant?.price || '',
                    variant_sku: targetVariant?.sku || '',
                    variant_is_active: targetVariant?.is_active ?? true
                })

            } catch (err) {
                setError(err.message)
                console.error('Erreur lors du chargement:', err)
            } finally {
                setLoading(false)
            }
        }

        if (productId) {
            fetchProduct()
        }
    }, [productId, variantId])

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))
    }

    const handleVariantChange = (e) => {
        const variantId = e.target.value
        const variant = product.variants.find(v => v.id == variantId)

        if (variant) {
            setSelectedVariant(variant)
            setFormData(prev => ({
                ...prev,
                variant_format: variant.format,
                variant_quantity: variant.quantity,
                variant_price: variant.price,
                variant_sku: variant.sku,
                variant_is_active: variant.is_active
            }))
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            setLoading(true)

            // Mettre à jour le produit
            const productResponse = await fetch(`http://localhost:8000/api/products/${productId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name,
                    subtitle: formData.subtitle,
                    description: formData.description,
                    base_price: parseFloat(formData.base_price),
                    is_active: formData.is_active
                })
            })

            if (!productResponse.ok) {
                throw new Error('Erreur lors de la mise à jour du produit')
            }

            // Mettre à jour le variant si un variant est sélectionné
            if (selectedVariant) {
                const variantResponse = await fetch(`http://localhost:8000/api/variants/${selectedVariant.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        format: formData.variant_format,
                        quantity: parseFloat(formData.variant_quantity),
                        price: parseFloat(formData.variant_price),
                        sku: formData.variant_sku,
                        is_active: formData.variant_is_active
                    })
                })

                if (!variantResponse.ok) {
                    throw new Error('Erreur lors de la mise à jour du variant')
                }
            }

            // Redirection après succès
            router.push('/admin/dashboard?message=Produit mis à jour avec succès')

        } catch (err) {
            setError(err.message)
            console.error('Erreur lors de la mise à jour:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleAddVariant = () => {
        router.push(`/admin/product/${productId}/variant/create`)
    }

    if (loading) return (
        <div className="loading-container">
            <div className="spinner"></div>
            <p>Chargement du produit...</p>
        </div>
    )

    if (error) return (
        <div className="error-container">
            <h2>Erreur</h2>
            <p>{error}</p>
            <button onClick={() => router.back()} className="btn btn-secondary">
                Retour
            </button>
        </div>
    )

    if (!product) return (
        <div className="error-container">
            <h2>Produit non trouvé</h2>
            <button onClick={() => router.back()} className="btn btn-secondary">
                Retour
            </button>
        </div>
    )

    return (
        <div className="edit-product-container">
            <header className="page-header">
                <h1>Modifier le produit</h1>
                <button onClick={() => router.back()} className="btn btn-secondary">
                    Retour
                </button>
            </header>

            {error && (
                <div className="alert alert-error">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="product-form">
                {/* Sélection du variant */}
                {product.variants && product.variants.length > 0 && (
                    <div className="form-section">
                        <h2>Sélection du variant</h2>
                        <div className="form-group">
                            <label htmlFor="variant-select">Choisir un variant à modifier:</label>
                            <select
                                id="variant-select"
                                value={selectedVariant?.id || ''}
                                onChange={handleVariantChange}
                                className="form-control"
                            >
                                {product.variants.map(variant => (
                                    <option key={variant.id} value={variant.id}>
                                        {variant.sku} - {variant.formatted_name} ({variant.price}€)
                                    </option>
                                ))}
                            </select>
                        </div>
                        <button
                            type="button"
                            onClick={handleAddVariant}
                            className="btn btn-success"
                        >
                            + Ajouter un nouveau variant
                        </button>
                    </div>
                )}

                {/* Informations du produit */}
                <div className="form-section">
                    <h2>Informations du produit</h2>

                    <div className="form-group">
                        <label htmlFor="name">Nom du produit:</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="form-control"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="subtitle">Sous-titre:</label>
                        <input
                            type="text"
                            id="subtitle"
                            name="subtitle"
                            value={formData.subtitle}
                            onChange={handleInputChange}
                            className="form-control"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">Description:</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            className="form-control"
                            rows="4"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="base_price">Prix de base:</label>
                        <input
                            type="number"
                            id="base_price"
                            name="base_price"
                            value={formData.base_price}
                            onChange={handleInputChange}
                            className="form-control"
                            step="0.01"
                            min="0"
                            required
                        />
                    </div>

                    <div className="form-group checkbox-group">
                        <label>
                            <input
                                type="checkbox"
                                name="is_active"
                                checked={formData.is_active}
                                onChange={handleInputChange}
                            />
                            Produit actif
                        </label>
                    </div>
                </div>

                {/* Informations du variant */}
                {selectedVariant && (
                    <div className="form-section">
                        <h2>Informations du variant</h2>

                        <div className="form-group">
                            <label htmlFor="variant_format">Format:</label>
                            <select
                                id="variant_format"
                                name="variant_format"
                                value={formData.variant_format}
                                onChange={handleInputChange}
                                className="form-control"
                                required
                            >
                                <option value="grams">Grammes</option>
                                <option value="liters">Litres</option>
                                <option value="capsules">Capsules</option>
                                <option value="milliliters">Millilitres</option>
                                <option value="units">Unités</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="variant_quantity">Quantité:</label>
                            <input
                                type="number"
                                id="variant_quantity"
                                name="variant_quantity"
                                value={formData.variant_quantity}
                                onChange={handleInputChange}
                                className="form-control"
                                step="0.01"
                                min="0"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="variant_price">Prix:</label>
                            <input
                                type="number"
                                id="variant_price"
                                name="variant_price"
                                value={formData.variant_price}
                                onChange={handleInputChange}
                                className="form-control"
                                step="0.01"
                                min="0"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="variant_sku">SKU:</label>
                            <input
                                type="text"
                                id="variant_sku"
                                name="variant_sku"
                                value={formData.variant_sku}
                                onChange={handleInputChange}
                                className="form-control"
                                required
                            />
                        </div>

                        <div className="form-group checkbox-group">
                            <label>
                                <input
                                    type="checkbox"
                                    name="variant_is_active"
                                    checked={formData.variant_is_active}
                                    onChange={handleInputChange}
                                />
                                Variant actif
                            </label>
                        </div>
                    </div>
                )}

                {/* Boutons d'action */}
                <div className="form-actions">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="btn btn-secondary"
                        disabled={loading}
                    >
                        Annuler
                    </button>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                    >
                        {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
                    </button>
                </div>
            </form>
        </div>
    )
}