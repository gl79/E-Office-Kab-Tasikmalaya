<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;

class ActivityLog extends Model
{
    use HasUlids;

    /**
     * Indicates if the model should be timestamped.
     */
    public $timestamps = false;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'user_id',
        'action',
        'model_type',
        'model_id',
        'description',
        'ip_address',
        'user_agent',
        'properties',
        'created_at',
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'properties' => 'array',
        'created_at' => 'datetime',
    ];

    /**
     * Action types constants
     */
    public const ACTION_LOGIN = 'login';
    public const ACTION_LOGOUT = 'logout';
    public const ACTION_LOGIN_FAILED = 'login_failed';
    public const ACTION_CREATE = 'create';
    public const ACTION_UPDATE = 'update';
    public const ACTION_DELETE = 'delete';
    public const ACTION_RESTORE = 'restore';
    public const ACTION_FORCE_DELETE = 'force_delete';
    public const ACTION_VIEW = 'view';
    public const ACTION_PASSWORD_CHANGE = 'password_change';

    /**
     * Action labels in Indonesian
     */
    public const ACTION_LABELS = [
        self::ACTION_LOGIN => 'Login',
        self::ACTION_LOGOUT => 'Logout',
        self::ACTION_LOGIN_FAILED => 'Login Gagal',
        self::ACTION_CREATE => 'Tambah Data',
        self::ACTION_UPDATE => 'Update Data',
        self::ACTION_DELETE => 'Hapus Data',
        self::ACTION_RESTORE => 'Pulihkan Data',
        self::ACTION_FORCE_DELETE => 'Hapus Permanen',
        self::ACTION_VIEW => 'Lihat Data',
        self::ACTION_PASSWORD_CHANGE => 'Ubah Password',
    ];

    /**
     * Get the user that performed the activity.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the action label in Indonesian.
     */
    public function getActionLabelAttribute(): string
    {
        return self::ACTION_LABELS[$this->action] ?? ucfirst($this->action);
    }

    /**
     * Get formatted user agent (browser/device info).
     */
    public function getFormattedUserAgentAttribute(): array
    {
        if (!$this->user_agent) {
            return ['browser' => 'Unknown', 'platform' => 'Unknown'];
        }

        $browser = 'Unknown';
        $platform = 'Unknown';

        // Detect browser
        if (preg_match('/Firefox/i', $this->user_agent)) {
            $browser = 'Firefox';
        } elseif (preg_match('/Chrome/i', $this->user_agent)) {
            $browser = preg_match('/Edg/i', $this->user_agent) ? 'Edge' : 'Chrome';
        } elseif (preg_match('/Safari/i', $this->user_agent)) {
            $browser = 'Safari';
        } elseif (preg_match('/Opera|OPR/i', $this->user_agent)) {
            $browser = 'Opera';
        }

        // Detect platform
        if (preg_match('/Windows/i', $this->user_agent)) {
            $platform = 'Windows';
        } elseif (preg_match('/Macintosh|Mac OS/i', $this->user_agent)) {
            $platform = 'macOS';
        } elseif (preg_match('/Linux/i', $this->user_agent)) {
            $platform = preg_match('/Android/i', $this->user_agent) ? 'Android' : 'Linux';
        } elseif (preg_match('/iPhone|iPad/i', $this->user_agent)) {
            $platform = 'iOS';
        }

        return ['browser' => $browser, 'platform' => $platform];
    }

    /**
     * Get the model name without namespace.
     */
    public function getModelNameAttribute(): ?string
    {
        if (!$this->model_type) {
            return null;
        }
        return class_basename($this->model_type);
    }

    /**
     * Scope: Filter by user.
     */
    public function scopeForUser(Builder $query, $userId): Builder
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope: Filter by action type.
     */
    public function scopeOfAction(Builder $query, string $action): Builder
    {
        return $query->where('action', $action);
    }

    /**
     * Scope: Filter by date range.
     */
    public function scopeInDateRange(Builder $query, $startDate, $endDate): Builder
    {
        return $query->whereBetween('created_at', [$startDate, $endDate]);
    }

    /**
     * Scope: Search by description, IP, or user name.
     */
    public function scopeSearch(Builder $query, ?string $search): Builder
    {
        if (!$search) {
            return $query;
        }

        return $query->where(function ($q) use ($search) {
            $q->where('description', 'ilike', "%{$search}%")
                ->orWhere('ip_address', 'ilike', "%{$search}%")
                ->orWhereHas('user', function ($userQuery) use ($search) {
                    $userQuery->where('name', 'ilike', "%{$search}%")
                        ->orWhere('username', 'ilike', "%{$search}%");
                });
        });
    }
}
