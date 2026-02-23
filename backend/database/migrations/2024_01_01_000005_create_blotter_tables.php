<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('blotter_cases', function (Blueprint $table) {
            $table->id();
            $table->string('case_no')->unique(); // BLT-2024-012
            $table->string('case_title');
            $table->string('category')->nullable(); // Public disturbance, Property dispute, etc.
            $table->string('status')->nullable();   // Under Investigation, For Mediation, etc.
            $table->string('priority')->default('Medium'); // Low / Medium / High

            $table->dateTime('schedule_datetime')->nullable();
            $table->string('schedule_location')->nullable();

            $table->string('investigator_name')->nullable();
            $table->string('location')->nullable();

            $table->text('summary')->nullable();
            $table->dateTime('date_reported')->nullable();

            $table->timestamps();
        });

        Schema::create('blotter_parties', function (Blueprint $table) {
            $table->id();
            $table->foreignId('blotter_case_id')
                ->constrained('blotter_cases')
                ->cascadeOnDelete();

            $table->string('role'); // Complainant / Respondent / Witness
            $table->string('name');
            $table->string('contact')->nullable();

            $table->foreignId('resident_id')
                ->nullable()
                ->constrained('residents')
                ->nullOnDelete();

            $table->timestamps();
        });

        Schema::create('blotter_actions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('blotter_case_id')
                ->constrained('blotter_cases')
                ->cascadeOnDelete();

            $table->string('action_label');   // Initial Action, Next Hearing, etc.
            $table->text('action_details')->nullable();
            $table->dateTime('next_hearing_datetime')->nullable();
            $table->text('required_documents')->nullable();
            $table->string('recorded_by')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('blotter_actions');
        Schema::dropIfExists('blotter_parties');
        Schema::dropIfExists('blotter_cases');
    }
};


