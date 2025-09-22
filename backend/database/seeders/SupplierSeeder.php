<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Supplier;
use App\Models\Brand;

class SupplierSeeder extends Seeder
{
    public function run()
    {
        $suppliers = [
            [
                'name' => 'MediSupply Inc.',
                'contact_email' => 'orders@medisupply.com',
                'contact_phone' => '+1-800-MED-SUPPLY',
                'address' => '123 Medical Drive, Healthcare City, HC 12345',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'PharmaDistrib',
                'contact_email' => 'contact@pharmadistrib.com',
                'contact_phone' => '+1-800-PHARMA-D',
                'address' => '456 Pharmacy Avenue, Medtown, MT 67890',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'BioTech Solutions',
                'contact_email' => 'info@biotechsolutions.com',
                'contact_phone' => '+1-800-BIO-TECH',
                'address' => '789 Innovation Road, Sciencetown, ST 11223',
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ];

        foreach ($suppliers as $supplier) {
            Supplier::create($supplier);
        }

    }
}
