<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductImage extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'image_path',
        'is_default',
        'order'
    ];

    protected $casts = [
        'is_default' => 'boolean'
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    protected static function booted()
    {
        static::creating(function ($image) {
            if ($image->is_default) {
                // Remove default flag from other images of the same product
                static::where('product_id', $image->product_id)
                    ->where('is_default', true)
                    ->update(['is_default' => false]);
            }
        });

        static::updating(function ($image) {
            if ($image->is_default) {
                // Remove default flag from other images of the same product
                static::where('product_id', $image->product_id)
                    ->where('id', '!=', $image->id)
                    ->where('is_default', true)
                    ->update(['is_default' => false]);
            }
        });
    }
}
