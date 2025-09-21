<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductVariant extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'format',
        'quantity',
        'price',
        'sku',
        'is_active'
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'quantity' => 'decimal:2',
        'is_active' => 'boolean'
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function getFormattedNameAttribute(): string
    {
        return "{$this->quantity} {$this->format}";
    }

    public function getPricePerUnitAttribute(): float
    {
        return $this->quantity > 0 ? $this->price / $this->quantity : 0;
    }
}
