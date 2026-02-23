<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BlotterParty extends Model
{
    use HasFactory;

    protected $fillable = [
        'blotter_case_id',
        'role',
        'name',
        'contact',
        'resident_id',
    ];

    public function blotterCase()
    {
        return $this->belongsTo(BlotterCase::class);
    }

    public function resident()
    {
        return $this->belongsTo(Resident::class);
    }
}


