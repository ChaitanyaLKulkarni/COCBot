import React, { useState, useEffect, useRef, useCallback } from "react";
import MatchInfo from "./components/MatchInfo";
import PlayerInfo from "./components/PlayerInfo";
import "./App.css";
function App() {
    const chName = useRef(
        window.location.pathname.split("/").slice(-1)[0].trim()
    ); //Holds Channel Name
    const [matchData, setMatchData] = useState({}); //Holds Current Match Data

    //Hold PrevData
    const [prevData, setPrevData] = useState([]);
    //Timer for setIntervals
    const timer = useRef(null);

    const fetchData = useCallback(() => {
        //If Channel Name is Not there return
        if (chName.current === "") return;
        //get Report related to Channel Name
        fetch(`/api/${chName.current}`)
            .then((res) => res.json())
            .then((data) => {
                //If got error in report return or invalid data
                if (data.status !== 200 || data.noPlayers < 0) return;
                //Set matchData to currentely feteched data
                setMatchData((currData) => {
                    //Check if Different match
                    // i.e. new lobby
                    if (currData.matchId !== data.matchId) {
                        //If current lobby was started then put it in PrevData
                        if (currData && currData.started) {
                            setPrevData((p) => {
                                if (
                                    p.some(
                                        (m) => m.matchId === currData.matchId
                                    )
                                )
                                    return p;
                                const winner = currData.players
                                    .filter((player) => player.finished)
                                    .sort((a, b) => a.rank - b.rank)[0];
                                const r = [
                                    {
                                        matchId: currData.matchId,
                                        mode: currData.mode,
                                        winner: winner,
                                    },
                                    ...p,
                                ];
                                return r;
                            });
                        }
                    }
                    return data;
                });
            });
    }, []);

    useEffect(() => {
        fetch(`/api/prev/${chName.current}`)
            .then((d) => d.json())
            .then((prevMatches) => {
                setPrevData(prevMatches);
            });
        fetchData();
        timer.current = setInterval(() => fetchData(), 6000);

        //Cleanup code for timer
        return () => {
            clearInterval(timer.current);
            timer.current = null;
        };
    }, [fetchData]);

    return (
        <div className="App">
            {
                <center>
                    <h2>{chName.current || "plz GOTO: /web/<ChannelName>"}</h2>
                </center>
            }
            {chName.current && (
                <div id="main">
                    <MatchInfo matchData={matchData} />
                    <div style={{ marginBottom: 5 }}>
                        <span
                            style={{ fontSize: "20px", fontWeight: "bolder" }}
                        >
                            Winners
                        </span>
                        :
                    </div>
                    <div id="prev-container">
                        {prevData.map((data) => (
                            <PlayerInfo
                                key={data.matchId}
                                playerData={data.winner}
                                matchData={data}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;
