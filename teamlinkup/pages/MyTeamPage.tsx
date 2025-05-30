
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Team, Player } from '../types';
import * as teamService from '../services/teamService';
import LoadingSpinner from '../components/LoadingSpinner';

const PlayerRow: React.FC<{ player: Player; onRemove: (id: string) => void; onEdit: (player: Player) => void }> = ({ player, onRemove, onEdit }) => (
  <tr className="border-b hover:bg-gray-50">
    <td className="py-3 px-4 text-gray-700">{player.name}</td>
    <td className="py-3 px-4 text-gray-700">{player.email}</td>
    <td className="py-3 px-4 text-gray-700">{player.age}</td>
    <td className="py-3 px-4 text-right space-x-2">
      <button onClick={() => onEdit(player)} className="text-blue-500 hover:text-blue-700 font-medium">Edit</button>
      <button onClick={() => onRemove(player.id)} className="text-red-500 hover:text-red-700 font-medium">Remove</button>
    </td>
  </tr>
);


const MyTeamPage: React.FC = () => {
  const { user } = useAuth();
  const [team, setTeam] = useState<Team | null>(null);
  const [teamName, setTeamName] = useState('');
  const [players, setPlayers] = useState<Player[]>([]);
  
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [playerName, setPlayerName] = useState('');
  const [playerEmail, setPlayerEmail] = useState('');
  const [playerAge, setPlayerAge] = useState<number | string>('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPlayerForm, setShowPlayerForm] = useState(false);

  const fetchTeam = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const fetchedTeam = await teamService.getTeamByInscriber(user.id);
      if (fetchedTeam) {
        setTeam(fetchedTeam);
        setTeamName(fetchedTeam.name);
        setPlayers(fetchedTeam.players);
      } else {
        // Default team name if new
        setTeamName(`${user.email.split('@')[0]}'s Team`);
      }
    } catch (error) {
      console.error("Error fetching team:", error);
      alert("Failed to load team data.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchTeam();
  }, [fetchTeam]);

  const handleAddOrUpdatePlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName || !playerEmail || playerAge === '') return;

    const ageNum = Number(playerAge);
    if (isNaN(ageNum) || ageNum <= 0) {
        alert("Please enter a valid age.");
        return;
    }

    if (editingPlayer) {
      setPlayers(players.map(p => p.id === editingPlayer.id ? { ...p, name: playerName, email: playerEmail, age: ageNum } : p));
    } else {
      setPlayers([...players, { id: teamService.generatePlayerId(), name: playerName, email: playerEmail, age: ageNum }]);
    }
    resetPlayerForm();
  };
  
  const resetPlayerForm = () => {
    setEditingPlayer(null);
    setPlayerName('');
    setPlayerEmail('');
    setPlayerAge('');
    setShowPlayerForm(false);
  }

  const handleEditPlayer = (player: Player) => {
    setEditingPlayer(player);
    setPlayerName(player.name);
    setPlayerEmail(player.email);
    setPlayerAge(player.age);
    setShowPlayerForm(true);
  };

  const handleRemovePlayer = (playerId: string) => {
    if (window.confirm("Are you sure you want to remove this player?")) {
      setPlayers(players.filter(p => p.id !== playerId));
    }
  };

  const handleSaveTeam = async () => {
    if (!user || !teamName) {
      alert("Team name is required.");
      return;
    }
    setSaving(true);
    try {
      const teamDataToSave: Omit<Team, 'id'> & { id?: string } = {
        inscriberId: user.id,
        name: teamName,
        players,
      };
      if (team?.id) {
        teamDataToSave.id = team.id;
      }
      const savedTeam = await teamService.createOrUpdateTeam(teamDataToSave);
      setTeam(savedTeam);
      setTeamName(savedTeam.name);
      setPlayers(savedTeam.players);
      alert("Team saved successfully!");
    } catch (error) {
      console.error("Error saving team:", error);
      alert("Failed to save team.");
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) return <LoadingSpinner message="Loading team data..." />;

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-xl">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">{team ? 'Edit Your Team' : 'Create Your Team'}</h2>
      
      <div className="mb-6">
        <label htmlFor="teamName" className="block text-gray-700 text-sm font-semibold mb-2">Team Name</label>
        <input
          type="text"
          id="teamName"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="Enter your team's name"
        />
      </div>

      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-700 mb-3">Players ({players.length})</h3>
        {players.length > 0 ? (
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age</th>
                  <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {players.map(player => (
                  <PlayerRow key={player.id} player={player} onRemove={handleRemovePlayer} onEdit={handleEditPlayer} />
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 italic">No players added yet.</p>
        )}
         <button 
            onClick={() => { setEditingPlayer(null); setShowPlayerForm(true); }} 
            className="mt-4 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
        >
            Add New Player
        </button>
      </div>

      {showPlayerForm && (
        <form onSubmit={handleAddOrUpdatePlayer} className="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="text-lg font-semibold text-gray-700 mb-4">{editingPlayer ? 'Edit Player' : 'Add New Player'}</h4>
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <div>
              <label htmlFor="playerName" className="block text-gray-700 text-sm font-semibold mb-1">Player Name</label>
              <input type="text" id="playerName" value={playerName} onChange={(e) => setPlayerName(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500" />
            </div>
            <div>
              <label htmlFor="playerEmail" className="block text-gray-700 text-sm font-semibold mb-1">Player Email</label>
              <input type="email" id="playerEmail" value={playerEmail} onChange={(e) => setPlayerEmail(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500" />
            </div>
            <div>
              <label htmlFor="playerAge" className="block text-gray-700 text-sm font-semibold mb-1">Player Age</label>
              <input type="number" id="playerAge" value={playerAge} onChange={(e) => setPlayerAge(e.target.value)} required min="1" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500" />
            </div>
          </div>
          <div className="flex justify-end space-x-3">
            <button type="button" onClick={resetPlayerForm} className="text-gray-600 hover:text-gray-800 py-2 px-4 rounded-md">Cancel</button>
            <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
              {editingPlayer ? 'Update Player' : 'Add Player'}
            </button>
          </div>
        </form>
      )}

      <button
        onClick={handleSaveTeam}
        disabled={saving || !teamName}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300 disabled:opacity-50 flex items-center justify-center"
      >
        {saving ? <LoadingSpinner size="sm" /> : (team ? 'Save Changes' : 'Create Team')}
      </button>
    </div>
  );
};

export default MyTeamPage;
