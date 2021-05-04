import React from "react";
import { PieChart, Pie, Tooltip, Legend } from "recharts";
export default function P1Summary({ data }) {
    const pieData = [
        { name: "Fastest", value: data.fTotal },
        { name: "Shortest", value: data.sTotal },
        { name: "Reverse", value: data.rTotal },
    ];
    return (
        <div>
            Summary:
            <div className="left">Total Matches: {data.total}</div>
            <div className="right">
                <PieChart width={730} height={250}>
                    <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        label
                    />
                    <Tooltip />
                    <Legend />
                </PieChart>
            </div>
        </div>
    );
}
