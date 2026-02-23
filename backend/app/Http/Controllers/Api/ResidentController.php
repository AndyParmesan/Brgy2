<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Resident;
use Illuminate\Http\Request;

class ResidentController extends Controller
{
    public function index(Request $request)
    {
        $query = Resident::query()->with('household');

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('full_name', 'like', "%{$search}%")
                    ->orWhere('contact_mobile', 'like', "%{$search}%");
            });
        }

        if ($zone = $request->query('zone')) {
            $query->whereHas('household', function ($q) use ($zone) {
                $q->where('zone', $zone);
            });
        }

        return response()->json(
            $query->orderBy('full_name')->paginate(25)
        );
    }
}


