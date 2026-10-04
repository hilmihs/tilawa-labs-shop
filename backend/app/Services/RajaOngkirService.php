<?php

namespace App\Services;

use GuzzleHttp\Client;
use Illuminate\Support\Arr;
use Illuminate\Validation\ValidationException;

class RajaOngkirService
{
    public function __construct(private readonly Client $client = new Client)
    {
    }

    public function quote(string $destinationCityId, string $courier, int $weightGrams): array
    {
        $apiKey = config('services.rajaongkir.api_key');
        $originCityId = config('services.rajaongkir.origin_city_id');

        if (! $apiKey || ! $originCityId) {
            throw ValidationException::withMessages([
                'shipping' => 'RajaOngkir is not configured.',
            ]);
        }

        $response = $this->client->post(rtrim(config('services.rajaongkir.base_url'), '/').'/cost', [
            'headers' => ['key' => $apiKey],
            'form_params' => [
                'origin' => $originCityId,
                'destination' => $destinationCityId,
                'weight' => $weightGrams,
                'courier' => $courier,
            ],
        ]);

        $payload = json_decode((string) $response->getBody(), true);
        $costs = Arr::get($payload, 'rajaongkir.results.0.costs', []);

        return collect($costs)->map(function (array $cost) use ($courier, $originCityId, $destinationCityId, $weightGrams): array {
            $firstCost = $cost['cost'][0] ?? [];

            return [
                'provider' => 'rajaongkir',
                'courier' => $courier,
                'service' => $cost['service'],
                'description' => $cost['description'] ?? null,
                'cost' => (int) ($firstCost['value'] ?? 0),
                'etd' => $firstCost['etd'] ?? null,
                'origin_city_id' => (string) $originCityId,
                'destination_city_id' => $destinationCityId,
                'weight_grams' => $weightGrams,
            ];
        })->values()->all();
    }
}
