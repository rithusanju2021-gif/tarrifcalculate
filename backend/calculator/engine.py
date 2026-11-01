from decimal import Decimal, ROUND_HALF_UP


def to_decimal(val, default='0.00'):
    if val is None or val == '':
        return Decimal(default)
    try:
        return Decimal(str(val))
    except Exception:
        return Decimal(default)


def round_curr(val):
    return val.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)


def calculate_daily_rental(
    actual_km,
    day_rent,
    fuel_cost_per_km,
    included_km,
    km_rate,
    driver_bata,
    pricing_method=None  # None for auto, 1 for Method 1, 2 for Method 2
):
    """
    Calculates single day rental cost according to Rithish Tours & Travels tariff rules:

    Method 1: Day Rent + Fuel Cost
      When actual daily distance <= entered included kilometre limit (or user forces Method 1):
      Daily Cost = Day Rent + (Actual Daily KM * Fuel Cost per KM) + Driver Bata

    Method 2: KM-Based Calculation
      When actual daily distance > entered included kilometre limit (or user forces Method 2):
      Daily Cost = (Entire Actual Daily KM * Entered KM Rate) + Driver Bata
      * IMPORTANT: KM rate applies to the ENTIRE distance, not just extra km.
      * Day Rent and Fuel Cost are NOT added in Method 2.
    """
    actual_km = to_decimal(actual_km)
    day_rent = to_decimal(day_rent)
    fuel_cost_per_km = to_decimal(fuel_cost_per_km)
    included_km = to_decimal(included_km, default='250.00')
    km_rate = to_decimal(km_rate)
    driver_bata = to_decimal(driver_bata)

    # Determine method applied
    if pricing_method in (1, '1', 'method_1'):
        applied_method = 1
        is_manual_override = True
    elif pricing_method in (2, '2', 'method_2'):
        applied_method = 2
        is_manual_override = True
    else:
        # Automatic determination based on editable included_km
        applied_method = 1 if actual_km <= included_km else 2
        is_manual_override = False

    if applied_method == 1:
        fuel_charge = round_curr(actual_km * fuel_cost_per_km)
        total_cost = round_curr(day_rent + fuel_charge + driver_bata)
        formula = f"₹{day_rent:.2f} (Day Rent) + ({actual_km:.2f} km × ₹{fuel_cost_per_km:.2f} Fuel) [₹{fuel_charge:.2f}] + ₹{driver_bata:.2f} (Bata)"
        method_name = "Method 1: Day Rent + Fuel Cost"
        method_explanation = f"Actual distance ({actual_km:.2f} km) is within or equal to included limit ({included_km:.2f} km)."
    else:
        entire_km_charge = round_curr(actual_km * km_rate)
        total_cost = round_curr(entire_km_charge + driver_bata)
        formula = f"({actual_km:.2f} km Entire Distance × ₹{km_rate:.2f} KM Rate) [₹{entire_km_charge:.2f}] + ₹{driver_bata:.2f} (Bata)"
        method_name = "Method 2: KM-Based Calculation"
        method_explanation = f"Actual distance ({actual_km:.2f} km) exceeds included limit ({included_km:.2f} km). KM rate applied to entire distance."

    return {
        'actual_km': float(actual_km),
        'included_km': float(included_km),
        'day_rent': float(day_rent),
        'fuel_cost_per_km': float(fuel_cost_per_km),
        'km_rate': float(km_rate),
        'driver_bata': float(driver_bata),
        'applied_method': applied_method,
        'method_name': method_name,
        'method_explanation': method_explanation,
        'is_manual_override': is_manual_override,
        'total_cost': float(total_cost),
        'formula': formula,
    }


def calculate_multiday_tour(days_data):
    """
    Calculates cost for a multi-day tour package.
    days_data is a list of dicts:
    [
        {
            'day_number': 1,
            'title': 'Chennai to Mahabalipuram & Pondicherry',
            'actual_km': 165.5,
            'day_rent': 3800,
            'fuel_cost_per_km': 16,
            'included_km': 250,
            'km_rate': 19,
            'driver_bata': 500,
            'pricing_method': None,  # or 1, or 2
            'overnight_halt': 'Pondicherry',
            'stops': [...]
        },
        ...
    ]
    """
    calculated_days = []
    total_tour_km = Decimal('0.00')
    total_tour_cost = Decimal('0.00')

    for day in days_data:
        day_calc = calculate_daily_rental(
            actual_km=day.get('actual_km', 0),
            day_rent=day.get('day_rent', 0),
            fuel_cost_per_km=day.get('fuel_cost_per_km', 0),
            included_km=day.get('included_km', 250),
            km_rate=day.get('km_rate', 0),
            driver_bata=day.get('driver_bata', 0),
            pricing_method=day.get('pricing_method')
        )

        day_km = to_decimal(day.get('actual_km', 0))
        day_cost = Decimal(str(day_calc['total_cost']))

        total_tour_km += day_km
        total_tour_cost += day_cost

        calculated_days.append({
            'day_number': day.get('day_number', len(calculated_days) + 1),
            'title': day.get('title', f"Day {len(calculated_days) + 1}"),
            'overnight_halt': day.get('overnight_halt', ''),
            'stops': day.get('stops', []),
            **day_calc
        })

    return {
        'days': calculated_days,
        'total_tour_km': float(round_curr(total_tour_km)),
        'total_tour_cost': float(round_curr(total_tour_cost)),
        'days_count': len(calculated_days),
    }
