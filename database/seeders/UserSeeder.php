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
                'name' => 'Super Admin',
                'username' => 'superadmin',
                'email' => 'superadmin@eoffice.test',
                'password' => Hash::make('tasik123@'),
                'role' => User::ROLE_SUPERADMIN,
            ],
            [
                'name' => 'Tata Usaha',
                'username' => 'tatausaha',
                'email' => 'tatausaha@eoffice.test',
                'password' => Hash::make('tatausaha123@'),
                'role' => User::ROLE_TU,
            ],
            [
                'name' => 'Sekpri Bupati',
                'username' => 'sekpribupati',
                'email' => 'sekpribupati@eoffice.test',
                'password' => Hash::make('sekpribupati123@'),
                'role' => User::ROLE_SEKPRI_BUPATI,
            ],
            [
                'name' => 'Sekpri Wakil Bupati',
                'username' => 'sekpriwabup',
                'email' => 'sekpriwabup123@eoffice.test',
                'password' => Hash::make('sekpripwabup123@'),
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
        $this->command->info('Default login: superadmin / tasik123@');
    }
}
