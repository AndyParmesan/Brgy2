<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ResidentResidency extends Model
{
    use HasFactory;

    protected $table = 'resident_residency';

    protected $fillable = [
        'resident_id',
        'year_moved_in',
        'original_city_or_province',
        'residency_type',
        'residency_documents',
    ];

    public function resident()
    {
        return $this->belongsTo(Resident::class);
    }
}


