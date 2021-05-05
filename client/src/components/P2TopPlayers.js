import React from "react";
import {
    BarChart,
    Bar,
    Tooltip,
    Legend,
    XAxis,
    YAxis,
    Cell,
    LabelList,
} from "recharts";

import { primArr, secArr } from "../colors";

export default function P2TopPlayers({ data }) {
    // Left Top Three Bars
    // Right horizontal bar with total and won show won ratio as tooltip

    //Sort by max won while playing least amount of matches
    const topThree = data.players
        .sort((a, b) => (b.won === a.won ? a.total - b.total : b.won - a.won))
        .slice(0, 3)
        .map((player) => ({ ...player, lost: player.total - player.won }));

    return (
        <div className="container">
            <div className="left">
                Total Matches Won:
                <BarChart
                    width={300}
                    height={450}
                    data={topThree}
                    margin={{ top: 100 }}
                >
                    <Tooltip />
                    <XAxis dataKey="name" />
                    <Bar dataKey="won" fill="#8884d8">
                        <LabelList dataKey="won" position="top" />
                        {topThree.map((entry, index) => (
                            <Cell
                                key={`topThree-cell-${index}`}
                                fill={primArr[index]}
                            />
                        ))}
                    </Bar>
                </BarChart>
            </div>
            Top Three Players
            <div className="right">
                <span style={{ marginLeft: 60 }}>Mode wise Matches Won:</span>
                <BarChart
                    width={700}
                    height={500}
                    data={topThree}
                    layout="vertical"
                    barSize={40}
                    margin={{ top: 100 }}
                >
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={80} />
                    <Tooltip />
                    <Legend />
                    <Bar
                        name="Fastest"
                        dataKey="fWon"
                        stackId="a"
                        fill={secArr[0]}
                    >
                        <LabelList dataKey="fWon" position="top" />
                    </Bar>
                    <Bar
                        name="Reverse"
                        dataKey="rWon"
                        stackId="a"
                        fill={secArr[1]}
                    >
                        <LabelList dataKey="rWon" position="bottom" />
                    </Bar>
                    <Bar
                        name="Shortest"
                        dataKey="sWon"
                        stackId="a"
                        fill={secArr[2]}
                    >
                        <LabelList dataKey="sWon" position="top" />
                    </Bar>
                    <Bar
                        name="Lost"
                        dataKey="lost"
                        stackId="a"
                        fill={secArr[3]}
                    >
                        <LabelList dataKey="lost" position="top" />
                    </Bar>
                </BarChart>
            </div>
        </div>
    );
}
