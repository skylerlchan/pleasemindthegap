import React, { useState, useEffect } from 'react';

interface LiveTimeIndicatorProps {
  currentDate: Date;
  viewDays: Date[];
  hourHeight: number;
  timeSlots: string[];
}

export const LiveTimeIndicator: React.FC<LiveTimeIndicatorProps> = ({
  currentDate,
  viewDays,
  hourHeight,
  timeSlots
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Update current time every 30 seconds for smooth movement
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Check if any of the view days is today
  const today = new Date();
  const todayColumnIndex = viewDays.findIndex(date => 
    date.toDateString() === today.toDateString()
  );

  // Don't render if today is not in the current view
  if (todayColumnIndex === -1) {
    return null;
  }

  // Calculate position based on current time
  const currentHour = currentTime.getHours();
  const currentMinute = currentTime.getMinutes();

  // Find the starting hour of our time slots (6 AM)
  const startHour = 6;
  
  // Don't show indicator if current time is before 6 AM or after 11 PM
  if (currentHour < startHour || currentHour > 23) {
    return null;
  }

  // Calculate the top position
  // Each hour slot is hourHeight pixels tall
  // We need to account for the holding section height (180px) and headers
  const holdingSectionHeight = 180;
  const headerHeight = 80; // Approximate header height
  
  const hoursFromStart = currentHour - startHour;
  const minuteOffset = (currentMinute / 60) * hourHeight;
  const topPosition = headerHeight + holdingSectionHeight + (hoursFromStart * hourHeight) + minuteOffset;

  // Calculate which columns to span based on view
  const gridColumns = viewDays.length === 7 ? 'repeat(7, 1fr)' : 
                     viewDays.length === 2 ? 'repeat(2, 1fr)' : 
                     '1fr';

  return (
    <div 
      className="absolute left-0 right-0 z-40 pointer-events-none"
      style={{ 
        top: `${topPosition}px`,
      }}
    >
      {/* Super thin line - just 1px red line */}
      <div className="w-full h-px bg-red-500"></div>
    </div>
  );
};