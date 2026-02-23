<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Household extends Model
{
    use HasFactory;

    protected $fillable = [
        'household_code',
        'address_line',
        'purok_sitio',
        'zone',
        'barangay',
        'city',
        'province',
        'postal_code',
        'profile_notes',
    ];

    public function residents()
    {
        return $this->hasMany(Resident::class);
    }
}


