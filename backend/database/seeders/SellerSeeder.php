<?php

namespace Database\Seeders;

use App\Models\Seller;
use Illuminate\Database\Seeder;

class SellerSeeder extends Seeder
{
    public function run(): void
    {
        $sellers = [
            ['slug' => 'studio-waingapu', 'name' => 'Studio Waingapu', 'city' => 'East Sumba', 'verified' => true],
            ['slug' => 'tanoh-roastery', 'name' => 'Tanoh Roastery', 'city' => 'Bener Meriah', 'verified' => true],
            ['slug' => 'kayuh-studio', 'name' => 'Kayuh Studio', 'city' => 'Yogyakarta', 'verified' => true],
            ['slug' => 'tanah-ceramic', 'name' => 'Tanah Ceramic', 'city' => 'Bandung', 'verified' => true],
            ['slug' => 'wewangi-rumah', 'name' => 'Wewangi Rumah', 'city' => 'Denpasar', 'verified' => false],
            ['slug' => 'anyaman-ibu-sari', 'name' => 'Anyaman Ibu Sari', 'city' => 'Tasikmalaya', 'verified' => false],
            ['slug' => 'hutan-lestari', 'name' => 'Hutan Lestari', 'city' => 'Mataram', 'verified' => true],
            ['slug' => 'tongkonan-weave', 'name' => 'Tongkonan Weave', 'city' => 'North Toraja', 'verified' => true],
        ];

        foreach ($sellers as $seller) {
            Seller::query()->updateOrCreate(['slug' => $seller['slug']], $seller);
        }
    }
}
