// server/index.js

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = 5000;

app.use(cors({
  origin: 'https://sleeper-league-median-visualization-u9aq.onrender.com'
}));

// Helper functions to interact with Sleeper API
async function getUserId(username) {
  try {
    const response = await axios.get(`https://api.sleeper.app/v1/user/${username}`);
    return response.data.user_id;
  } catch (error) {
    return null;
  }
}

async function getUserLeagues(user_id, sport = 'nfl', season = '2024') {
  const response = await axios.get(`https://api.sleeper.app/v1/user/${user_id}/leagues/${sport}/${season}`);
  return response.data;
}

async function getCurrentWeek() {
  const response = await axios.get('https://api.sleeper.app/v1/state/nfl');
  return response.data.week;
}

async function getMatchups(league_id, week) {
  const response = await axios.get(`https://api.sleeper.app/v1/league/${league_id}/matchups/${week}`);
  return response.data;
}

async function getUsers(league_id) {
  const response = await axios.get(`https://api.sleeper.app/v1/league/${league_id}/users`);
  return response.data;
}

async function getRosters(league_id) {
  const response = await axios.get(`https://api.sleeper.app/v1/league/${league_id}/rosters`);
  return response.data;
}

function buildTeamScores(matchups, users, rosters) {
  const userDict = {};
  users.forEach(user => {
    userDict[user.user_id] = {
      displayName: user.display_name,
      avatarId: user.avatar,
      teamName: user.metadata.team_name
    };
  });

  const rosterDict = {};
  rosters.forEach(roster => {
    rosterDict[roster.roster_id] = {
      ownerId: roster.owner_id,
      //teamName: roster.metadata && roster.metadata.team_name ? roster.metadata.team_name : 'Team ' + roster.roster_id
      teamName: userDict[roster.owner_id].teamName
    };
  });

  const teamScores = [];
  matchups.forEach(matchup => {
    const rosterInfo = rosterDict[matchup.roster_id];
    const ownerId = rosterInfo.ownerId;
    const user = userDict[ownerId] || { displayName: 'Unknown', avatarId: null };
    const points = matchup.points || 0;
    const avatarUrl = user.avatarId
      ? `https://sleepercdn.com/avatars/thumbs/${user.avatarId}`
      : null;

    teamScores.push({
      teamName: rosterInfo.teamName,
      userName: user.displayName,
      points,
      avatarUrl
    });
  });

  // Remove duplicates (in case of multiple matchups)
  const uniqueTeamScores = Object.values(teamScores.reduce((acc, curr) => {
    acc[curr.teamName] = curr;
    return acc;
  }, {}));

  return uniqueTeamScores.sort((a, b) => b.points - a.points);
}



function calculateLeagueMedian(teamScores) {
  const numTeams = teamScores.length;
  let medianIndex, median;
  if (numTeams < 7) {
    medianIndex = Math.floor(numTeams / 2) - 1;
    median = (teamScores[medianIndex].points + teamScores[medianIndex + 1].points) / 2;
  } else {
    medianIndex = 5;
    median = (teamScores[5].points + teamScores[6].points) / 2;
  }
  return { median, medianIndex };
}

// API Endpoints
app.get('/api/user/:username', async (req, res) => {
  const username = req.params.username;
  const userId = await getUserId(username);
  if (!userId) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json({ userId });
});

app.get('/api/leagues/:userId', async (req, res) => {
  const userId = req.params.userId;
  const leagues = await getUserLeagues(userId);
  res.json(leagues);
});

app.get('/api/weeks', async (req, res) => {
  const currentWeek = await getCurrentWeek();
  const weeks = Array.from({ length: currentWeek }, (_, i) => i + 1);
  res.json(weeks);
});

app.get('/api/median', async (req, res) => {
  const { leagueId, week } = req.query;
  try {
    const [matchups, users, rosters] = await Promise.all([
      getMatchups(leagueId, week),
      getUsers(leagueId),
      getRosters(leagueId),
    ]);

    const teamScores = buildTeamScores(matchups, users, rosters);

    if (!teamScores.length) {
      return res.status(404).json({ error: 'No matchup data available' });
    }

    const { median, medianIndex } = calculateLeagueMedian(teamScores);

    res.json({
      teamScores,
      median,
      medianIndex,
    });
  } catch (error) {
    console.error('Error fetching median data:', error);
    res.status(500).json({ error: 'Error fetching median data' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
