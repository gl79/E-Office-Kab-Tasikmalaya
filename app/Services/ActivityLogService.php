<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\ActivityLog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

/**
 * Activity logging service with proper DI.
 *
 * Usage:
 *   - Inject via constructor: __construct(private readonly ActivityLogService $logger)
 *   - Or resolve from container: app(ActivityLogService::class)->logCreate($model)
 */
final class ActivityLogService
{
    public function __construct(
        private readonly Request $request
    ) {}

    /**
     * Log an activity.
     */
    public function log(
        string $action,
        string $description,
        ?Model $model = null,
        array $properties = []
    ): ActivityLog {
        return ActivityLog::create([
            'user_id' => Auth::id(),
            'action' => $action,
            'model_type' => $model ? get_class($model) : null,
            'model_id' => $model?->getKey(),
            'description' => $description,
            'ip_address' => $this->getClientIp(),
            'user_agent' => $this->request->userAgent(),
            'properties' => !empty($properties) ? $properties : null,
            'created_at' => now(),
        ]);
    }

    /**
     * Log a login event.
     */
    public function logLogin(mixed $user): ActivityLog
    {
        return $this->log(
            ActivityLog::ACTION_LOGIN,
            "Pengguna {$user->name} berhasil login",
            $user instanceof Model ? $user : null
        );
    }

    /**
     * Log a logout event.
     */
    public function logLogout(mixed $user): ActivityLog
    {
        return $this->log(
            ActivityLog::ACTION_LOGOUT,
            "Pengguna {$user->name} logout dari sistem",
            $user instanceof Model ? $user : null
        );
    }

    /**
     * Log a failed login attempt.
     */
    public function logLoginFailed(string $username): ActivityLog
    {
        return ActivityLog::create([
            'user_id' => null,
            'action' => ActivityLog::ACTION_LOGIN_FAILED,
            'model_type' => null,
            'model_id' => null,
            'description' => "Percobaan login gagal untuk username: {$username}",
            'ip_address' => $this->getClientIp(),
            'user_agent' => $this->request->userAgent(),
            'properties' => ['username' => $username],
            'created_at' => now(),
        ]);
    }

    /**
     * Log a model creation.
     */
    public function logCreate(Model $model, ?string $description = null): ActivityLog
    {
        $modelName = class_basename($model);
        return $this->log(
            ActivityLog::ACTION_CREATE,
            $description ?? "Membuat data {$modelName} baru",
            $model,
            ['attributes' => $model->getAttributes()]
        );
    }

    /**
     * Log a model update.
     */
    public function logUpdate(Model $model, array $oldValues = [], ?string $description = null): ActivityLog
    {
        $modelName = class_basename($model);
        $changes = $model->getChanges();

        // Remove sensitive fields from logging
        $sensitiveFields = ['password', 'remember_token'];
        foreach ($sensitiveFields as $field) {
            unset($changes[$field], $oldValues[$field]);
        }

        return $this->log(
            ActivityLog::ACTION_UPDATE,
            $description ?? "Mengupdate data {$modelName}",
            $model,
            [
                'old' => array_intersect_key($oldValues, $changes),
                'new' => $changes,
            ]
        );
    }

    /**
     * Log a model deletion.
     */
    public function logDelete(Model $model, ?string $description = null): ActivityLog
    {
        $modelName = class_basename($model);
        return $this->log(
            ActivityLog::ACTION_DELETE,
            $description ?? "Menghapus data {$modelName}",
            $model
        );
    }

    /**
     * Log a password change.
     */
    public function logPasswordChange(mixed $user): ActivityLog
    {
        return $this->log(
            ActivityLog::ACTION_PASSWORD_CHANGE,
            "Pengguna {$user->name} mengubah password",
            $user instanceof Model ? $user : null
        );
    }

    /**
     * Get the client IP address, with proxy header support.
     */
    private function getClientIp(): ?string
    {
        // Check for proxy headers
        $headers = [
            'HTTP_CF_CONNECTING_IP',     // Cloudflare
            'HTTP_X_FORWARDED_FOR',      // Load balancer / proxy
            'HTTP_X_REAL_IP',            // Nginx proxy
            'REMOTE_ADDR',               // Standard
        ];

        foreach ($headers as $header) {
            if ($this->request->server($header)) {
                $ip = $this->request->server($header);
                // X-Forwarded-For can contain multiple IPs, get the first one
                if (str_contains($ip, ',')) {
                    $ip = trim(explode(',', $ip)[0]);
                }
                return $ip;
            }
        }

        return $this->request->ip();
    }
}
