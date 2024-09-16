// client/src/App.js

import React, { useState } from 'react';
import axios from 'axios';
import Header from './components/Header';
import LeagueSelection from './components/LeagueSelection';
import WeekSelection from './components/WeekSelection';
import MedianVisualization from './components/MedianVisualization';

function App() {
  const [username, setUsername] = useState('');
  const [userId, setUserId] = useState('');
  const [leagueId, setLeagueId] = useState('');
  const [week, setWeek] = useState('');
  const [error, setError] = useState('');

  const backendUrl = process.env.REACT_APP_BACKEND_URL;
  const handleUsernameSubmit = e => {
    e.preventDefault();
    setError('');
    axios
      .get(`${backendUrl}/api/user/${username}`)
      .then(response => {
        setUserId(response.data.userId);
      })
      .catch(error => {
        setError('User not found. Please check your username and try again.');
      });
  };

  const handleLeagueSelect = leagueId => {
    setLeagueId(leagueId);
  };

  const handleWeekSelect = week => {
    setWeek(week);
  };

  const resetLeague = () => {
    setLeagueId('');
    setWeek('');
  };

  const resetWeek = () => {
    setWeek('');
  };

  if (!userId) {
    return (
      <div>
        <Header />
        <div className="form-container">
          <h2>Enter your Sleeper username</h2>
          <form onSubmit={handleUsernameSubmit}>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              placeholder="Username"
              aria-label="Sleeper Username"
            />
            <button type="submit">Submit</button>
          </form>
          {error && <p className="error-message">{error}</p>}
        </div>
      </div>
    );
  }

  if (!leagueId) {
    return (
      <div>
        <Header />
        <LeagueSelection userId={userId} onLeagueSelect={handleLeagueSelect} />
      </div>
    );
  }

  if (!week) {
    return (
      <div>
        <Header />
        <WeekSelection onWeekSelect={handleWeekSelect} />
      </div>
    );
  }

  return (
    <div>
      <Header />
      <MedianVisualization
        leagueId={leagueId}
        week={week}
        onChangeLeague={resetLeague}
        onChangeWeek={resetWeek}
      />
    </div>
  );
}

export default App;
