<?php


namespace Database\Factories;

use App\Models\Brand;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProductFactory extends Factory
{
    protected $model = Product::class;

    public function definition(): array
    {
        $formats = array_keys(Product::FORMATS);

        return [
            'name' => $this->faker->words(3, true),
            'subtitle' => $this->faker->sentence(),
            'description' => $this->faker->paragraphs(3, true),
            'brand_id' => Brand::factory(),
            'format' => $this->faker->randomElement($formats),
            'base_price' => $this->faker->randomFloat(2, 5, 500),
            'is_active' => $this->faker->boolean(90)
        ];
    }
}
