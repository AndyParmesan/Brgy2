<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BlotterAction extends Model
{
    use HasFactory;

    protected $fillable = [
        'blotter_case_id',
        'action_label',
        'action_details',
        'next_hearing_datetime',
        'required_documents',
        'recorded_by',
    ];

    protected $casts = [
        'next_hearing_datetime' => 'datetime',
    ];

    public function blotterCase()
    {
        return $this->belongsTo(BlotterCase::class);
    }
}


