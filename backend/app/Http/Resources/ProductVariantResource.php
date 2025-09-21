<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductVariantResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'format' => $this->format,
            'quantity' => (float) $this->quantity,
            'price' => (float) $this->price,
            'price_per_unit' => (float) $this->price_per_unit,
            'sku' => $this->sku,
            'is_active' => $this->is_active,
            'formatted_name' => $this->formatted_name,
            'product' => new ProductResource($this->whenLoaded('product')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
