<?php

namespace App\Providers;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        if (
            strtolower($this->app->environment()) !== 'production' &&
            !empty($providers = config('app.providers-dev'))
        ) {
            foreach ($providers as $provider) {
                $this->app->register($provider);

            }
        }
    }
    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        if (config('app.env') === "development" && config("app.logs")) {
            DB::listen(function ($query) {
                if (strpos($query->sql, "jobs") !== false) {
                    return;
                }
                File::append(
                    storage_path('/logs/query.log'),
                    $query->sql . ' [' . implode(', ', $query->bindings) . '] (' . $query->time . ')' . PHP_EOL
                );
            });
        }
    }
}
