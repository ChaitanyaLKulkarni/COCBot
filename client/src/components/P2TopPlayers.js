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
const colors = ["#04009a", "#77acf1", "#3edbf0"];
export default function P2TopPlayers({ data }) {
    // Left Top Three Bars
    // Right horizontal bar with total and won show won ratio as tooltip
    const topThree = data.players.sort((a, b) => b.won - a.won).slice(0, 3);

    return (
        <div>
            Top Three Players
            <div className="left">
                <BarChart width={300} height={250} data={topThree}>
                    <Tooltip />
                    <XAxis dataKey="name" />
                    <Bar dataKey="won" fill="#8884d8">
                        <LabelList dataKey="won" position="top" />
                        {topThree.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={colors[index]} />
                        ))}
                    </Bar>
                </BarChart>
            </div>
            <div className="right" style={{ margin: 20 }}>
                <BarChart
                    width={500}
                    height={400}
                    data={topThree}
                    layout="vertical"
                    barSize={50}
                >
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" />
                    <Tooltip />
                    <Legend />
                    <Bar
                        name="Fastest"
                        dataKey="fWon"
                        stackId="a"
                        fill="#04009a"
                    >
                        <LabelList dataKey="fWon" position="top" />
                    </Bar>
                    <Bar
                        name="Reverse"
                        dataKey="rWon"
                        stackId="a"
                        fill="#77acf1"
                    >
                        <LabelList dataKey="rWon" position="bottom" />
                    </Bar>
                    <Bar
                        name="Shortest"
                        dataKey="sWon"
                        stackId="a"
                        fill="#3edbf0"
                    >
                        <LabelList dataKey="sWon" position="top" />
                    </Bar>
                </BarChart>
            </div>
        </div>
    );
}
