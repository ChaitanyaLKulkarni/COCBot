import React from "react";

function PlayerInfo({ playerData, index }) {
    const sec = Math.floor(playerData.duration / 1000);
    const duration = `${("00" + Math.floor(sec / 60)).slice(-2)}m:${(
        "00" + Math.floor(sec % 60)
    ).slice(-2)}s`;
    return (
        <div
            className={
                "player-info " +
                (index !== undefined
                    ? index % 2 === 0
                        ? "light"
                        : "dark"
                    : "")
            }
        >
            <div>{playerData.language}</div>
            <div>{playerData.name}</div>
            <div>{duration}</div>
        </div>
    );
}

export default PlayerInfo;
