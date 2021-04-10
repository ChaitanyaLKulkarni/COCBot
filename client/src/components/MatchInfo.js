import React from "react";
import PlayerInfo from "./PlayerInfo";

const TOP = 2;

function isEmpty(obj) {
    return Object.keys(obj).length === 0;
}

function MatchInfo({ matchData: match }) {
    if (!match.started) {
        return (
            <div className="waiting-container">
                <h2>
                    {!isEmpty(match)
                        ? "Waiting for Players"
                        : "No Match Found!!!"}
                </h2>
                <p>
                    Players:<span className="no-player">{match.noPlayers}</span>
                </p>
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
            {tops.length === 0 && <h2>Clashining..</h2>}
            {tops.map((player, index) => (
                <PlayerInfo
                    key={player.name}
                    playerData={player}
                    index={index}
                />
            ))}
            <p>
                Players:
                <span className="no-player">{match.noPlayers}</span>
            </p>
        </div>
    );
}

export default MatchInfo;
