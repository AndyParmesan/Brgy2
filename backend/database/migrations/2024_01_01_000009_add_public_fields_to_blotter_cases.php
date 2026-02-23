<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('blotter_cases', function (Blueprint $table) {
            $table->string('reporter_name')->nullable()->after('location');
            $table->string('reporter_contact')->nullable()->after('reporter_name');
            $table->string('reporter_email')->nullable()->after('reporter_contact');
            $table->text('reporter_address')->nullable()->after('reporter_email');
            $table->date('incident_date')->nullable()->after('date_reported');
            $table->time('incident_time')->nullable()->after('incident_date');
            $table->text('description')->nullable()->after('summary');
            $table->text('persons_involved')->nullable()->after('description');
            $table->text('witnesses')->nullable()->after('persons_involved');
        });
    }

    public function down(): void
    {
        Schema::table('blotter_cases', function (Blueprint $table) {
            $table->dropColumn([
                'reporter_name',
                'reporter_contact',
                'reporter_email',
                'reporter_address',
                'incident_date',
                'incident_time',
                'description',
                'persons_involved',
                'witnesses'
            ]);
        });
    }
};

