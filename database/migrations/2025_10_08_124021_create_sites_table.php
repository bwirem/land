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

            $table->foreignId('landowner_id')->nullable()->constrained('landowners')->onDelete('set null');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            
            $table->foreignId('sector_id')->nullable()->constrained('site_sectors')->onDelete('set null'); 
            $table->foreignId('activity_id')->nullable()->constrained('site_activities')->onDelete('set null'); 
            $table->foreignId('allocationmethod_id')->nullable()->constrained('site_allocationmethods')->onDelete('set null'); 
            $table->foreignId('jurisdiction_id')->nullable()->constrained('site_jurisdictions')->onDelete('set null'); 
            $table->foreignId('opportunitytype_id')->nullable()->constrained('site_opportunitytypes')->onDelete('set null'); 
            $table->foreignId('utility_id')->nullable()->constrained('site_utilities')->onDelete('set null'); 
            $table->text('project_description')->nullable();   

      
            $table->integer('stage')->default(1); //Numerical stage.
            $table->string('application_form')->nullable(); // Path to the uploaded application form
            $table->enum('status', ['draft', 'submitted', 'approved', 'awarded','defaulted'])->default('draft'); //Add draft stage.
            $table->text('submit_remarks')->nullable();
            
            $table->foreignId('facilitybranch_id')->nullable()->constrained('facilitybranches')->onDelete('set null');
            $table->foreignId('ward_id')->nullable()->constrained('loc_wards')->onDelete('set null');
            $table->string('street_name')->nullable();
           
            $table->decimal('landarea', 15, 2)->nullable(); // Nullable decimal for land area
            $table->decimal('priceofland', 15, 2)->nullable(); // Nullable decimal for price of 
            
            
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