import { Dropdown } from '../common';

/**
 * Player Selector Component
 * Three dropdowns for Striker, Non-Striker, Bowler
 */
const PlayerSelector = ({
  match,
  currentInnings,
  striker,
  nonStriker,
  bowler,
  onStrikerChange,
  onNonStrikerChange,
  onBowlerChange
}) => {
  // Get batting and bowling teams based on current innings (handle both identifier and actual name)
  const bt = currentInnings?.battingTeam?.trim();
  const isTeam1Batting = bt === match?.team1?.name?.trim() || bt === 'team1';
  const battingTeam = isTeam1Batting ? match?.team1 : match?.team2;
  const bowlingTeam = isTeam1Batting ? match?.team2 : match?.team1;

  // Format players for dropdown - exclude batsmen who are already out (match by name, not playerId)
  const outBatsmenNames = currentInnings?.currentBatsmen
    ?.filter(b => b.isOut)
    .map(b => b.name?.trim().toLowerCase()) || [];

  const battingTeamPlayers = battingTeam?.players
    ?.filter(player => !outBatsmenNames.includes(player.name?.trim().toLowerCase()))
    ?.map(player => ({
      value: player.playerId,
      label: player.name
    })) || [];

  const bowlingTeamPlayers = bowlingTeam?.players?.map(player => ({
    value: player.playerId,
    label: player.name
  })) || [];

  return (
    <div className="grid grid-cols-3 gap-3 mb-4">
      <Dropdown
        label="Striker"
        value={striker}
        options={battingTeamPlayers}
        onChange={onStrikerChange}
        placeholder="Select striker"
      />

      <Dropdown
        label="Non-Striker"
        value={nonStriker}
        options={battingTeamPlayers}
        onChange={onNonStrikerChange}
        placeholder="Select non-striker"
      />

      <Dropdown
        label="Bowler"
        value={bowler}
        options={bowlingTeamPlayers}
        onChange={onBowlerChange}
        placeholder="Select bowler"
      />
    </div>
  );
};

export default PlayerSelector;
