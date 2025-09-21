<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreBrandRequest;
use App\Http\Requests\UpdateBrandRequest;
use App\Http\Resources\BrandCollection;
use App\Http\Resources\BrandResource;
use App\Models\Brand;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class BrandController extends Controller
{
    public function index()
    {
        $brands = Brand::withCount('products')->latest()->paginate(20);
        return new BrandCollection($brands);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:brands',
            'reference_number' => 'required|string|max:100|unique:brands',
            'description' => 'nullable|string',
            'suppliers' => 'nullable|array',
            'suppliers.*' => 'exists:suppliers,id',
            'supplier_references' => 'nullable|array',
            'supplier_references.*' => 'nullable|string|max:255'
        ]);

        $brand = Brand::create($validated);

        if (!empty($validated['suppliers'])) {
            $suppliersData = [];
            foreach ($validated['suppliers'] as $index => $supplierId) {
                $suppliersData[$supplierId] = [
                    'supplier_reference' => $validated['supplier_references'][$index] ?? null
                ];
            }
            $brand->suppliers()->sync($suppliersData);
        }

        return new BrandResource($brand->load('suppliers'));
    }

    public function show(Brand $brand)
    {
        return new BrandResource($brand->load(['products', 'suppliers']));
    }

    public function update(Request $request, Brand $brand)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:brands,name,' . $brand->id,
            'reference_number' => 'required|string|max:100|unique:brands,reference_number,' . $brand->id,
            'description' => 'nullable|string',
            'suppliers' => 'nullable|array',
            'suppliers.*' => 'exists:suppliers,id',
            'supplier_references' => 'nullable|array',
            'supplier_references.*' => 'nullable|string|max:255'
        ]);

        $brand->update($validated);

        $suppliersData = [];
        if (!empty($validated['suppliers'])) {
            foreach ($validated['suppliers'] as $index => $supplierId) {
                $suppliersData[$supplierId] = [
                    'supplier_reference' => $validated['supplier_references'][$index] ?? null
                ];
            }
        }
        $brand->suppliers()->sync($suppliersData);

        return new BrandResource($brand->fresh()->load('suppliers'));
    }

    public function destroy(Brand $brand)
    {
        if ($brand->products()->count() > 0) {
            return response()->json([
                'message' => 'Cannot delete brand with associated products.'
            ], Response::HTTP_CONFLICT);
        }

        $brand->suppliers()->detach();
        $brand->delete();

        return response()->json(null, Response::HTTP_NO_CONTENT);
    }
}
