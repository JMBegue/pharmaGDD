<?php

namespace App\Http\Controllers;

use App\Http\Resources\InventoryResource;
use App\Http\Resources\ProductCollection;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Models\Brand;
use App\Models\ProductImage;
use App\Models\Inventory;
use App\Models\ProductVariant;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;


class ProductController extends Controller
{
    public function index()
    {
        $products = Product::with(['brand', 'images', 'inventory', 'variants'])
            ->active()
            ->latest()
            ->paginate(20);

        return new ProductCollection($products);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'subtitle' => 'nullable|string|max:255',
            'description' => 'required|string',
            'brand_id' => 'required|exists:brands,id',
            'format' => 'required|in:grams,liters,capsules,milliliters,units',
            'base_price' => 'required|numeric|min:0',
            'initial_stock' => 'required|integer|min:0',
            'min_stock_level' => 'required|integer|min:0',
            'max_stock_level' => 'required|integer|min:0',
            'is_active' => 'boolean',
            'images' => 'nullable|array',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif|max:2048',
            'variants' => 'nullable|array',
            'variants.*.format' => 'required|in:grams,liters,capsules,milliliters,units',
            'variants.*.quantity' => 'required|numeric|min:0',
            'variants.*.price' => 'required|numeric|min:0',
            'variants.*.sku' => 'nullable|string|max:100',
            'variants.*.is_active' => 'boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $validated = $validator->validated();

        $product = Product::create([
            'name' => $validated['name'],
            'subtitle' => $validated['subtitle'] ?? null,
            'description' => $validated['description'],
            'brand_id' => $validated['brand_id'],
            'format' => $validated['format'],
            'base_price' => $validated['base_price'],
            'is_active' => $validated['is_active'] ?? true,
        ]);

        // Create inventory
        $product->inventory()->create([
            'quantity' => $validated['initial_stock'],
            'min_stock_level' => $validated['min_stock_level'],
            'max_stock_level' => $validated['max_stock_level']
        ]);

        // Handle images
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $index => $image) {
                $imagePath = $image->store('products', 'public');

                $product->images()->create([
                    'image_path' => $imagePath,
                    'is_default' => $index === 0,
                    'order' => $index
                ]);
            }
        }

        // Handle variants
        if (!empty($validated['variants'])) {
            foreach ($validated['variants'] as $variantData) {
                $product->variants()->create([
                    'format' => $variantData['format'],
                    'quantity' => $variantData['quantity'],
                    'price' => $variantData['price'],
                    'sku' => $variantData['sku'] ?? null,
                    'is_active' => $variantData['is_active'] ?? true,
                ]);
            }
        }

        return new ProductResource($product->load(['brand', 'images', 'inventory', 'variants']));
    }

    public function show(Product $product)
    {
        return new ProductResource($product->load(['brand', 'images', 'inventory', 'variants']));
    }

    public function update(Request $request, Product $product)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'subtitle' => 'nullable|string|max:255',
            'description' => 'required|string',
            'brand_id' => 'required|exists:brands,id',
            'format' => 'required|in:grams,liters,capsules,milliliters,units',
            'base_price' => 'required|numeric|min:0',
            'min_stock_level' => 'required|integer|min:0',
            'max_stock_level' => 'required|integer|min:0',
            'is_active' => 'boolean',
            'new_images' => 'nullable|array',
            'new_images.*' => 'image|mimes:jpeg,png,jpg,gif|max:2048',
            'variants' => 'nullable|array',
            'variants.*.id' => 'nullable|exists:product_variants,id',
            'variants.*.format' => 'required|in:grams,liters,capsules,milliliters,units',
            'variants.*.quantity' => 'required|numeric|min:0',
            'variants.*.price' => 'required|numeric|min:0',
            'variants.*.sku' => 'nullable|string|max:100',
            'variants.*.is_active' => 'boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $validated = $validator->validated();

        $product->update([
            'name' => $validated['name'],
            'subtitle' => $validated['subtitle'] ?? null,
            'description' => $validated['description'],
            'brand_id' => $validated['brand_id'],
            'format' => $validated['format'],
            'base_price' => $validated['base_price'],
            'is_active' => $validated['is_active'] ?? $product->is_active,
        ]);

        // Update inventory levels
        $product->inventory()->update([
            'min_stock_level' => $validated['min_stock_level'],
            'max_stock_level' => $validated['max_stock_level']
        ]);

        // Handle new images
        if ($request->hasFile('new_images')) {
            $currentMaxOrder = $product->images()->max('order') ?? -1;

            foreach ($request->file('new_images') as $index => $image) {
                $imagePath = $image->store('products', 'public');

                $product->images()->create([
                    'image_path' => $imagePath,
                    'is_default' => false,
                    'order' => $currentMaxOrder + $index + 1
                ]);
            }
        }

        // Handle variants
        if (!empty($validated['variants'])) {
            $existingVariantIds = [];

            foreach ($validated['variants'] as $variantData) {
                if (isset($variantData['id'])) {
                    $variant = $product->variants()->find($variantData['id']);
                    if ($variant) {
                        $variant->update([
                            'format' => $variantData['format'],
                            'quantity' => $variantData['quantity'],
                            'price' => $variantData['price'],
                            'sku' => $variantData['sku'] ?? $variant->sku,
                            'is_active' => $variantData['is_active'] ?? $variant->is_active,
                        ]);
                        $existingVariantIds[] = $variantData['id'];
                    }
                } else {
                    $variant = $product->variants()->create([
                        'format' => $variantData['format'],
                        'quantity' => $variantData['quantity'],
                        'price' => $variantData['price'],
                        'sku' => $variantData['sku'] ?? null,
                        'is_active' => $variantData['is_active'] ?? true,
                    ]);
                    $existingVariantIds[] = $variant->id;
                }
            }

            // Delete variants that were removed
            $product->variants()->whereNotIn('id', $existingVariantIds)->delete();
        }

        return new ProductResource($product->fresh()->load(['brand', 'images', 'inventory', 'variants']));
    }

    public function destroy(Product $product)
    {
        // Delete images from storage
        foreach ($product->images as $image) {
            Storage::disk('public')->delete($image->image_path);
        }

        $product->delete();

        return response()->json(null, Response::HTTP_NO_CONTENT);
    }

    public function updateStock(Request $request, Product $product)
    {
        $validated = $request->validate([
            'quantity' => 'required|integer|min:0',
            'operation' => 'sometimes|in:add,subtract,set'
        ]);

        $inventory = $product->inventory;

        switch ($validated['operation'] ?? 'set') {
            case 'add':
                $inventory->quantity += $validated['quantity'];
                break;
            case 'subtract':
                $inventory->quantity = max(0, $inventory->quantity - $validated['quantity']);
                break;
            case 'set':
            default:
                $inventory->quantity = $validated['quantity'];
                break;
        }

        $inventory->save();

        return new InventoryResource($inventory->fresh());
    }
}
