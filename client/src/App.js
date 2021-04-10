import React, { useState, useEffect, useRef } from "react";
import MatchInfo from "./components/MatchInfo";
import PlayerInfo from "./components/PlayerInfo";
import "./App.css";

function App() {
    const chName = useRef(window.location.pathname.split("/").slice(-1)[0]); //Holds Channle Name
    const [matchData, setMatchData] = useState({}); //Holds Current Match Data

    //Hold PrevData Initilized by getting `prevData` from localStorage
    const [prevData, setPrevData] = useState(
        JSON.parse(window.localStorage.getItem("prevData")) || []
    );
    //Timer for setIntervals
    const timer = useRef(null);

    const fetchData = () => {
        //If Channle Name is Not there return
        if (!chName.current) return;

        //get Report related to Channle Name
        fetch(`/api/${chName.current}`)
            .then((res) => res.json())
            .then((data) => {
                //If got error in report return
                if (data.status !== 200) return;

                //Set matchData to currentely feteched data
                setMatchData((currData) => {
                    //Check if Different match
                    // i.e. new lobby
                    if (currData.matchId !== data.matchId) {
                        //If current lobby was started then put it in PrevData and Save to localStorae
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
                                window.localStorage.setItem(
                                    "prevData",
                                    JSON.stringify(r)
                                );
                                return r;
                            });
                        }
                    }
                    return data;
                });
            });
    };

    useEffect(() => {
        fetchData();
        timer.current = setInterval(() => fetchData(), 5000);
        fetch("/start");

        //Cleanup code for timer
        return () => {
            clearInterval(timer.current);
            timer.current = null;
        };
    }, []);

    return (
        <div className="App">
            <h1>{chName.current || "GOTO : /web/<ChannleName>"}</h1>
            {chName.current && (
                <div id="main">
                    <MatchInfo matchData={matchData} />
                    <div id="prev-container">
                        Previous Winners:
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
