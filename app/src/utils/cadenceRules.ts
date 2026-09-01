export function getDaysSinceCadenceStart(startDate: string | null): number {
  if (!startDate) return 0;
  const start = new Date(startDate).getTime();
  const now = new Date().getTime();
  if (isNaN(start)) return 0;
  return Math.max(0, Math.floor((now - start) / (24 * 60 * 60 * 1000)));
}

export function isDailyCheckinAvailable(lastDailySubmission: string | null): boolean {
  if (!lastDailySubmission) return true;
  
  const lastDate = new Date(lastDailySubmission);
  const now = new Date();
  
  return (
    lastDate.getUTCFullYear() !== now.getUTCFullYear() ||
    lastDate.getUTCMonth() !== now.getUTCMonth() ||
    lastDate.getUTCDate() !== now.getUTCDate()
  );
}

export function isWeeklyCheckinAvailable(
  weeklyCadenceStartDate: string | null,
  lastWeeklySubmission: string | null
): boolean {
  if (!weeklyCadenceStartDate) return false;
  
  const daysSinceStart = getDaysSinceCadenceStart(weeklyCadenceStartDate);
  // Weekly checkin is only due on Day 7, Day 14, Day 21... (at least 7 days since start)
  if (daysSinceStart < 7) {
    return false;
  }
  
  const current7DayPeriod = Math.floor(daysSinceStart / 7);
  if (!lastWeeklySubmission) return true;
  
  const daysSinceStartAtLastSub = Math.floor(
    (new Date(lastWeeklySubmission).getTime() - new Date(weeklyCadenceStartDate).getTime()) /
      (24 * 60 * 60 * 1000)
  );
  const lastSubPeriod = Math.floor(daysSinceStartAtLastSub / 7);
  
  return current7DayPeriod > lastSubPeriod;
}

export function getDaysUntilWeeklyCheckin(weeklyCadenceStartDate: string | null): number {
  if (!weeklyCadenceStartDate) return 7;
  const daysSinceStart = getDaysSinceCadenceStart(weeklyCadenceStartDate);
  if (daysSinceStart < 7) {
    return 7 - daysSinceStart;
  }
  const daysIntoCurrentPeriod = daysSinceStart % 7;
  return daysIntoCurrentPeriod === 0 ? 0 : 7 - daysIntoCurrentPeriod;
}

export function isMonthlyCheckinAvailable(
  monthlyCadenceStartDate: string | null,
  lastMonthlySubmission: string | null
): boolean {
  if (!monthlyCadenceStartDate) return false;
  
  const daysSinceStart = getDaysSinceCadenceStart(monthlyCadenceStartDate);
  // Monthly checkin is only due on Day 30, Day 60, Day 90... (at least 30 days since start)
  if (daysSinceStart < 30) {
    return false;
  }
  
  const current30DayPeriod = Math.floor(daysSinceStart / 30);
  if (!lastMonthlySubmission) return true;
  
  const daysSinceStartAtLastSub = Math.floor(
    (new Date(lastMonthlySubmission).getTime() - new Date(monthlyCadenceStartDate).getTime()) /
      (24 * 60 * 60 * 1000)
  );
  const lastSubPeriod = Math.floor(daysSinceStartAtLastSub / 30);
  
  return current30DayPeriod > lastSubPeriod;
}

export function getDaysUntilMonthlyCheckin(monthlyCadenceStartDate: string | null): number {
  if (!monthlyCadenceStartDate) return 30;
  const daysSinceStart = getDaysSinceCadenceStart(monthlyCadenceStartDate);
  if (daysSinceStart < 30) {
    return 30 - daysSinceStart;
  }
  const daysIntoCurrentPeriod = daysSinceStart % 30;
  return daysIntoCurrentPeriod === 0 ? 0 : 30 - daysIntoCurrentPeriod;
}
