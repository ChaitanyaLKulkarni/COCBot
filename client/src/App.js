import React, { useState, useEffect, useRef, useCallback } from "react";
import MatchInfo from "./components/MatchInfo";
import PlayerInfo from "./components/PlayerInfo";
import "./App.css";

function App() {
    const chName = useRef(""); //Holds Channle Name
    const tries = useRef(0);
    const [matchData, setMatchData] = useState({}); //Holds Current Match Data

    //Hold PrevData Initilized by getting `prevData` from localStorage
    const [prevData, setPrevData] = useState(
        JSON.parse(window.localStorage.getItem("prevData")) || []
    );
    //Timer for setIntervals
    const timer = useRef(null);

    const fetchData = useCallback(() => {
        //If Channle Name is Not there return
        if (chName.current === "") return;

        if (tries.current >= 3) {
            console.error("Failed to get valid Data After 3 tries!");
            return;
        }

        //get Report related to Channle Name
        fetch(`/api/${chName.current}`)
            .then((res) => res.json())
            .then((data) => {
                // if conflict was found
                if (data.status === 409) {
                    tries.current++;
                    setTimeout(() => fetchData(), 200);
                }
                //If got error in report return
                if (data.status !== 200) return;

                //got successful response reset tries
                tries.current = 0;
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
    }, []);

    useEffect(() => {
        fetch("/start");
        chName.current = window.location.pathname
            .split("/")
            .slice(-1)[0]
            .trim();
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
            HELLO
            {
                    <center><h2>{chName.current || "GOTO : /web/<ChannleName>"}</h2></center>
            }
            <div id="main">
                <MatchInfo matchData={matchData} />
                <div style={{ marginBottom: 5 }}>
                    {
                        //Previous</br>
                    }
                    <span style={{ fontSize: "20px", fontWeight: "bolder" }}>
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
        </div>
    );
}

export default App;
