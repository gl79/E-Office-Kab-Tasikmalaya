<?php

namespace Tests\Feature\Persuratan;

use App\Models\SuratKeluar;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Tests\TestCase;

class SecurityAndFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_cannot_preview_other_users_surat_keluar(): void
    {
        $owner = $this->makeUser(role: User::ROLE_TU);
        $otherUser = $this->makeUser(role: User::ROLE_USER);

        $surat = SuratKeluar::create([
            'tanggal_surat' => now()->toDateString(),
            'no_urut' => '0001',
            'nomor_surat' => 'SK/' . Str::upper(Str::random(8)),
            'kepada' => 'Penerima Uji',
            'perihal' => 'Perihal Uji',
            'isi_ringkas' => 'Isi ringkas uji',
            'sifat_1' => 'biasa',
            'sifat_2' => 'biasa',
            'lampiran' => 0,
            'created_by' => $owner->id,
        ]);

        $this->actingAs($otherUser)
            ->get(route('persuratan.surat-keluar.preview', $surat->id))
            ->assertForbidden();
    }

    public function test_store_surat_keluar_ignores_tampered_no_urut_from_request(): void
    {
        Storage::fake('public');
        $creator = $this->makeUser(role: User::ROLE_SUPERADMIN);

        $nomorSurat = 'SK/' . Str::upper(Str::random(10));
        $tanggalSurat = now()->toDateString();

        $this->actingAs($creator)
            ->post(route('persuratan.surat-keluar.store'), [
                'tanggal_surat' => $tanggalSurat,
                'no_urut' => '9999',
                'nomor_surat' => $nomorSurat,
                'kepada' => 'Penerima Uji',
                'perihal' => 'Perihal Uji',
                'isi_ringkas' => 'Isi Ringkas Uji',
                'sifat_1' => 'biasa',
                'lampiran' => 1,
                'file' => UploadedFile::fake()->create('surat.pdf', 100, 'application/pdf'),
            ])
            ->assertRedirect(route('persuratan.surat-keluar.index'));

        $this->assertDatabaseHas('surat_keluars', [
            'nomor_surat' => $nomorSurat,
            'no_urut' => '0001',
            'created_by' => $creator->id,
        ]);
    }

    private function makeUser(string $role): User
    {
        return User::factory()->create([
            'role' => $role,
            'password_changed_at' => now(),
        ]);
    }
}
