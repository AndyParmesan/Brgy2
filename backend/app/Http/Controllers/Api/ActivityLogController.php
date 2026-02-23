<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;

class ActivityLogController extends Controller
{
    public function index()
    {
        return response()->json(
            ActivityLog::query()
                ->orderByDesc('logged_at')
                ->limit(50)
                ->get()
        );
    }
}


