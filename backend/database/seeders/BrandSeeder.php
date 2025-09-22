<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Brand;
use App\Models\Supplier;
use Illuminate\Support\Facades\DB;

class BrandSeeder extends Seeder
{
    public function run(): void
    {
        $brands = [
            [
                'name' => 'BioMed Solutions',
                'reference_number' => 'BIO-MED-001',
                'description' => 'Innovative biomedical technology and equipment manufacturer',
            ],
            [
                'name' => 'HealthPlus Pharmaceuticals',
                'reference_number' => 'HP-PHARMA-002',
                'description' => 'Leading manufacturer of high-quality pharmaceutical products',
            ],
            [
                'name' => 'PureCare Medical',
                'reference_number' => 'PURE-CARE-003',
                'description' => 'Premium medical supplies and healthcare products',
            ],
            [
                'name' => 'MediQuality Labs',
                'reference_number' => 'MEDI-QUAL-004',
                'description' => 'Quality healthcare products and laboratory equipment',
            ],
            [
                'name' => 'PharmaTech Innovations',
                'reference_number' => 'PHARMA-TECH-005',
                'description' => 'Advanced pharmaceutical research and development',
            ]
        ];

        $suppliers = Supplier::all();

        if ($suppliers->isEmpty()) {
            $this->command->warn('Aucun fournisseur trouvé. Les marques seront créées sans fournisseurs.');
        }

        foreach ($brands as $brandData) {
            $brand = Brand::create($brandData);

            if (!$suppliers->isEmpty()) {
                // Associer 1 à 3 fournisseurs aléatoires
                $randomSuppliers = $suppliers->random(rand(1, 3));

                $pivotData = [];
                foreach ($randomSuppliers as $supplier) {
                    $pivotData[$supplier->id] = [
                        'supplier_reference' => $this->generateReference($brand, $supplier),
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                }

                $brand->suppliers()->attach($pivotData);
            }
        }

        $this->command->info(count($brands) . ' marques créées avec succès.');
    }

    protected function generateReference($brand, $supplier): string
    {
        $brandCode = strtoupper(substr(preg_replace('/[^A-Za-z]/', '', $brand->name), 0, 3));
        $supplierCode = strtoupper(substr(preg_replace('/[^A-Za-z]/', '', $supplier->name), 0, 2));

        return $supplierCode . '-' . $brandCode . '-' . date('Y');
    }
}
