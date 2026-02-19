<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class IndeksSuratSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $path = database_path('seeders/data/klasifikasii.csv');

        if (!file_exists($path)) {
            $this->command->error('File klasifikasi.csv tidak ditemukan di database/seeders/data/');
            return;
        }

        $handle = fopen($path, 'r');

        // Skip UTF-8 BOM jika ada
        $bom = fread($handle, 3);
        if ($bom !== "\xEF\xBB\xBF") {
            rewind($handle);
        }

        // Skip header row
        fgetcsv($handle, 0, ';');

        // Parse semua baris CSV
        $rows = [];
        $lineNumber = 1;
        $skipped = 0;

        while (($line = fgetcsv($handle, 0, ';')) !== false) {
            $lineNumber++;

            if (count($line) < 2) {
                continue;
            }

            $kode = trim($line[0]);
            $nama = trim($line[1]);

            if ($kode === '' || $nama === '') {
                continue;
            }

            // Validasi format kode
            if (!preg_match('/^[0-9]+(\.[0-9]+)*$/', $kode)) {
                $this->command->warn("Baris {$lineNumber}: Kode '{$kode}' format tidak valid, dilewati.");
                $skipped++;
                continue;
            }

            $rows[] = ['kode' => $kode, 'nama' => $nama];
        }

        fclose($handle);

        if (empty($rows)) {
            $this->command->warn('Tidak ada data valid di file CSV.');
            return;
        }

        // Sort numerik per segment agar parent selalu sebelum child
        usort($rows, function ($a, $b) {
            $aParts = array_map('intval', explode('.', $a['kode']));
            $bParts = array_map('intval', explode('.', $b['kode']));
            $max = max(count($aParts), count($bParts));

            for ($i = 0; $i < $max; $i++) {
                $aVal = $aParts[$i] ?? -1;
                $bVal = $bParts[$i] ?? -1;
                if ($aVal !== $bVal) {
                    return $aVal <=> $bVal;
                }
            }

            return 0;
        });

        // Build insert data dengan parent_id resolution
        $kodeToId = [];
        $now = now();
        $level1Counter = 0;
        $insertData = [];

        foreach ($rows as $row) {
            $kode = $row['kode'];
            $nama = $row['nama'];
            $level = substr_count($kode, '.') + 1;

            // Resolve parent_id
            $parentId = null;
            if (str_contains($kode, '.')) {
                $parentKode = substr($kode, 0, strrpos($kode, '.'));
                $parentId = $kodeToId[$parentKode] ?? null;

                if ($parentId === null) {
                    $this->command->warn("Parent '{$parentKode}' tidak ditemukan untuk kode '{$kode}', dilewati.");
                    $skipped++;
                    continue;
                }
            }

            $id = (string) Str::ulid();
            $kodeToId[$kode] = $id;

            $urutan = null;
            if ($level === 1) {
                $level1Counter++;
                $urutan = $level1Counter;
            }

            $insertData[] = [
                'id'         => $id,
                'kode'       => $kode,
                'nama'       => $nama,
                'parent_id'  => $parentId,
                'level'      => $level,
                'urutan'     => $urutan,
                'created_by' => null,
                'updated_by' => null,
                'deleted_by' => null,
                'created_at' => $now,
                'updated_at' => $now,
                'deleted_at' => null,
            ];
        }

        // Bulk insert dalam transaction
        DB::transaction(function () use ($insertData) {
            DB::statement('TRUNCATE TABLE indeks_surat CASCADE');

            foreach (array_chunk($insertData, 500) as $chunk) {
                DB::table('indeks_surat')->insert($chunk);
            }
        });

        $total = count($insertData);
        $this->command->info("{$total} data Indeks Surat berhasil di-seed dari CSV.");

        if ($skipped > 0) {
            $this->command->warn("{$skipped} baris dilewati karena tidak valid.");
        }
    }
}
