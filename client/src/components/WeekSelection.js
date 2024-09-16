// client/src/components/WeekSelection.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const WeekSelection = ({ onWeekSelect }) => {
  const [weeks, setWeeks] = useState([]);
  const [selectedWeek, setSelectedWeek] = useState(1);

  useEffect(() => {
    axios.get('/api/weeks').then(response => {
      setWeeks(response.data);
      if (response.data.length > 0) {
        setSelectedWeek(response.data[response.data.length - 1]);
      }
    });
  }, []);

  const handleSubmit = e => {
    e.preventDefault();
    onWeekSelect(selectedWeek);
  };

  return (
    <div className='form-container'>
      <h2>Select a Week</h2>
      <form onSubmit={handleSubmit}>
        <select
          value={selectedWeek}
          onChange={e => setSelectedWeek(e.target.value)}
        >
          {weeks.map(week => (
            <option key={week} value={week}>
              Week {week}
            </option>
          ))}
        </select>
        <button type="submit">Show Median</button>
      </form>
    </div>
  );
};

export default WeekSelection;