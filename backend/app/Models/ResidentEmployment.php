<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ResidentEmployment extends Model
{
    use HasFactory;

    protected $table = 'resident_employment';

    protected $fillable = [
        'resident_id',
        'employment_status',
        'nature_of_work',
        'employer_name',
        'work_address',
        'monthly_income_range',
    ];

    public function resident()
    {
        return $this->belongsTo(Resident::class);
    }
}


