<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            $table->string('actor_name')->nullable();  // Staff Juan, Kap. Maria, etc.
            $table->string('action');                  // Added resident, approved request, etc.
            $table->string('module')->nullable();      // Resident, Document, Blotter, Announcement
            $table->string('reference_id')->nullable(); // e.g. RES-2024-001, DOC-2024-045
            $table->dateTime('logged_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
    }
};


