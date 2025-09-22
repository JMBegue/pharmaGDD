"use client"

import { useState } from "react"
import { useProducts } from "App/hooks/useProducts"
import { useRouter } from "next/navigation"
import { adminLogout } from "App/server/adminAuth"
import "App/styles/dashboard.scss"

// Icônes SVG
const EditIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
        <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
    </svg>
)

const DeleteIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
        <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
        <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
    </svg>
)

const ExpandIcon = ({ isExpanded }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        fill="currentColor"
        viewBox="0 0 16 16"
        style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
    >
        <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/>
    </svg>
)

export default function AdminDashboard() {
    const [expandedProducts, setExpandedProducts] = useState({})
    const router = useRouter()

    const {
        products,
        loading,
        error,
        page,
        setPage,
        totalPages,
        refreshProducts,
        deleteProduct,
    } = useProducts({ limit: 5 })

    // S'assurer que products est toujours un tableau
    const safeProducts = Array.isArray(products) ? products : []

    // Calculer les statistiques de manière sécurisée
    const activeProductsCount = safeProducts.filter((p) => p.status === "active").length
    const inStockProductsCount = safeProducts.filter((p) => p.stock > 0).length

    const toggleExpand = (productId) => {
        setExpandedProducts(prev => ({
            ...prev,
            [productId]: !prev[productId]
        }))
    }

    const handleDelete = async (productId) => {
        if (!confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) return
        try {
            await deleteProduct(productId)
        } catch (error) {
            alert(error.message)
        }
    }

    const handleVariantDelete = async (variantId, productId) => {
        if (!confirm("Êtes-vous sûr de vouloir supprimer ce variant ?")) return
        try {
            // Implémentez la suppression du variant ici
            console.log("Supprimer variant:", variantId)
            // await deleteVariant(variantId)
        } catch (error) {
            alert(error.message)
        }
    }

    const handleSignOut = async () => {
        await adminLogout()
        window.location.href = "/admin"
    }

    return (
        <div className="dashboard-container">
            {/* Header */}
            <header className="dashboard-header">
                <h1>Dashboard Administrateur</h1>
                <button onClick={handleSignOut} className="btn btn-danger">
                    Déconnexion
                </button>
            </header>

            {/* Stats */}
            <div className="stats-grid">
                <div className="stat-card">
                    <h3>Total des produits</h3>
                    <p>{safeProducts.length}</p>
                </div>
                <div className="stat-card">
                    <h3>Produits actifs</h3>
                    <p>{activeProductsCount}</p>
                </div>
                <div className="stat-card">
                    <h3>Produits en stock</h3>
                    <p>{inStockProductsCount}</p>
                </div>
                <div className="stat-card">
                    <h3>Total variants</h3>
                    <p>{safeProducts.reduce((total, product) => total + (product.variants?.length || 0), 0)}</p>
                </div>
            </div>

            {/* Actions */}
            <div className="actions-row">
                <a href="/admin/product/create" className="btn btn-primary">
                    Ajouter un produit
                </a>
                <button
                    onClick={refreshProducts}
                    className="btn btn-secondary"
                    disabled={loading}
                >
                    {loading ? "Chargement..." : "Actualiser"}
                </button>
            </div>

            {/* Produits */}
            {error && <div className="alert alert-error">Erreur: {error}</div>}

            <div className="table-wrapper">
                <table className="table">
                    <thead>
                    <tr>
                        <th style={{ width: '40px' }}></th>
                        <th>Nom</th>
                        <th>Marque</th>
                        <th>Prix de base</th>
                        <th>Stock</th>
                        <th>Statut</th>
                        <th>Variants</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {safeProducts.map((product) => (
                        <>
                            {/* Ligne principale du produit */}
                            <tr key={product.id} className="product-row">
                                <td>
                                    <button
                                        onClick={() => toggleExpand(product.id)}
                                        className="btn-icon"
                                        title={expandedProducts[product.id] ? "Réduire" : "Développer"}
                                    >
                                        <ExpandIcon isExpanded={expandedProducts[product.id]} />
                                    </button>
                                </td>
                                <td>
                                    <div className="product-name">{product.name}</div>
                                    {product.subtitle && (
                                        <div className="product-subtitle muted">{product.subtitle}</div>
                                    )}
                                </td>
                                <td>{product.brand?.name}</td>
                                <td>{product.base_price} €</td>
                                <td>
                                    <span className={`stock-indicator ${product.inventory?.stock_status}`}>
                                        {product.inventory?.quantity}
                                    </span>
                                </td>
                                <td>
                                    <span className={`badge ${product.is_active ? "badge-success" : "badge-secondary"}`}>
                                        {product.is_active ? "Actif" : "Inactif"}
                                    </span>
                                </td>
                                <td>
                                    <span className="variant-count">
                                        {product.variants?.length || 0} types(s)
                                    </span>
                                </td>
                                <td>
                                    <div className="action-buttons">
                                        <button
                                            onClick={() => router.push(`/admin/product/${product.id}/edit`)}
                                            className="btn-icon btn-edit"
                                            title="Modifier le produit"
                                        >
                                            <EditIcon />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(product.id)}
                                            className="btn-icon btn-delete"
                                            title="Supprimer le produit"
                                        >
                                            <DeleteIcon />
                                        </button>
                                    </div>
                                </td>
                            </tr>

                            {/* Ligne des variants (expandable) */}
                            {expandedProducts[product.id] && product.variants && product.variants.length > 0 && (
                                <tr className="variant-row">
                                    <td colSpan="8">
                                        <div className="variants-container">
                                            <h4>Types du produit</h4>
                                            <table className="variants-table">
                                                <thead>
                                                <tr>
                                                    <th>SKU</th>
                                                    <th>Format</th>
                                                    <th>Quantité</th>
                                                    <th>Prix</th>
                                                    <th>Prix/unité</th>
                                                    <th>Statut</th>
                                                    <th>Actions</th>
                                                </tr>
                                                </thead>
                                                <tbody>
                                                {product.variants.map((variant) => (
                                                    <tr key={variant.id}>
                                                        <td>{variant.sku}</td>
                                                        <td>{variant.format}</td>
                                                        <td>{variant.quantity}</td>
                                                        <td>{variant.price} €</td>
                                                        <td>{variant.price_per_unit?.toFixed(2)} €</td>
                                                        <td>
                                                            <span className={`badge ${variant.is_active ? "badge-success" : "badge-secondary"}`}>
                                                                {variant.is_active ? "Actif" : "Inactif"}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <div className="action-buttons">
                                                                <button
                                                                    onClick={() => router.push(`/admin/product/${product.id}/edit?variant=${variant.id}`)}
                                                                    className="btn-icon btn-edit btn-sm"
                                                                    title="Modifier le variant"
                                                                >
                                                                    <EditIcon />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleVariantDelete(variant.id, product.id)}
                                                                    className="btn-icon btn-delete btn-sm"
                                                                    title="Supprimer le variant"
                                                                >
                                                                    <DeleteIcon />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </>
                    ))}
                    {safeProducts.length === 0 && (
                        <tr>
                            <td colSpan="8" className="muted text-center">
                                Aucun produit trouvé
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="pagination">
                <button
                    className="page-btn"
                    onClick={() => setPage(page - 1)}
                    disabled={page <= 1}
                >
                    ◀
                </button>
                {[...Array(totalPages)].map((_, idx) => (
                    <button
                        key={idx}
                        className={`page-btn ${page === idx + 1 ? "active" : ""}`}
                        onClick={() => setPage(idx + 1)}
                    >
                        {idx + 1}
                    </button>
                ))}
                <button
                    className="page-btn"
                    onClick={() => setPage(page + 1)}
                    disabled={page >= totalPages}
                >
                    ▶
                </button>
            </div>
        </div>
    )
}