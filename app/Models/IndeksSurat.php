<?php

namespace App\Models;

use App\Traits\HasAuditTrail;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class IndeksSurat extends Model
{
    use HasFactory, HasUlids, HasAuditTrail;

    protected $table = 'indeks_surat';

    protected $fillable = [
        'kode',
        'nama',
        'parent_id',
        'level',
        'urutan',
        'created_by',
        'updated_by',
        'deleted_by',
    ];

    protected $casts = [
        'level' => 'integer',
        'urutan' => 'integer',
    ];

    public function parent(): BelongsTo
    {
        return $this->belongsTo(IndeksSurat::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(IndeksSurat::class, 'parent_id')->orderBy('kode');
    }

    public function childrenRecursive(): HasMany
    {
        return $this->children()->with('childrenRecursive');
    }

    public function isSystemLevel(): bool
    {
        return $this->level === 1;
    }

    public function hasChildren(): bool
    {
        return $this->children()->exists();
    }

    /**
     * Generate the next child kode for a given parent.
     * e.g. parent "000" with existing children "000.1", "000.2" → returns "000.3"
     */
    public static function generateNextChildKode(string $parentId): string
    {
        $parent = self::findOrFail($parentId);

        $lastChild = self::where('parent_id', $parentId)
            ->get()
            ->sortByDesc(function ($item) {
                $parts = explode('.', $item->kode);
                return (int) end($parts);
            })
            ->first();

        if ($lastChild) {
            $parts = explode('.', $lastChild->kode);
            $lastNum = (int) end($parts);
            $nextNum = $lastNum + 1;
        } else {
            $nextNum = 1;
        }

        return $parent->kode . '.' . $nextNum;
    }
}
