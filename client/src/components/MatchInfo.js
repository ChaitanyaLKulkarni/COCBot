import React from "react";
import PlayerInfo from "./PlayerInfo";

const TOP = 2;

function MatchInfo({ matchData: match }) {
    if (!match.started) {
        return (
            <div className="waiting-container">
                <h2>Waiting for Players</h2>
                <p>Current Players:{match.noPlayers}</p>
            </div>
        );
    }
    const tops = match.players
        .filter((player) => player.finished)
        .sort((a, b) => a.rank - b.rank)
        .slice(0, TOP);
    return (
        <div className="match-info">
            <h2>Mode:{match.mode}</h2>
            <p>Current Players:{match.noPlayers}</p>
            {tops.map((player) => (
                <PlayerInfo key={player.name} playerData={player} />
            ))}
            {tops.length === 0 && <h2>Clashining..</h2>}
        </div>
    );
}

export default MatchInfo;
