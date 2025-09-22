<?php

namespace Database\Seeders;

use App\Models\Brand;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class MedicalProductSeeder extends Seeder
{
    public function run(): void
    {
        // Vérifier et récupérer les marques nécessaires
        $bioMedBrand = Brand::where('name', 'like', '%BioMed%')->first();
        $healthPlusBrand = Brand::where('name', 'like', '%HealthPlus%')->first();
        $pureCareBrand = Brand::where('name', 'like', '%PureCare%')->first();
        $mediQualityBrand = Brand::where('name', 'like', '%MediQuality%')->first();

        // Vérifier que toutes les marques nécessaires existent
        if (!$bioMedBrand || !$healthPlusBrand || !$pureCareBrand || !$mediQualityBrand) {
            $this->command->error('Certaines marques nécessaires sont manquantes. Veuillez exécuter BrandSeeder d\'abord.');
            return;
        }

        $medicalProducts = [
            [
                'name' => 'Sterile Saline Solution',
                'subtitle' => 'Medical-grade sterile saline for wound care',
                'description' => '0.9% Sodium Chloride Irrigation USP. Sterile, non-pyrogenic solution for wound cleaning and medical procedures.',
                'brand_id' => $bioMedBrand->id,
                'format' => 'milliliters',
                'base_price' => 4.99,
                'is_active' => true,
            ],
            [
                'name' => 'Advanced Blood Pressure Monitor',
                'subtitle' => 'Professional digital BP monitor with detection',
                'description' => 'FDA-approved digital blood pressure monitor with advanced accuracy and memory storage.',
                'brand_id' => $bioMedBrand->id,
                'format' => 'units',
                'base_price' => 89.99,
                'is_active' => true,
            ],
            [
                'name' => 'Vitamin D3 5000 IU Softgels',
                'subtitle' => 'High-potency Vitamin D3 supplements',
                'description' => 'Premium Vitamin D3 5000 IU softgels for immune support and bone health.',
                'brand_id' => $healthPlusBrand->id,
                'format' => 'capsules',
                'base_price' => 19.99,
                'is_active' => true,
            ],
            [
                'name' => 'Surgical Face Masks',
                'subtitle' => 'Disposable 3-ply medical masks',
                'description' => 'High-quality 3-ply surgical masks with ear loops for medical use.',
                'brand_id' => $pureCareBrand->id,
                'format' => 'units',
                'base_price' => 12.99,
                'is_active' => true,
            ],
            [
                'name' => 'Digital Thermometer',
                'subtitle' => 'Fast and accurate body thermometer',
                'description' => 'Digital thermometer with quick reading and fever alert feature.',
                'brand_id' => $mediQualityBrand->id,
                'format' => 'units',
                'base_price' => 24.99,
                'is_active' => true,
            ]
        ];

        foreach ($medicalProducts as $productData) {
            $product = Product::create($productData);

            // Créer l'inventaire
            DB::table('inventories')->insert([
                'product_id' => $product->id,
                'quantity' => rand(100, 1000),
                'min_stock_level' => rand(20, 100),
                'max_stock_level' => rand(500, 2000),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Créer les variants spécifiques
            $this->createProductVariants($product);
        }

        $this->command->info('5 produits médicaux créés avec variants spécifiques.');
    }

    protected function createProductVariants(Product $product): void
    {
        $variantsMap = [
            'Sterile Saline Solution' => [
                ['format' => 'milliliters', 'quantity' => 100, 'price' => 4.99],
                ['format' => 'milliliters', 'quantity' => 250, 'price' => 8.99],
                ['format' => 'milliliters', 'quantity' => 500, 'price' => 14.99],
                ['format' => 'liters', 'quantity' => 1, 'price' => 24.99],
            ],
            'Advanced Blood Pressure Monitor' => [
                ['format' => 'units', 'quantity' => 1, 'price' => 89.99],
                ['format' => 'units', 'quantity' => 1, 'price' => 129.99],
            ],
            'Vitamin D3 5000 IU Softgels' => [
                ['format' => 'capsules', 'quantity' => 60, 'price' => 19.99],
                ['format' => 'capsules', 'quantity' => 120, 'price' => 34.99],
                ['format' => 'capsules', 'quantity' => 180, 'price' => 47.99],
            ],
            'Surgical Face Masks' => [
                ['format' => 'units', 'quantity' => 50, 'price' => 12.99],
                ['format' => 'units', 'quantity' => 100, 'price' => 22.99],
                ['format' => 'units', 'quantity' => 200, 'price' => 39.99],
            ],
            'Digital Thermometer' => [
                ['format' => 'units', 'quantity' => 1, 'price' => 24.99],
                ['format' => 'units', 'quantity' => 2, 'price' => 44.99],
            ]
        ];

        $variants = $variantsMap[$product->name] ?? [];

        foreach ($variants as $index => $variantData) {
            ProductVariant::create([
                'product_id' => $product->id,
                'format' => $variantData['format'],
                'quantity' => $variantData['quantity'],
                'price' => $variantData['price'],
                'sku' => $this->generateMedicalSKU($product, $index),
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    protected function generateMedicalSKU(Product $product, int $index): string
    {
        $brandCode = strtoupper(substr(preg_replace('/[^A-Za-z]/', '', $product->brand->name), 0, 3));
        $productCode = strtoupper(substr(preg_replace('/[^A-Za-z]/', '', $product->name), 0, 3));

        return $brandCode . '-' . $productCode . '-' . sprintf('%02d', $index + 1);
    }
}
