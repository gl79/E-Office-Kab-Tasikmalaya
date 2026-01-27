<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * 
     * Membuat user awal untuk testing dan first login.
     */
    public function run(): void
    {
        $users = [
            [
                'name' => 'Tata Usaha',
                'username' => 'tata_usaha',
                'email' => 'tata.usaha@eoffice.test',
                'password' => Hash::make('password'),
                'role' => User::ROLE_TU,
            ],
            [
                'name' => 'Super Admin',
                'username' => 'superadmin',
                'email' => 'superadmin@eoffice.test',
                'password' => Hash::make('password'),
                'role' => User::ROLE_SUPERADMIN,
            ],
            [
                'name' => 'Sekpri Bupati',
                'username' => 'sekpri_bupati',
                'email' => 'sekpri.bupati@eoffice.test',
                'password' => Hash::make('password'),
                'role' => User::ROLE_SEKPRI_BUPATI,
            ],
            [
                'name' => 'Sekpri Wakil Bupati',
                'username' => 'sekpri_wakil',
                'email' => 'sekpri.wakil@eoffice.test',
                'password' => Hash::make('password'),
                'role' => User::ROLE_SEKPRI_WAKIL_BUPATI,
            ],
        ];

        foreach ($users as $userData) {
            User::updateOrCreate(
                ['username' => $userData['username']],
                $userData
            );
        }

        $this->command->info('Created/updated ' . count($users) . ' users.');
        $this->command->info('Default login: tata_usaha / password');
    }
}
