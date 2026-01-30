<?php

namespace App\Providers;

use App\Models\IndeksSurat;
use App\Models\UnitKerja;
use App\Models\WilayahDesa;
use App\Models\WilayahKabupaten;
use App\Models\WilayahKecamatan;
use App\Models\WilayahProvinsi;
use App\Policies\IndeksSuratPolicy;
use App\Policies\UnitKerjaPolicy;
use App\Policies\WilayahDesaPolicy;
use App\Policies\WilayahKabupatenPolicy;
use App\Policies\WilayahKecamatanPolicy;
use App\Policies\WilayahProvinsiPolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        $this->registerPolicies();
    }

    /**
     * Register the authorization policies.
     */
    protected function registerPolicies(): void
    {
        Gate::policy(UnitKerja::class, UnitKerjaPolicy::class);
        Gate::policy(IndeksSurat::class, IndeksSuratPolicy::class);
        Gate::policy(WilayahProvinsi::class, WilayahProvinsiPolicy::class);
        Gate::policy(WilayahKabupaten::class, WilayahKabupatenPolicy::class);
        Gate::policy(WilayahKecamatan::class, WilayahKecamatanPolicy::class);
        Gate::policy(WilayahDesa::class, WilayahDesaPolicy::class);
    }
}
