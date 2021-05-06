import React from "react";

export default function P4ConsPlayers({ data }) {
    // Show most played players
    // Show most played players with respect to modes
    const mostPlayed = data.players.sort((a, b) => b.total - a.total);
    console.log(mostPlayed);
    return <div></div>;
}
