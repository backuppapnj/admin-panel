
export function getYearOptions(startYear: number = 2018): number[] {
    const currentYear = new Date().getFullYear();
    const years = [];
    // Generate years from current year down to startYear (descending)
    // We add +1 to currentYear to allow planning for next year if needed, 
    // or just currentYear. User said "hingga sekarang", so currentYear is safe.
    // Let's stick to currentYear + 1 just in case they need to input ahead, 
    // but strictly user said "sekarang". Let's do currentYear.
    // Actually, often systems allow +1 year. But let's stick to currentYear for now.
    for (let year = currentYear; year >= startYear; year--) {
        years.push(year);
    }
    return years;
}
