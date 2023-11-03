/* eslint-disable prefer-const */
/* eslint-disable no-plusplus */
function getWeekdayCount(startDate, endDate) {
    const oneDay = 24 * 60 * 60 * 1000; // One day in milliseconds
  
    // Set the start and end dates to the beginning of the day
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);
  
    let weekdayCount = 0;
    let currentDate = new Date(startDate.getTime());
  
    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();
  
      // Check if the current day is a weekday (0: Sunday, 6: Saturday)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        weekdayCount++;
      }
  
      currentDate.setTime(currentDate.getTime() + oneDay);
    }
  
    return weekdayCount;
  }
  
  module.exports = getWeekdayCount;
  