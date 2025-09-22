<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\AdminAuthController;
use App\Http\Controllers\BrandController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\SupplierController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Public routes for users
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});

// Public routes for admins
Route::prefix('admin/auth')->group(function () {
    Route::post('/register', [AdminAuthController::class, 'register']);
    Route::post('/login', [AdminAuthController::class, 'login']);
    Route::get('/roles', [AdminAuthController::class, 'getRoles']);
});

// Protected routes for users
Route::middleware(['auth:sanctum', 'role.user'])->prefix('auth')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/refresh', [AuthController::class, 'refresh']);
});

// Protected routes for admins
Route::middleware(['auth:sanctum', 'role.admin'])->prefix('admin/auth')->group(function () {
    Route::post('/logout', [AdminAuthController::class, 'logout']);
    Route::get('/me', [AdminAuthController::class, 'me']);
    Route::post('/refresh', [AdminAuthController::class, 'refresh']);
});

// Test routes for authenticated users
Route::middleware(['auth:sanctum', 'role.user'])->group(function () {
    Route::get('/user/dashboard', function () {
        return response()->json([
            'message' => 'Welcome to user dashboard',
            'user' => auth()->user()
        ]);
    });
});

// Test routes for authenticated admins
Route::middleware(['auth:sanctum', 'role.admin'])->group(function () {
    Route::get('/admin/dashboard', function () {
        return response()->json([
            'message' => 'Welcome to admin dashboard',
            'admin' => auth()->user()->load('role')
        ]);
    });
});
// Public routes for supplier
Route::prefix('supplier')->group(function () {
    Route::post('/create', [SupplierController::class, 'store']);
    Route::put('/update', [SupplierController::class, 'update']);
});
// Public routes for brand
Route::prefix('brand')->group(function () {
    Route::post('/create', [BrandController::class, 'store']);
    Route::put('/update', [BrandController::class, 'update']);
});

// Public routes for suppliers
Route::prefix('suppliers')->group(function () {
    Route::get('/', [SupplierController::class, 'index']);
    Route::get('/{id}', [SupplierController::class, 'show']);
    Route::post('/create', [SupplierController::class, 'store']);
    Route::patch('/update', [SupplierController::class, 'update']);
});
// Public routes for suppliers
Route::prefix('brands')->group(function () {
    Route::get('/', [BrandController::class, 'index']);
    Route::get('/{id}', [BrandController::class, 'show']);
    Route::post('/create', [BrandController::class, 'store']);
    Route::patch('/update', [BrandController::class, 'update']);
});

// Protected routes for admins products
Route::middleware(['auth:sanctum', 'role.admin'])->prefix('product')->group(function () {
    Route::post('/create', [ProductController::class, 'store']);
    Route::patch('/update', [ProductController::class, 'update']);
});
// Additional image management routes
Route::prefix('products/{product}')->group(function () {
    Route::get('/', [ProductController::class, 'show']);
    Route::post('/images/order', [ProductController::class, 'updateImageOrder'])
        ->name('products.images.order');

    Route::post('/images/{image}/default', [ProductController::class, 'setDefaultImage'])
        ->name('products.images.default');

    Route::delete('/images/{image}', [ProductController::class, 'deleteImage'])
        ->name('products.images.delete');
});

Route::get('products', [ProductController::class, 'index']);

