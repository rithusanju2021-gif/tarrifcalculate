from django.test import TestCase
from .engine import calculate_daily_rental, calculate_multiday_tour


class CalculatorEngineTests(TestCase):
    def test_method1_below_included_limit(self):
        # 180 km is below included 250 km limit
        # Day rent: 3000, Fuel: 15/km, Bata: 500
        # Expected: 3000 + (180 * 15 = 2700) + 500 = 6200.00
        res = calculate_daily_rental(
            actual_km=180,
            day_rent=3000,
            fuel_cost_per_km=15,
            included_km=250,
            km_rate=18,
            driver_bata=500,
        )
        self.assertEqual(res['applied_method'], 1)
        self.assertEqual(res['total_cost'], 6200.00)
        self.assertFalse(res['is_manual_override'])

    def test_method1_exactly_equal_included_limit(self):
        # Boundary test: 250 km exactly equals 250 km limit
        # Expected Method 1: 3000 + (250 * 15 = 3750) + 500 = 7250.00
        res = calculate_daily_rental(
            actual_km=250,
            day_rent=3000,
            fuel_cost_per_km=15,
            included_km=250,
            km_rate=18,
            driver_bata=500,
        )
        self.assertEqual(res['applied_method'], 1)
        self.assertEqual(res['total_cost'], 7250.00)

    def test_method2_above_included_limit_applies_to_entire_distance(self):
        # 320 km exceeds included 250 km limit
        # KM rate: 18/km, Bata: 500
        # Must apply to ENTIRE 320 km! (320 * 18 = 5760) + 500 = 6260.00
        # Day rent and fuel cost must NOT be added.
        res = calculate_daily_rental(
            actual_km=320,
            day_rent=3000,
            fuel_cost_per_km=15,
            included_km=250,
            km_rate=18,
            driver_bata=500,
        )
        self.assertEqual(res['applied_method'], 2)
        self.assertEqual(res['total_cost'], 6260.00)

    def test_custom_included_km_limits(self):
        # Test 200 km limit
        res_200 = calculate_daily_rental(
            actual_km=220,
            day_rent=2500,
            fuel_cost_per_km=12,
            included_km=200,  # custom limit
            km_rate=15,
            driver_bata=400,
        )
        self.assertEqual(res_200['applied_method'], 2)
        self.assertEqual(res_200['total_cost'], (220 * 15) + 400)  # 3700.00

        # Test 400 km limit
        res_400 = calculate_daily_rental(
            actual_km=350,
            day_rent=2500,
            fuel_cost_per_km=12,
            included_km=400,  # custom limit
            km_rate=15,
            driver_bata=400,
        )
        self.assertEqual(res_400['applied_method'], 1)
        self.assertEqual(res_400['total_cost'], 2500 + (350 * 12) + 400)  # 7100.00

    def test_manual_method_override(self):
        # Force Method 1 even when km (300) > included_km (250)
        res_force1 = calculate_daily_rental(
            actual_km=300,
            day_rent=3000,
            fuel_cost_per_km=15,
            included_km=250,
            km_rate=18,
            driver_bata=500,
            pricing_method=1
        )
        self.assertEqual(res_force1['applied_method'], 1)
        self.assertTrue(res_force1['is_manual_override'])
        self.assertEqual(res_force1['total_cost'], 3000 + (300 * 15) + 500)

        # Force Method 2 even when km (150) <= included_km (250)
        res_force2 = calculate_daily_rental(
            actual_km=150,
            day_rent=3000,
            fuel_cost_per_km=15,
            included_km=250,
            km_rate=18,
            driver_bata=500,
            pricing_method=2
        )
        self.assertEqual(res_force2['applied_method'], 2)
        self.assertTrue(res_force2['is_manual_override'])
        self.assertEqual(res_force2['total_cost'], (150 * 18) + 500)

    def test_multiday_tour_independent_calculations(self):
        days_data = [
            # Day 1: 150 km <= 250 km (Method 1) -> 3000 + (150*15) + 500 = 5750
            {
                'day_number': 1,
                'actual_km': 150,
                'day_rent': 3000,
                'fuel_cost_per_km': 15,
                'included_km': 250,
                'km_rate': 18,
                'driver_bata': 500,
                'pricing_method': None,
            },
            # Day 2: 320 km > 250 km (Method 2) -> (320*18) + 500 = 6260
            {
                'day_number': 2,
                'actual_km': 320,
                'day_rent': 3000,
                'fuel_cost_per_km': 15,
                'included_km': 250,
                'km_rate': 18,
                'driver_bata': 500,
                'pricing_method': None,
            },
            # Day 3: 200 km with forced Method 2 -> (200*18) + 500 = 4100
            {
                'day_number': 3,
                'actual_km': 200,
                'day_rent': 3000,
                'fuel_cost_per_km': 15,
                'included_km': 250,
                'km_rate': 18,
                'driver_bata': 500,
                'pricing_method': 2,
            }
        ]

        result = calculate_multiday_tour(days_data)
        self.assertEqual(result['total_tour_km'], 150 + 320 + 200)  # 670.0
        self.assertEqual(result['total_tour_cost'], 5750 + 6260 + 4100)  # 16110.0
        self.assertEqual(result['days'][0]['applied_method'], 1)
        self.assertEqual(result['days'][1]['applied_method'], 2)
        self.assertEqual(result['days'][2]['applied_method'], 2)
        self.assertTrue(result['days'][2]['is_manual_override'])
