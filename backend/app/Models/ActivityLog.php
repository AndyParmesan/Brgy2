<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ActivityLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'actor_name',
        'action',
        'module',
        'reference_id',
        'logged_at',
    ];

    protected $casts = [
        'logged_at' => 'datetime',
    ];
}


