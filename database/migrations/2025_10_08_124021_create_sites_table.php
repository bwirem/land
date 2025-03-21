<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::create('sites', function (Blueprint $table) {
            $table->id();
            $table->enum('owner_type', ['individual', 'company'])->default('individual');
            $table->string('first_name')->nullable();
            $table->string('other_names')->nullable();
            $table->string('surname')->nullable();
            $table->string('company_name')->nullable();
            $table->string('email');
            $table->string('phone', 13)->nullable();
            $table->foreignId('landowner_id')->nullable()->constrained('landowners')->onDelete('set null');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('sector_id')->nullable()->constrained('sectors')->onDelete('set null'); 
            $table->text('project_description')->nullable();
           
      
            $table->integer('stage')->default(1); //Numerical stage.
            $table->string('application_form')->nullable(); // Path to the uploaded application form
            $table->enum('status', ['draft', 'submitted', 'approved', 'awarded','defaulted'])->default('draft'); //Add draft stage.
            $table->text('submit_remarks')->nullable();
            $table->foreignId('facilitybranch_id')->nullable()->constrained('facilitybranches')->onDelete('set null');
            $table->timestamps();
        });
    }


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sites');
    }
};