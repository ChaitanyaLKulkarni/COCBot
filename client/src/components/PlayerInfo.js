import React from "react";
import pythonLogo from "../python.png";
import perlLog from "../perl.png";
function PlayerInfo({ playerData, index }) {
    const sec = Math.floor(playerData.duration / 1000);
    const duration = `${("00" + Math.floor(sec / 60)).slice(-2)}m:${(
        "00" + Math.floor(sec % 60)
    ).slice(-2)}s`;
    const language = playerData.language
        .toLowerCase()
        .replaceAll("+", "plus")
        .replaceAll("#", "sharp")
        .replaceAll(/[0-9]|-/g, "");
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
            {["python", "perl"].includes(language) ? (
                <img
                    className="icon"
                    src={language === "python" ? pythonLogo : perlLog}
                    alt={playerData.language}
                />
            ) : (
                <i className={`devicon-${language}-plain colored icon`}></i>
            )}
            <div className="name">
                <img
                    className="avatar"
                    src={
                        playerData.avatarId
                            ? `https://codingame.com/servlet/fileservlet?id=${playerData.avatarId}&format=profile_avatar`
                            : "https://static-aznet.codingame.com/assets/img_general_avatar.35fdfed1.png"
                    }
                    alt="Avatar"
                />
                {playerData.name}
            </div>
            <div className="duration">{duration}</div>
        </div>
    );
}

export default PlayerInfo;
