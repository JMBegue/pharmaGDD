<?php

namespace Database\Seeders;

use App\Models\Admin;
use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Call our new seeders
        $this->call([
            RolePermissionSeeder::class,
            UserSeeder::class,
            SupplierSeeder::class,
            BrandSeeder::class,
            ProductSeeder::class,
            MedicalProductSeeder::class,
        ]);
    }
}
