/**
 * Shared Pricing Engine for Rithish Tours & Travels.
 * Perfectly mirrors backend logic for instant real-time calculations.
 */

export function calculateDailyRental({
  actual_km = 0,
  day_rent = 0,
  fuel_cost_per_km = 0,
  included_km = 250,
  km_rate = 0,
  driver_bata = 0,
  pricing_method = null, // null for auto, 1 for Method 1, 2 for Method 2
}) {
  const km = Math.max(0, parseFloat(actual_km) || 0);
  const rent = Math.max(0, parseFloat(day_rent) || 0);
  const fuelRate = Math.max(0, parseFloat(fuel_cost_per_km) || 0);
  const incLimit = Math.max(0, parseFloat(included_km) || 250);
  const ratePerKm = Math.max(0, parseFloat(km_rate) || 0);
  const bata = Math.max(0, parseFloat(driver_bata) || 0);

  let appliedMethod;
  let isManualOverride = false;

  if (pricing_method === 1 || pricing_method === '1' || pricing_method === 'method_1') {
    appliedMethod = 1;
    isManualOverride = true;
  } else if (pricing_method === 2 || pricing_method === '2' || pricing_method === 'method_2') {
    appliedMethod = 2;
    isManualOverride = true;
  } else {
    // Auto method: Method 1 if km <= incLimit, otherwise Method 2
    appliedMethod = km <= incLimit ? 1 : 2;
    isManualOverride = false;
  }

  let totalCost = 0;
  let formula = '';
  let methodName = '';
  let methodExplanation = '';

  if (appliedMethod === 1) {
    const fuelCharge = Math.round(km * fuelRate * 100) / 100;
    totalCost = Math.round((rent + fuelCharge + bata) * 100) / 100;
    formula = `₹${rent.toFixed(2)} (Day Rent) + (${km.toFixed(2)} km × ₹${fuelRate.toFixed(2)} Fuel) [₹${fuelCharge.toFixed(2)}] + ₹${bata.toFixed(2)} (Bata)`;
    methodName = 'Method 1: Day Rent + Fuel Cost';
    methodExplanation = `Distance (${km.toFixed(2)} km) is within or equal to included limit (${incLimit.toFixed(2)} km).`;
  } else {
    // Method 2: Entire distance multiplied by KM rate + Driver Bata
    const entireKmCharge = Math.round(km * ratePerKm * 100) / 100;
    totalCost = Math.round((entireKmCharge + bata) * 100) / 100;
    formula = `(${km.toFixed(2)} km Entire Distance × ₹${ratePerKm.toFixed(2)} KM Rate) [₹${entireKmCharge.toFixed(2)}] + ₹${bata.toFixed(2)} (Bata)`;
    methodName = 'Method 2: KM-Based Calculation';
    methodExplanation = `Distance (${km.toFixed(2)} km) exceeds included limit (${incLimit.toFixed(2)} km). KM rate applied to entire distance.`;
  }

  return {
    actual_km: km,
    included_km: incLimit,
    day_rent: rent,
    fuel_cost_per_km: fuelRate,
    km_rate: ratePerKm,
    driver_bata: bata,
    applied_method: appliedMethod,
    method_name: methodName,
    method_explanation: methodExplanation,
    is_manual_override: isManualOverride,
    total_cost: totalCost,
    formula,
  };
}

export function calculateMultiDayTour(daysData = []) {
  let totalKm = 0;
  let totalCost = 0;

  const calculatedDays = daysData.map((day, idx) => {
    const calc = calculateDailyRental({
      actual_km: day.actual_km,
      day_rent: day.day_rent,
      fuel_cost_per_km: day.fuel_cost_per_km,
      included_km: day.included_km,
      km_rate: day.km_rate,
      driver_bata: day.driver_bata,
      pricing_method: day.pricing_method,
    });

    totalKm += calc.actual_km;
    totalCost += calc.total_cost;

    return {
      ...day,
      day_number: day.day_number || idx + 1,
      ...calc,
    };
  });

  return {
    days: calculatedDays,
    total_tour_km: Math.round(totalKm * 100) / 100,
    total_tour_cost: Math.round(totalCost * 100) / 100,
    days_count: calculatedDays.length,
  };
}
