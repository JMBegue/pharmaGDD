<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSupplierRequest;
use App\Http\Requests\UpdateSupplierRequest;
use App\Http\Resources\SupplierCollection;
use App\Http\Resources\SupplierResource;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class SupplierController extends Controller
{
    public function index()
    {
        $suppliers = Supplier::withCount('brands')->latest()->paginate(20);
        return new SupplierCollection($suppliers);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:suppliers',
            'contact_email' => 'required|email|max:255',
            'contact_phone' => 'required|string|max:20',
            'address' => 'required|string',
            'brands' => 'nullable|array',
            'brands.*' => 'exists:brands,id',
            'supplier_references' => 'nullable|array',
            'supplier_references.*' => 'nullable|string|max:255'
        ]);

        $supplier = Supplier::create($validated);

        if (!empty($validated['brands'])) {
            $brandsData = [];
            foreach ($validated['brands'] as $index => $brandId) {
                $brandsData[$brandId] = [
                    'supplier_reference' => $validated['supplier_references'][$index] ?? null
                ];
            }
            $supplier->brands()->sync($brandsData);
        }

        return new SupplierResource($supplier->load('brands'));
    }

    public function show(Supplier $supplier)
    {
        return new SupplierResource($supplier->load('brands'));
    }

    public function update(Request $request, Supplier $supplier)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:suppliers,name,' . $supplier->id,
            'contact_email' => 'required|email|max:255',
            'contact_phone' => 'required|string|max:20',
            'address' => 'required|string',
            'brands' => 'nullable|array',
            'brands.*' => 'exists:brands,id',
            'supplier_references' => 'nullable|array',
            'supplier_references.*' => 'nullable|string|max:255'
        ]);

        $supplier->update($validated);

        $brandsData = [];
        if (!empty($validated['brands'])) {
            foreach ($validated['brands'] as $index => $brandId) {
                $brandsData[$brandId] = [
                    'supplier_reference' => $validated['supplier_references'][$index] ?? null
                ];
            }
        }
        $supplier->brands()->sync($brandsData);

        return new SupplierResource($supplier->fresh()->load('brands'));
    }

    public function destroy(Supplier $supplier)
    {
        $supplier->brands()->detach();
        $supplier->delete();

        return response()->json(null, Response::HTTP_NO_CONTENT);
    }
}
