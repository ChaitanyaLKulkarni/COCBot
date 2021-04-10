import React from "react";

function PlayerInfo({ playerData }) {
    const sec = Math.floor(playerData.duration / 1000);
    const duration = `${("00" + Math.floor(sec / 60)).slice(-2)}m:${(
        "00" + Math.floor(sec % 60)
    ).slice(-2)}s`;
    return (
        <div className="player-info">
            <div>{playerData.language}</div>
            <div>{playerData.name}</div>
            <div>{duration}</div>
        </div>
    );
}

export default PlayerInfo;
