<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create admin account (email: admin@admin.com, password: admin)
        User::create([
            'name' => 'Administrator',
            'email' => 'admin@admin.com',
            'password' => Hash::make('admin'),
            'role' => 'admin',
        ]);

        // Create admin account (email: alrajiediamla12@gmail.com, password: 1234)
        User::create([
            'name' => 'Alrajie Diamla',
            'email' => 'alrajiediamla12@gmail.com',
            'password' => Hash::make('1234'),
            'role' => 'admin',
        ]);

        // Create default admin user
        User::create([
            'name' => 'Kap. Maria Dela Cruz',
            'email' => 'admin@brgy853.ph',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);

        // Create default staff user
        User::create([
            'name' => 'Staff Juan',
            'email' => 'staff@brgy853.ph',
            'password' => Hash::make('password'),
            'role' => 'staff',
        ]);
    }
}

