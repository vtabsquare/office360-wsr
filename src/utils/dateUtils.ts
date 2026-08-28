export const calculateDynamicDateRange = () => {
  const today = new Date();
  const lastMonday = new Date(today);
  lastMonday.setDate(today.getDate() - (today.getDay() === 0 ? 6 : today.getDay() - 1) - 7);
  
  const lastSaturday = new Date(lastMonday);
  lastSaturday.setDate(lastMonday.getDate() + 5);

  const fmtDate = (d: Date) => {
    const day = d.getDate();
    const suf = (day > 3 && day < 21) ? 'th' : (day % 10 === 1 ? 'st' : day % 10 === 2 ? 'nd' : day % 10 === 3 ? 'rd' : 'th');
    return `${day}${suf} ${d.toLocaleDateString('en-US', { month: 'short' })}`;
  };
  
  return `${fmtDate(lastMonday)} – ${fmtDate(lastSaturday)} ${lastSaturday.getFullYear()}`;
};
