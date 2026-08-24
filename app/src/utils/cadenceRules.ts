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
  if (!lastWeeklySubmission) return true;
  
  const lastSub = new Date(lastWeeklySubmission);
  const now = new Date();
  
  // Logic: Cadence resets every Tuesday at 06:00 UTC
  // Find the most recent Tuesday 06:00 UTC before "now"
  const getMostRecentReset = (date: Date) => {
    const resetDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 6, 0, 0, 0));
    const dayOfWeek = resetDate.getUTCDay(); // 0 = Sun, 1 = Mon, 2 = Tue
    
    // Shift back to Tuesday
    let daysToSubtract = (dayOfWeek - 2 + 7) % 7;
    if (daysToSubtract === 0 && date.getTime() < resetDate.getTime()) {
      // It's Tuesday but before 06:00 UTC, so the reset was last Tuesday
      daysToSubtract = 7;
    }
    
    resetDate.setUTCDate(resetDate.getUTCDate() - daysToSubtract);
    return resetDate;
  };
  
  const currentReset = getMostRecentReset(now);
  
  return lastSub.getTime() < currentReset.getTime();
}

export function isMonthlyCheckinAvailable(
  monthlyCadenceStartDate: string | null,
  lastMonthlySubmission: string | null
): boolean {
  if (!monthlyCadenceStartDate) return false;
  
  const now = new Date().getTime();
  const start = new Date(monthlyCadenceStartDate).getTime();
  const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
  
  // Number of 30-day periods passed since start
  const currentPeriod = Math.floor((now - start) / THIRTY_DAYS_MS);
  
  if (!lastMonthlySubmission) return true;
  
  const lastSub = new Date(lastMonthlySubmission).getTime();
  const lastSubPeriod = Math.floor((lastSub - start) / THIRTY_DAYS_MS);
  
  return currentPeriod > lastSubPeriod;
}
