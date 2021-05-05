import React from "react";
import { PieChart, Pie, Tooltip, Legend, Cell } from "recharts";
import { primArr } from "../colors";
export default function P1Summary({ data }) {
    const pieData = [
        { name: "Fastest", value: data.fTotal },
        { name: "Shortest", value: data.sTotal },
        { name: "Reverse", value: data.rTotal },
    ];
    return (
        <div className="container">
            <div className="left">Total Matches: {data.total}</div>
            Summary:
            <div className="right">
                <PieChart width={700} height={400} margin={{ top: 100 }}>
                    <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={120}
                        label
                    >
                        <Cell fill={primArr[0]} />
                        <Cell fill={primArr[1]} />
                        <Cell fill={primArr[2]} />
                    </Pie>
                    <Tooltip />
                    <Legend />
                </PieChart>
            </div>
        </div>
    );
}
