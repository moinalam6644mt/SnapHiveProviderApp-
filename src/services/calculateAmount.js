export const getNumericRate = (rateStr) => {
  if (!rateStr) return 0;
  const numeric = String(rateStr).match(/[\d.]+/);
  return numeric ? parseFloat(numeric[0]) : 0;
};

export const calculateAmount = ({
  duration_hours,
  rate,
  ot_price_per_minute,
  worked_minutes,
  cancelCharge = 0,
}) => {
  const numericRate = getNumericRate(rate);
  const price_per_minute = numericRate / 60;
  const duration_minutes = Number(duration_hours || 0) * 60;

  const numeric_ot_price = Number(ot_price_per_minute || 0);
  const numeric_worked_minutes = Number(worked_minutes || 0);
  const numeric_cancelCharge = Number(cancelCharge || 0);

  let final_amount = 0;
  let working_minutes = 0;
  let extra_minutes = 0;
  let baseAmount = 0;
  let otAmount = 0;

  if (numeric_worked_minutes <= duration_minutes) {
    working_minutes = numeric_worked_minutes;
    baseAmount = numeric_worked_minutes * price_per_minute;
  } else {
    working_minutes = duration_minutes;
    extra_minutes = numeric_worked_minutes - duration_minutes;

    baseAmount = duration_minutes * price_per_minute;
    otAmount = extra_minutes * numeric_ot_price;
  }

  final_amount = baseAmount + otAmount + numeric_cancelCharge;

  return {
    workingMinutes: working_minutes,
    overtimeMinutes: extra_minutes,
    workingSeconds: Math.round(working_minutes * 60),
    overtimeSeconds: Math.round(extra_minutes * 60),
    baseAmount: baseAmount,
    otAmount: otAmount,
    cancelCharge: numeric_cancelCharge,
    totalAmount: final_amount,
    isOvertime: extra_minutes > 0,
    numericRate,
  };
};