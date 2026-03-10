<?php

namespace Tests\Feature\Penjadwalan;

use App\Models\Jabatan;
use App\Models\JadwalHistory;
use App\Models\Penjadwalan;
use App\Models\SuratMasuk;
use App\Models\SuratMasukTujuan;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PenjadwalanFeatureTest extends TestCase
{
    use RefreshDatabase;

    public function test_form_jadwal_memakai_data_surat_terpilih_dan_nomor_agenda_tujuan_pengguna(): void
    {
        $bupati = $this->makeUser(User::ROLE_PEJABAT, 'Bupati', 'Bupati');
        $creator = $this->makeUser(User::ROLE_TU);

        $surat = $this->makeSuratMasuk($creator, 'SM/0001/' . date('Y'));
        SuratMasukTujuan::create([
            'surat_masuk_id' => $surat->id,
            'tujuan_id' => $bupati->id,
            'tujuan' => $bupati->name,
            'nomor_agenda' => 'SM/0099/' . date('Y'),
            'is_primary' => true,
            'is_tembusan' => false,
            'status_penerimaan' => SuratMasukTujuan::STATUS_DITERIMA,
            'diterima_at' => now(),
        ]);

        $this->actingAs($bupati)
            ->get(route('bupati.jadwal.form', $surat->id))
            ->assertOk()
            ->assertInertia(
                fn(Assert $page) => $page
                    ->component('Penjadwalan/Bupati/Form')
                    ->where('surat.id', $surat->id)
                    ->where('surat.nomor_agenda', 'SM/0099/' . date('Y'))
                    ->where('surat.nomor_surat', $surat->nomor_surat)
                    ->where('surat.asal_surat', $surat->asal_surat)
                    ->where('surat.perihal', $surat->perihal)
                    ->where('surat.isi_ringkas', $surat->isi_ringkas)
            );
    }

    public function test_surat_hanya_bisa_dijadwalkan_satu_kali(): void
    {
        $bupati = $this->makeUser(User::ROLE_PEJABAT, 'Bupati', 'Bupati');
        $attendee = $this->makeUser(User::ROLE_USER, 'Delegasi');
        $creator = $this->makeUser(User::ROLE_TU);

        $surat = $this->makeSuratMasuk($creator);
        SuratMasukTujuan::create([
            'surat_masuk_id' => $surat->id,
            'tujuan_id' => $bupati->id,
            'tujuan' => $bupati->name,
            'nomor_agenda' => 'SM/0100/' . date('Y'),
            'is_primary' => true,
            'is_tembusan' => false,
            'status_penerimaan' => SuratMasukTujuan::STATUS_DITERIMA,
            'diterima_at' => now(),
        ]);

        $payload = $this->validBupatiJadwalPayload($attendee->id);

        $this->actingAs($bupati)
            ->post(route('bupati.jadwal.store', $surat->id), $payload)
            ->assertRedirect(route('persuratan.surat-masuk.index'));

        $this->assertDatabaseCount('penjadwalan', 1);

        $this->actingAs($bupati)
            ->post(route('bupati.jadwal.store', $surat->id), $payload)
            ->assertSessionHas('error', 'Surat ini sudah memiliki jadwal.');

        $this->assertDatabaseCount('penjadwalan', 1);
        $this->assertDatabaseHas('penjadwalan', [
            'surat_masuk_id' => $surat->id,
            'status' => Penjadwalan::STATUS_TENTATIF,
        ]);
    }

    public function test_tindak_lanjut_mencatat_jadwal_history_dan_menjadi_definitif(): void
    {
        $this->withoutExceptionHandling();
        $superadmin = $this->makeUser(User::ROLE_SUPERADMIN, 'Super Admin');
        $creator = $this->makeUser(User::ROLE_TU, 'TU');
        $surat = $this->makeSuratMasuk($creator);

        $jadwal = Penjadwalan::create([
            'surat_masuk_id' => $surat->id,
            'tanggal_agenda' => now()->addDay()->toDateString(),
            'waktu_mulai' => '08:00:00',
            'waktu_selesai' => '09:00:00',
            'sampai_selesai' => false,
            'nama_kegiatan' => 'Uji Agenda',
            'lokasi_type' => Penjadwalan::LOKASI_DALAM_DAERAH,
            'kode_wilayah' => '32.06.01.0001',
            'tempat' => 'Pendopo',
            'status' => Penjadwalan::STATUS_TENTATIF,
            'status_disposisi' => Penjadwalan::DISPOSISI_MENUNGGU,
            'created_by' => $superadmin->id,
            'updated_by' => $superadmin->id,
        ]);

        $this->actingAs($superadmin)
            ->put(route('penjadwalan.tentatif.tindak-lanjut', $jadwal->id), [
                'tanggal_agenda' => now()->addDay()->toDateString(),
                'waktu_mulai' => '10:00',
                'sampai_selesai' => false,
                'lokasi_type' => 'dalam_daerah',
                'kecamatan_id' => '01',
                'desa_id' => '0001',
                'tempat' => 'Disini',
                'status_kehadiran' => 'Diwakilkan',
                'nama_yang_mewakili' => 'Bawahan',
                'jabatan_yang_mewakili' => 'Staf',
                'keterangan' => 'Kehadiran diwakilkan kepada bawahan',
            ])
            ->assertRedirect()
            ->assertSessionHas('success');

        $this->assertDatabaseHas('jadwal_history', [
            'jadwal_id' => $jadwal->id,
            'changed_by' => $superadmin->id,
        ]);

        $this->assertDatabaseHas('penjadwalan', [
            'id' => $jadwal->id,
            'status' => Penjadwalan::STATUS_DEFINITIF,
            'status_kehadiran' => 'Diwakilkan',
        ]);
    }

    public function test_status_formal_accessor_tetap_konsisten_dengan_status_existing(): void
    {
        $creator = $this->makeUser(User::ROLE_TU);

        $terjadwal = Penjadwalan::create([
            'surat_masuk_id' => $this->makeSuratMasuk($creator)->id,
            'tanggal_agenda' => now()->addDay()->toDateString(),
            'waktu_mulai' => '08:00:00',
            'nama_kegiatan' => 'Terjadwal',
            'tempat' => 'Pendopo',
            'status' => Penjadwalan::STATUS_DEFINITIF,
            'status_disposisi' => Penjadwalan::DISPOSISI_BUPATI,
        ]);
        $this->assertSame(Penjadwalan::STATUS_FORMAL_TERJADWAL, $terjadwal->status_formal);

        $selesai = Penjadwalan::create([
            'surat_masuk_id' => $this->makeSuratMasuk($creator)->id,
            'tanggal_agenda' => now()->subDay()->toDateString(),
            'waktu_mulai' => '08:00:00',
            'nama_kegiatan' => 'Selesai',
            'tempat' => 'Pendopo',
            'status' => Penjadwalan::STATUS_DEFINITIF,
            'status_disposisi' => Penjadwalan::DISPOSISI_BUPATI,
        ]);
        $this->assertSame(Penjadwalan::STATUS_FORMAL_SELESAI, $selesai->status_formal);

        $dalamProses = Penjadwalan::create([
            'surat_masuk_id' => $this->makeSuratMasuk($creator)->id,
            'tanggal_agenda' => now()->addDay()->toDateString(),
            'waktu_mulai' => '10:00:00',
            'nama_kegiatan' => 'Dalam Proses',
            'tempat' => 'Pendopo',
            'status' => Penjadwalan::STATUS_TENTATIF,
            'status_disposisi' => Penjadwalan::DISPOSISI_MENUNGGU,
        ]);
        $this->assertSame(Penjadwalan::STATUS_FORMAL_DALAM_PROSES, $dalamProses->status_formal);

        $didisposisikan = Penjadwalan::create([
            'surat_masuk_id' => $this->makeSuratMasuk($creator)->id,
            'tanggal_agenda' => now()->addDays(2)->toDateString(),
            'waktu_mulai' => '11:00:00',
            'nama_kegiatan' => 'Didisposisikan',
            'tempat' => 'Pendopo',
            'status' => Penjadwalan::STATUS_TENTATIF,
            'status_disposisi' => Penjadwalan::DISPOSISI_DIWAKILKAN,
        ]);
        $this->assertSame(Penjadwalan::STATUS_FORMAL_DIDISPOSISIKAN, $didisposisikan->status_formal);

        $ditunda = Penjadwalan::create([
            'surat_masuk_id' => $this->makeSuratMasuk($creator)->id,
            'tanggal_agenda' => now()->subDays(2)->toDateString(),
            'waktu_mulai' => '12:00:00',
            'nama_kegiatan' => 'Ditunda',
            'tempat' => 'Pendopo',
            'status' => Penjadwalan::STATUS_TENTATIF,
            'status_disposisi' => Penjadwalan::DISPOSISI_MENUNGGU,
        ]);
        $this->assertSame(Penjadwalan::STATUS_FORMAL_DITUNDA, $ditunda->status_formal);
    }

    public function test_superadmin_bisa_menjadwalkan_tanpa_identitas_bupati(): void
    {
        $superadmin = $this->makeUser(User::ROLE_SUPERADMIN, 'Super Admin');
        $attendee = $this->makeUser(User::ROLE_USER, 'Delegasi');
        $creator = $this->makeUser(User::ROLE_TU);

        $surat = $this->makeSuratMasuk($creator);

        $this->actingAs($superadmin)
            ->post(route('bupati.jadwal.store', $surat->id), $this->validBupatiJadwalPayload($attendee->id))
            ->assertRedirect(route('persuratan.surat-masuk.index'));

        $this->assertDatabaseHas('penjadwalan', [
            'surat_masuk_id' => $surat->id,
            'dihadiri_oleh_user_id' => $attendee->id,
        ]);
    }

    private function makeUser(string $role, ?string $name = null, ?string $jabatanNama = null): User
    {
        $jabatanId = null;
        if ($jabatanNama) {
            $jabatan = Jabatan::firstOrCreate(
                ['nama' => $jabatanNama],
                ['level' => 1, 'can_dispose' => true, 'is_system' => true]
            );
            $jabatanId = $jabatan->id;
        }

        return User::factory()->create([
            'name' => $name ?? fake()->name(),
            'role' => $role,
            'jabatan_id' => $jabatanId,
            'password_changed_at' => now(),
        ]);
    }

    private function makeSuratMasuk(User $creator, ?string $nomorAgenda = null): SuratMasuk
    {
        $year = date('Y');

        return SuratMasuk::create([
            'nomor_agenda' => $nomorAgenda ?? 'SM/0001/' . $year,
            'tanggal_diterima' => now()->toDateString(),
            'tanggal_surat' => now()->toDateString(),
            'asal_surat' => 'Kementerian Pengujian',
            'nomor_surat' => 'SM-' . Str::upper(Str::random(8)),
            'sifat' => 'biasa',
            'lampiran' => 0,
            'perihal' => 'Undangan Rapat Koordinasi',
            'isi_ringkas' => 'Ringkasan isi surat pengujian.',
            'created_by' => $creator->id,
            'updated_by' => $creator->id,
        ]);
    }

    private function validBupatiJadwalPayload(int $attendeeId): array
    {
        return [
            'dihadiri_oleh_user_id' => $attendeeId,
            'tanggal_agenda' => now()->addDay()->toDateString(),
            'waktu_mulai' => '08:00',
            'waktu_selesai' => '09:00',
            'sampai_selesai' => false,
            'lokasi_type' => 'dalam_daerah',
            'kecamatan_id' => '01',
            'desa_id' => '0001',
            'tempat' => 'Pendopo Kabupaten Tasikmalaya',
            'keterangan' => 'Uji penjadwalan otomatis',
        ];
    }
}
