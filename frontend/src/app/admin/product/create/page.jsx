"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import "App/styles/dashboard.scss"

export default function CreateProductPage() {
    const router = useRouter()

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [brands, setBrands] = useState([])
    const [suppliers, setSuppliers] = useState([])
    const [showBrandModal, setShowBrandModal] = useState(false)
    const [showSupplierModal, setShowSupplierModal] = useState(false)
    const [newBrand, setNewBrand] = useState({
        name: '',
        reference_number: '',
        description: ''
    })
    const [newSupplier, setNewSupplier] = useState({
        name: '',
        contact_email: '',
        contact_phone: '',
        address: ''
    })

    const [formData, setFormData] = useState({
        name: '',
        subtitle: '',
        description: '',
        brand_id: '',
        supplier_id: '',
        supplier_reference: '',
        format: 'units',
        base_price: '',
        is_active: true,
        initial_stock: 0,
        min_stock_level: 10,
        max_stock_level: 100,
        variants: [{
            format: 'units',
            quantity: 1,
            price: '',
            sku: '',
            is_active: true
        }]
    })

    useEffect(() => {
        fetchBrandsAndSuppliers()
    }, [])

    const fetchBrandsAndSuppliers = async () => {
        try {
            const [brandsResponse, suppliersResponse] = await Promise.all([
                fetch('http://localhost:8000/api/brands'),
                fetch('http://localhost:8000/api/suppliers')
            ])

            if (brandsResponse.ok) {
                const brandsData = await brandsResponse.json()
                const brandsArray = Array.isArray(brandsData) ? brandsData :
                    Array.isArray(brandsData?.data) ? brandsData.data :
                        Array.isArray(brandsData?.brands) ? brandsData.brands : []
                setBrands(brandsArray)
            }

            if (suppliersResponse.ok) {
                const suppliersData = await suppliersResponse.json()
                const suppliersArray = Array.isArray(suppliersData) ? suppliersData :
                    Array.isArray(suppliersData?.data) ? suppliersData.data :
                        Array.isArray(suppliersData?.suppliers) ? suppliersData.suppliers : []
                setSuppliers(suppliersArray)
            }
        } catch (err) {
            console.error('Erreur lors du chargement:', err)
            setBrands([])
            setSuppliers([])
        }
    }

    // S'assurer que brands et suppliers sont toujours des tableaux
    const safeBrands = Array.isArray(brands) ? brands : []
    const safeSuppliers = Array.isArray(suppliers) ? suppliers : []

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))
    }

    const handleVariantChange = (index, field, value) => {
        const updatedVariants = [...formData.variants]
        updatedVariants[index][field] = field === 'quantity' || field === 'price' ? parseFloat(value) || 0 : value
        setFormData(prev => ({ ...prev, variants: updatedVariants }))
    }

    const addVariant = () => {
        setFormData(prev => ({
            ...prev,
            variants: [
                ...prev.variants,
                {
                    format: 'units',
                    quantity: 1,
                    price: '',
                    sku: '',
                    is_active: true
                }
            ]
        }))
    }

    const removeVariant = (index) => {
        if (formData.variants.length > 1) {
            setFormData(prev => ({
                ...prev,
                variants: prev.variants.filter((_, i) => i !== index)
            }))
        }
    }

    const createBrand = async (brandData) => {
        try {
            const response = await fetch('http://localhost:8000/api/brands', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(brandData)
            })

            if (response.ok) {
                const newBrandData = await response.json()
                setBrands(prev => [...prev, newBrandData])
                setFormData(prev => ({ ...prev, brand_id: newBrandData.id }))
                setShowBrandModal(false)
                setNewBrand({ name: '', reference_number: '', description: '' })
                return newBrandData
            }
            throw new Error('Erreur lors de la création de la marque')
        } catch (err) {
            setError(err.message)
            throw err
        }
    }

    const createSupplier = async (supplierData) => {
        try {
            const response = await fetch('http://localhost:8000/api/suppliers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(supplierData)
            })

            if (response.ok) {
                const newSupplierData = await response.json()
                setSuppliers(prev => [...prev, newSupplierData])
                setFormData(prev => ({ ...prev, supplier_id: newSupplierData.id }))
                setShowSupplierModal(false)
                setNewSupplier({ name: '', contact_email: '', contact_phone: '', address: '' })
                return newSupplierData
            }
            throw new Error('Erreur lors de la création du fournisseur')
        } catch (err) {
            setError(err.message)
            throw err
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            setLoading(true)
            setError(null)

            // Vérifications de base
            if (!formData.name || !formData.base_price) {
                throw new Error('Le nom et le prix sont obligatoires')
            }

            // Vérifier si on doit créer une nouvelle marque
            let brandId = formData.brand_id
            if (!brandId && newBrand.name) {
                if (!newBrand.reference_number) {
                    throw new Error('La référence de la marque est obligatoire')
                }
                const createdBrand = await createBrand(newBrand)
                brandId = createdBrand.id
            }

            if (!brandId) {
                throw new Error('Veuillez sélectionner ou créer une marque')
            }

            // Vérifier si on doit créer un nouveau fournisseur
            let supplierId = formData.supplier_id
            if (!supplierId && newSupplier.name) {
                if (!newSupplier.contact_email || !newSupplier.contact_phone || !newSupplier.address) {
                    throw new Error('Tous les champs du fournisseur sont obligatoires')
                }
                const createdSupplier = await createSupplier(newSupplier)
                supplierId = createdSupplier.id
            }

            // Valider les variants
            for (const variant of formData.variants) {
                if (!variant.sku || !variant.price || !variant.quantity) {
                    throw new Error('Tous les champs des variants sont obligatoires')
                }
            }

            // Préparer les données pour l'envoi
            const productData = {
                name: formData.name,
                subtitle: formData.subtitle,
                description: formData.description,
                brand_id: brandId,
                format: formData.format,
                base_price: parseFloat(formData.base_price),
                is_active: formData.is_active,
                initial_stock: parseInt(formData.initial_stock),
                min_stock_level: parseInt(formData.min_stock_level),
                max_stock_level: parseInt(formData.max_stock_level),
                variants: formData.variants.map(variant => ({
                    format: variant.format,
                    quantity: parseFloat(variant.quantity),
                    price: parseFloat(variant.price),
                    sku: variant.sku,
                    is_active: variant.is_active
                }))
            }

            // Ajouter les informations fournisseur si disponibles
            if (supplierId) {
                productData.supplier_id = supplierId
                productData.supplier_reference = formData.supplier_reference || ''
            }

            const response = await fetch('http://localhost:8000/api/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(productData)
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || 'Erreur lors de la création du produit')
            }

            router.push('/admin/dashboard?message=Produit créé avec succès')

        } catch (err) {
            setError(err.message)
            console.error('Erreur lors de la création:', err)
        } finally {
            setLoading(false)
        }
    }

    const generateSKU = (productName, variantIndex) => {
        const productCode = productName.substring(0, 3).toUpperCase().replace(/\s/g, '')
        const variantCode = (variantIndex + 1).toString().padStart(2, '0')
        return `${productCode}-${variantCode}`
    }

    const autoGenerateSKUs = () => {
        if (!formData.name) {
            setError('Veuillez d\'abord saisir le nom du produit')
            return
        }

        const updatedVariants = formData.variants.map((variant, index) => ({
            ...variant,
            sku: generateSKU(formData.name, index)
        }))

        setFormData(prev => ({ ...prev, variants: updatedVariants }))
    }

    return (
        <div className="edit-product-container">
            <header className="page-header">
                <h1>Créer un nouveau produit</h1>
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="btn btn-secondary"
                    disabled={loading}
                >
                    Retour
                </button>
            </header>

            {error && (
                <div className="alert alert-error">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="product-form">
                {/* Gestion de la marque */}
                <div className="form-section">
                    <h2>Marque *</h2>

                    <div className="form-group">
                        <label>Sélectionner une marque existante:</label>
                        <select
                            value={formData.brand_id}
                            onChange={(e) => setFormData(prev => ({ ...prev, brand_id: e.target.value }))}
                            className="form-control"
                            required
                        >
                            <option value="">Choisir une marque...</option>
                            {safeBrands.map(brand => (
                                <option key={brand.id} value={brand.id}>
                                    {brand.name} ({brand.reference_number})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Ou créer une nouvelle marque:</label>
                        <button
                            type="button"
                            onClick={() => setShowBrandModal(true)}
                            className="btn btn-success"
                        >
                            + Nouvelle marque
                        </button>
                    </div>
                </div>

                {/* Gestion du fournisseur */}
                <div className="form-section">
                    <h2>Fournisseur (optionnel)</h2>

                    <div className="form-group">
                        <label>Sélectionner un fournisseur existant:</label>
                        <select
                            value={formData.supplier_id}
                            onChange={(e) => setFormData(prev => ({ ...prev, supplier_id: e.target.value }))}
                            className="form-control"
                        >
                            <option value="">Choisir un fournisseur...</option>
                            {safeSuppliers.map(supplier => (
                                <option key={supplier.id} value={supplier.id}>
                                    {supplier.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {formData.supplier_id && (
                        <div className="form-group">
                            <label htmlFor="supplier_reference">Référence fournisseur:</label>
                            <input
                                type="text"
                                id="supplier_reference"
                                name="supplier_reference"
                                value={formData.supplier_reference}
                                onChange={handleInputChange}
                                className="form-control"
                                placeholder="Référence chez le fournisseur"
                            />
                        </div>
                    )}

                    <div className="form-group">
                        <label>Ou créer un nouveau fournisseur:</label>
                        <button
                            type="button"
                            onClick={() => setShowSupplierModal(true)}
                            className="btn btn-success"
                        >
                            + Nouveau fournisseur
                        </button>
                    </div>
                </div>

                {/* Informations de base */}
                <div className="form-section">
                    <h2>Informations de base</h2>

                    <div className="form-group">
                        <label htmlFor="name">Nom du produit *:</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="form-control"
                            required
                            placeholder="Nom du produit"
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
                            placeholder="Sous-titre optionnel"
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
                            placeholder="Description détaillée du produit"
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="base_price">Prix de base *:</label>
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
                                placeholder="0.00"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="format">Format principal *:</label>
                            <select
                                id="format"
                                name="format"
                                value={formData.format}
                                onChange={handleInputChange}
                                className="form-control"
                                required
                            >
                                <option value="units">Unités</option>
                                <option value="grams">Grammes</option>
                                <option value="liters">Litres</option>
                                <option value="capsules">Capsules</option>
                                <option value="milliliters">Millilitres</option>
                            </select>
                        </div>
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

                {/* Gestion du stock */}
                <div className="form-section">
                    <h2>Gestion du stock</h2>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="initial_stock">Stock initial:</label>
                            <input
                                type="number"
                                id="initial_stock"
                                name="initial_stock"
                                value={formData.initial_stock}
                                onChange={handleInputChange}
                                className="form-control"
                                min="0"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="min_stock_level">Stock minimum:</label>
                            <input
                                type="number"
                                id="min_stock_level"
                                name="min_stock_level"
                                value={formData.min_stock_level}
                                onChange={handleInputChange}
                                className="form-control"
                                min="0"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="max_stock_level">Stock maximum:</label>
                            <input
                                type="number"
                                id="max_stock_level"
                                name="max_stock_level"
                                value={formData.max_stock_level}
                                onChange={handleInputChange}
                                className="form-control"
                                min="0"
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Variants */}
                <div className="form-section">
                    <div className="section-header">
                        <h2>Type *</h2>
                        <button
                            type="button"
                            onClick={autoGenerateSKUs}
                            className="btn btn-info"
                        >
                            Générer les types
                        </button>
                    </div>

                    {formData.variants.map((variant, index) => (
                        <div key={index} className="variant-card">
                            <div className="variant-header">
                                <h4>Type {index + 1}</h4>
                                {formData.variants.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeVariant(index)}
                                        className="btn btn-danger btn-sm"
                                    >
                                        ×
                                    </button>
                                )}
                            </div>

                            <div className="variant-fields">
                                <div className="form-group">
                                    <label>Format:</label>
                                    <select
                                        value={variant.format}
                                        onChange={(e) => handleVariantChange(index, 'format', e.target.value)}
                                        className="form-control"
                                        required
                                    >
                                        <option value="units">Unités</option>
                                        <option value="grams">Grammes</option>
                                        <option value="liters">Litres</option>
                                        <option value="capsules">Capsules</option>
                                        <option value="milliliters">Millilitres</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Quantité *:</label>
                                    <input
                                        type="number"
                                        value={variant.quantity}
                                        onChange={(e) => handleVariantChange(index, 'quantity', e.target.value)}
                                        className="form-control"
                                        step="0.01"
                                        min="0"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Prix *:</label>
                                    <input
                                        type="number"
                                        value={variant.price}
                                        onChange={(e) => handleVariantChange(index, 'price', e.target.value)}
                                        className="form-control"
                                        step="0.01"
                                        min="0"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>ref *:</label>
                                    <input
                                        type="text"
                                        value={variant.sku}
                                        onChange={(e) => handleVariantChange(index, 'sku', e.target.value)}
                                        className="form-control"
                                        required
                                        placeholder="Ex: PROD-01"
                                    />
                                </div>

                                <div className="form-group checkbox-group">
                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={variant.is_active}
                                            onChange={(e) => handleVariantChange(index, 'is_active', e.target.checked)}
                                        />
                                        Type actif
                                    </label>
                                </div>
                            </div>
                        </div>
                    ))}

                    <button
                        type="button"
                        onClick={addVariant}
                        className="btn btn-success"
                    >
                        + Ajouter un variant
                    </button>
                </div>

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
                        {loading ? 'Création...' : 'Créer le produit'}
                    </button>
                </div>
            </form>

            {/* Modal pour création de marque */}
            {showBrandModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h3>Créer une nouvelle marque</h3>

                        <div className="form-group">
                            <label>Nom *:</label>
                            <input
                                type="text"
                                value={newBrand.name}
                                onChange={(e) => setNewBrand(prev => ({ ...prev, name: e.target.value }))}
                                className="form-control"
                                required
                                placeholder="Nom de la marque"
                            />
                        </div>

                        <div className="form-group">
                            <label>Référence *:</label>
                            <input
                                type="text"
                                value={newBrand.reference_number}
                                onChange={(e) => setNewBrand(prev => ({ ...prev, reference_number: e.target.value }))}
                                className="form-control"
                                required
                                placeholder="Référence unique"
                            />
                        </div>

                        <div className="form-group">
                            <label>Description:</label>
                            <textarea
                                value={newBrand.description}
                                onChange={(e) => setNewBrand(prev => ({ ...prev, description: e.target.value }))}
                                className="form-control"
                                rows="3"
                                placeholder="Description de la marque"
                            />
                        </div>

                        <div className="modal-actions">
                            <button
                                type="button"
                                onClick={() => setShowBrandModal(false)}
                                className="btn btn-secondary"
                            >
                                Annuler
                            </button>
                            <button
                                type="button"
                                onClick={() => createBrand(newBrand)}
                                className="btn btn-primary"
                            >
                                Créer la marque
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal pour création de fournisseur */}
            {showSupplierModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h3>Créer un nouveau fournisseur</h3>

                        <div className="form-group">
                            <label>Nom *:</label>
                            <input
                                type="text"
                                value={newSupplier.name}
                                onChange={(e) => setNewSupplier(prev => ({ ...prev, name: e.target.value }))}
                                className="form-control"
                                required
                                placeholder="Nom du fournisseur"
                            />
                        </div>

                        <div className="form-group">
                            <label>Email *:</label>
                            <input
                                type="email"
                                value={newSupplier.contact_email}
                                onChange={(e) => setNewSupplier(prev => ({ ...prev, contact_email: e.target.value }))}
                                className="form-control"
                                required
                                placeholder="email@exemple.com"
                            />
                        </div>

                        <div className="form-group">
                            <label>Téléphone *:</label>
                            <input
                                type="tel"
                                value={newSupplier.contact_phone}
                                onChange={(e) => setNewSupplier(prev => ({ ...prev, contact_phone: e.target.value }))}
                                className="form-control"
                                required
                                placeholder="+33 1 23 45 67 89"
                            />
                        </div>

                        <div className="form-group">
                            <label>Adresse *:</label>
                            <textarea
                                value={newSupplier.address}
                                onChange={(e) => setNewSupplier(prev => ({ ...prev, address: e.target.value }))}
                                className="form-control"
                                rows="3"
                                required
                                placeholder="Adresse complète"
                            />
                        </div>

                        <div className="modal-actions">
                            <button
                                type="button"
                                onClick={() => setShowSupplierModal(false)}
                                className="btn btn-secondary"
                            >
                                Annuler
                            </button>
                            <button
                                type="button"
                                onClick={() => createSupplier(newSupplier)}
                                className="btn btn-primary"
                            >
                                Créer le fournisseur
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}