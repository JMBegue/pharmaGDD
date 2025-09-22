<?php

namespace Database\Factories;

use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProductVariantFactory extends Factory
{
    protected $model = \App\Models\ProductVariant::class;

    public function definition(): array
    {
        $formats = ['grams', 'liters', 'capsules', 'milliliters', 'units'];
        $quantities = [100, 250, 500, 750, 1000];

        return [
            'product_id' => Product::inRandomOrder()->first()->id,
            'format' => $this->faker->randomElement($formats),
            'quantity' => $this->faker->randomElement($quantities),
            'price' => $this->faker->randomFloat(2, 10, 1000),
            'sku' => $this->faker->unique()->regexify('[A-Z]{3}-[0-9]{3}-[A-Z0-9]{3}'),
            'is_active' => $this->faker->boolean(95),
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }
}
