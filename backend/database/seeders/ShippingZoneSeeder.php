<?php

namespace Database\Seeders;

use App\Models\ShippingZone;
use Illuminate\Database\Seeder;

class ShippingZoneSeeder extends Seeder
{
    public function run(): void
    {
        $zones = [
            [
                'name' => 'Jabodetabek',
                'description' => 'Jakarta, Bogor, Depok, Tangerang, Bekasi.',
                'cities' => ['Jakarta', 'Bogor', 'Depok', 'Tangerang', 'Bekasi', 'Tangerang Selatan'],
                'cost' => 12_000,
                'etd' => '1-2',
                'sort_order' => 1,
            ],
            [
                'name' => 'Pulau Jawa',
                'description' => 'Kota-kota besar di Pulau Jawa di luar Jabodetabek.',
                'cities' => ['Bandung', 'Semarang', 'Surabaya', 'Yogyakarta', 'Malang', 'Solo'],
                'cost' => 22_000,
                'etd' => '2-3',
                'sort_order' => 2,
            ],
            [
                'name' => 'Luar Jawa',
                'description' => 'Sumatera, Kalimantan, Sulawesi, Bali, dan sekitarnya.',
                'cities' => ['Medan', 'Pekanbaru', 'Palembang', 'Denpasar', 'Makassar', 'Manado', 'Banjarmasin', 'Pontianak'],
                'cost' => 45_000,
                'etd' => '4-7',
                'sort_order' => 3,
            ],
        ];

        foreach ($zones as $zone) {
            ShippingZone::query()->updateOrCreate(['name' => $zone['name']], $zone + ['is_active' => true]);
        }
    }
}
