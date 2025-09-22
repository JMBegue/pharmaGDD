<?php

namespace Database\Seeders;

use App\Models\Brand;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        // Vérifier qu'il y a des marques
        if (Brand::count() === 0) {
            $this->command->warn('Aucune marque trouvée. Veuillez d\'abord exécuter BrandSeeder.');
            return;
        }

        // Créer 20 produits
        $products = Product::factory()->count(20)->create();

        foreach ($products as $product) {
            // Créer l'inventaire pour chaque produit
            DB::table('inventories')->insert([
                'product_id' => $product->id,
                'quantity' => rand(0, 1000),
                'min_stock_level' => rand(10, 50),
                'max_stock_level' => rand(500, 2000),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Créer 2 à 5 variants par produit
            $variantCount = rand(2, 5);

            for ($i = 0; $i < $variantCount; $i++) {
                ProductVariant::create([
                    'product_id' => $product->id,
                    'format' => $this->getRandomFormat(),
                    'quantity' => $this->getRandomQuantity(),
                    'price' => $this->calculateVariantPrice($product->base_price),
                    'sku' => $this->generateSKU($product, $i),
                    'is_active' => true,
                ]);
            }
        }

        $this->command->info('20 produits créés avec inventaire et variants.');
    }

    protected function getRandomFormat(): string
    {
        $formats = ['grams', 'liters', 'capsules', 'milliliters', 'units'];
        return $formats[array_rand($formats)];
    }

    protected function getRandomQuantity(): float
    {
        $quantities = [50, 100, 250, 500, 750, 1000, 1500, 2000];
        return $quantities[array_rand($quantities)];
    }

    protected function calculateVariantPrice(float $basePrice): float
    {
        // Prix variant entre 80% et 120% du prix de base
        $variation = rand(80, 120) / 100;
        return round($basePrice * $variation, 2);
    }

    protected function generateSKU($product, $index): string
    {
        $brandCode = strtoupper(substr(preg_replace('/[^A-Za-z]/', '', $product->brand->name), 0, 3));
        $productCode = strtoupper(substr(preg_replace('/[^A-Za-z]/', '', $product->name), 0, 3));

        return $brandCode . '-' . $productCode . '-' . sprintf('%03d', $index + 1);
    }
}
