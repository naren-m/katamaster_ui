import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/apiService';

type CalendarDay = {
  date: string;
  sessions: number;
  total_points: number;
  activities: string[];
  duration: number;
};

type CalendarViewProps = {
  userId: string;
  onDateClick?: (date: string) => void;
};

export const CalendarView: React.FC<CalendarViewProps> = ({ userId, onDateClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState<CalendarDay[]>([]);
  const [loading, setLoading] = useState(true);

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  useEffect(() => {
    loadCalendarData();
  }, [currentYear, currentMonth, userId]);

  const loadCalendarData = async () => {
    setLoading(true);
    try {
      const data = await apiService.getCalendarData(
        userId, 
        currentYear.toString(), 
        (currentMonth + 1).toString()
      );
      setCalendarData(data.calendar_data || []);
    } catch (error) {
      console.error('Failed to load calendar data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const getDateString = (day: number) => {
    return `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const getDataForDate = (dateString: string) => {
    return calendarData.find(day => day.date === dateString);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const days: (number | null)[] = [];

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  // Add all days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day);
  }

  if (loading) {
    return <div className="text-center p-4">Loading calendar...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigateMonth('prev')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          ←
        </button>
        <h2 className="text-xl font-bold text-gray-800">
          {monthNames[currentMonth]} {currentYear}
        </h2>
        <button
          onClick={() => navigateMonth('next')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          →
        </button>
      </div>

      {/* Week Days Header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map(day => (
          <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          if (day === null) {
            return <div key={index} className="h-16"></div>;
          }

          const dateString = getDateString(day);
          const dayData = getDataForDate(dateString);
          const hasActivity = dayData && dayData.sessions > 0;
          const isToday = new Date().toDateString() === new Date(currentYear, currentMonth, day).toDateString();

          return (
            <div
              key={day}
              onClick={() => onDateClick && onDateClick(dateString)}
              className={`
                h-16 border rounded-lg p-1 cursor-pointer transition-all hover:shadow-md
                ${isToday ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}
                ${hasActivity ? 'bg-green-50 border-green-300' : 'hover:bg-gray-50'}
              `}
            >
              <div className="text-sm font-medium text-gray-800">{day}</div>
              {hasActivity && (
                <div className="mt-1">
                  <div className="text-xs text-green-600 font-medium">
                    {dayData.total_points} pts
                  </div>
                  <div className="text-xs text-gray-500">
                    {dayData.sessions} session{dayData.sessions !== 1 ? 's' : ''}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center space-x-4 text-sm">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-blue-50 border border-blue-500 rounded mr-2"></div>
          <span>Today</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-green-50 border border-green-300 rounded mr-2"></div>
          <span>Practice Day</span>
        </div>
      </div>
    </div>
  );
};