<?php

namespace App\Services;

use App\Models\ActivityLog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

class ActivityLogService
{
    /**
     * Log an activity.
     */
    public static function log(
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
            'ip_address' => self::getClientIp(),
            'user_agent' => Request::userAgent(),
            'properties' => !empty($properties) ? $properties : null,
            'created_at' => now(),
        ]);
    }

    /**
     * Log a login event.
     */
    public static function logLogin(mixed $user): ActivityLog
    {
        return self::log(
            ActivityLog::ACTION_LOGIN,
            "Pengguna {$user->name} berhasil login",
            $user instanceof Model ? $user : null
        );
    }

    /**
     * Log a logout event.
     */
    public static function logLogout(mixed $user): ActivityLog
    {
        return self::log(
            ActivityLog::ACTION_LOGOUT,
            "Pengguna {$user->name} logout dari sistem",
            $user instanceof Model ? $user : null
        );
    }

    /**
     * Log a failed login attempt.
     */
    public static function logLoginFailed(string $username): ActivityLog
    {
        return ActivityLog::create([
            'user_id' => null,
            'action' => ActivityLog::ACTION_LOGIN_FAILED,
            'model_type' => null,
            'model_id' => null,
            'description' => "Percobaan login gagal untuk username: {$username}",
            'ip_address' => self::getClientIp(),
            'user_agent' => Request::userAgent(),
            'properties' => ['username' => $username],
            'created_at' => now(),
        ]);
    }

    /**
     * Log a model creation.
     */
    public static function logCreate(Model $model, ?string $description = null): ActivityLog
    {
        $modelName = class_basename($model);
        return self::log(
            ActivityLog::ACTION_CREATE,
            $description ?? "Membuat data {$modelName} baru",
            $model,
            ['attributes' => $model->getAttributes()]
        );
    }

    /**
     * Log a model update.
     */
    public static function logUpdate(Model $model, array $oldValues = [], ?string $description = null): ActivityLog
    {
        $modelName = class_basename($model);
        $changes = $model->getChanges();

        // Remove sensitive fields from logging
        $sensitiveFields = ['password', 'remember_token'];
        foreach ($sensitiveFields as $field) {
            unset($changes[$field], $oldValues[$field]);
        }

        return self::log(
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
     * Log a model deletion (soft delete).
     */
    public static function logDelete(Model $model, ?string $description = null): ActivityLog
    {
        $modelName = class_basename($model);
        return self::log(
            ActivityLog::ACTION_DELETE,
            $description ?? "Menghapus data {$modelName}",
            $model
        );
    }

    /**
     * Log a model restoration.
     */
    public static function logRestore(Model $model, ?string $description = null): ActivityLog
    {
        $modelName = class_basename($model);
        return self::log(
            ActivityLog::ACTION_RESTORE,
            $description ?? "Memulihkan data {$modelName}",
            $model
        );
    }

    /**
     * Log a force delete.
     */
    public static function logForceDelete(Model $model, ?string $description = null): ActivityLog
    {
        $modelName = class_basename($model);
        return self::log(
            ActivityLog::ACTION_FORCE_DELETE,
            $description ?? "Menghapus permanen data {$modelName}",
            $model
        );
    }

    /**
     * Log a password change.
     */
    public static function logPasswordChange(mixed $user): ActivityLog
    {
        return self::log(
            ActivityLog::ACTION_PASSWORD_CHANGE,
            "Pengguna {$user->name} mengubah password",
            $user instanceof Model ? $user : null
        );
    }

    /**
     * Get the client IP address.
     */
    protected static function getClientIp(): ?string
    {
        $request = Request::instance();

        // Check for proxy headers
        $headers = [
            'HTTP_CF_CONNECTING_IP',     // Cloudflare
            'HTTP_X_FORWARDED_FOR',      // Load balancer / proxy
            'HTTP_X_REAL_IP',            // Nginx proxy
            'REMOTE_ADDR',               // Standard
        ];

        foreach ($headers as $header) {
            if ($request->server($header)) {
                $ip = $request->server($header);
                // X-Forwarded-For can contain multiple IPs, get the first one
                if (str_contains($ip, ',')) {
                    $ip = trim(explode(',', $ip)[0]);
                }
                return $ip;
            }
        }

        return $request->ip();
    }
}
