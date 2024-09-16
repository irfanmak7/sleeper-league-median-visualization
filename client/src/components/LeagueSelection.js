// client/src/components/LeagueSelection.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const LeagueSelection = ({ userId, onLeagueSelect }) => {
  const [leagues, setLeagues] = useState([]);
  const [selectedLeague, setSelectedLeague] = useState('');

  useEffect(() => {
    axios.get(`https://api.sleeper.app/v1/user/${userId}/leagues/nfl/2024`).then(response => {
      setLeagues(response.data);
      if (response.data.length > 0) {
        setSelectedLeague(response.data[0].league_id);
      }
    });
  }, [userId]);

  const handleSubmit = e => {
    e.preventDefault();
    onLeagueSelect(selectedLeague);
  };

  return (
    <div className='form-container'>
      <h2>Select a League</h2>
      <form onSubmit={handleSubmit}>
        <select
          value={selectedLeague}
          onChange={e => setSelectedLeague(e.target.value)}
        >
          {leagues.map(league => (
            <option key={league.league_id} value={league.league_id}>
              {league.name}
            </option>
          ))}
        </select>
        <button type="submit">Next</button>
      </form>
    </div>
  );
};

export default LeagueSelection;