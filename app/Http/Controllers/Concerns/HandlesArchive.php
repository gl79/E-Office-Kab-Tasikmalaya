<?php

namespace App\Http\Controllers\Concerns;

use App\Support\CacheHelper;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Trait for controllers that manage archive (soft-deleted) resources.
 * Provides a reusable DB transaction wrapper with cache flush and redirect.
 */
trait HandlesArchive
{
    /**
     * Run archive operations (restore/force-delete) inside a transaction.
     *
     * @param callable(): string $callback Returns a success message string
     * @param string[] $cacheTags Cache tag groups to flush on success
     * @param string $errorPrefix Prefix for the error message on failure
     */
    protected function archiveTransaction(
        callable $callback,
        array $cacheTags,
        string $errorPrefix = 'Operasi gagal'
    ): RedirectResponse {
        DB::beginTransaction();
        try {
            $message = $callback();
            DB::commit();

            CacheHelper::flush($cacheTags);

            return redirect()->back()->with('success', $message);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error($errorPrefix, [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return redirect()->back()->with('error', $errorPrefix . '. Silakan coba lagi atau hubungi administrator.');
        }
    }
}
