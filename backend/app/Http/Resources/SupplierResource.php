<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SupplierResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'contact_email' => $this->contact_email,
            'contact_phone' => $this->contact_phone,
            'address' => $this->address,
            'brands_count' => $this->whenCounted('brands'),
            'brands' => BrandResource::collection($this->whenLoaded('brands')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
