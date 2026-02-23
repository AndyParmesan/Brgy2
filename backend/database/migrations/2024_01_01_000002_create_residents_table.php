<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('residents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('household_id')
                ->nullable()
                ->constrained('households')
                ->nullOnDelete();

            $table->string('full_name');
            $table->string('gender')->nullable();
            $table->string('resident_type')->nullable(); // Permanent / Temporary
            $table->date('date_of_birth')->nullable();
            $table->string('place_of_birth')->nullable();
            $table->string('civil_status')->nullable();
            $table->string('nationality')->default('Filipino');
            $table->string('religion')->nullable();

            $table->string('contact_mobile')->nullable();
            $table->string('contact_email')->nullable();

            $table->boolean('is_senior_citizen')->default(false);
            $table->boolean('is_pwd')->default(false);
            $table->string('pwd_type')->nullable();
            $table->text('chronic_illnesses')->nullable();

            $table->boolean('registered_voter')->default(false);
            $table->string('voter_precinct_no')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('residents');
    }
};


