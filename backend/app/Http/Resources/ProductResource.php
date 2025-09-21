<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'subtitle' => $this->subtitle,
            'description' => $this->description,
            'format' => $this->format,
            'base_price' => (float) $this->base_price,
            'is_active' => $this->is_active,
            'current_stock' => $this->when($this->relationLoaded('inventory'), fn() => $this->current_stock),
            'main_image' => $this->when($this->relationLoaded('images'), fn() => $this->main_image),
            'brand' => new BrandResource($this->whenLoaded('brand')),
            'images' => ProductImageResource::collection($this->whenLoaded('images')),
            'inventory' => new InventoryResource($this->whenLoaded('inventory')),
            'variants' => ProductVariantResource::collection($this->whenLoaded('variants')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
