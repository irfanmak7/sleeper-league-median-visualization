// client/src/components/MedianVisualization.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const backendUrl = process.env.REACT_APP_BACKEND_URL;
const MedianVisualization = ({ leagueId, week, onChangeLeague, onChangeWeek }) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);


  useEffect(() => {
    let isMounted = true; // To prevent state updates on unmounted components
    let intervalId;
  
    const fetchData = () => {
      setError('');
      axios
        .get(`${backendUrl}/api/median`, { params: { leagueId, week } })
        .then(response => {
          if (isMounted) {
            setData(response.data);
            setLastUpdated(new Date());
          }
        })
        .catch(error => {
          console.error('Error fetching median data:', error);
          if (isMounted) {
            setError('No data available for the selected league and week.');
          }
        });
    };
  
    fetchData(); // Fetch data immediately when component mounts
  
    intervalId = setInterval(fetchData, 30000); // Fetch data every 30 seconds
  
    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [leagueId, week]);
  

  if (error) {
    return (
      <div>
        <p className="error-message">{error}</p>
        <div className="nav">
          <button onClick={onChangeWeek}>Change Week</button>
          <button onClick={onChangeLeague}>Change League</button>
        </div>
      </div>
    );
  }

  if (!data) {
    return <p className="message">Loading...</p>;
  }

  const { teamScores, median, medianIndex } = data;

  return (
    <div>
      <h2>League Median Visualization - Week {week}</h2>
      <div className="nav">
        <button onClick={onChangeLeague}>Change League</button>
        <button onClick={onChangeWeek}>Change Week</button>
      </div>
      <div className="team-list">
        {teamScores.map((team, index) => {
          const isBeforeMedian = index === medianIndex;

          return (
            <div key={team.teamName}>
              <div className={`team ${isBeforeMedian ? 'no-border' : ''}`}>
                <img
                  src={team.avatarUrl || '/default-avatar.png'}
                  alt={`${team.userName}'s avatar`}
                />
                <div className="team-info">
                  <span className="team-name">
                    {/* {index + 1}. {team.teamName}: {team.points} pts */}
                    {team.teamName}: {team.points} pts
                  </span>
                  <span className="user-name">{team.userName}</span>
                </div>
              </div>
              {index === medianIndex && <div className="red-line"></div>}
            </div>
          );
        })}
      </div>
      <p className="median">League Median: {median.toFixed(2)} pts</p>
      {lastUpdated && (<p className="last-updated">Last updated at {lastUpdated.toLocaleTimeString()}
  </p>
)}

    </div>
  );
};

export default MedianVisualization;
