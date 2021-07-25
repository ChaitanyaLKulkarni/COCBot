import React from "react";
import {
    PieChart,
    Pie,
    Tooltip,
    Legend,
    Cell,
    LabelList,
    BarChart,
    Bar,
    XAxis,
    YAxis,
} from "recharts";
import { primArr, secArr } from "../colors";

const l = primArr.length;
const combined = [];
for (let i = 0; i <= l; i++) {
    combined.push(primArr[i], secArr[i]);
}
export default function P3LangSummary({ data }) {
    const languages = data.languages.sort((a, b) => b.used - a.used);
    const topFive = languages.slice(0, 5);
    topFive.push({
        name: "Other",
        used: languages.slice(5).reduce((a, c) => a + c.used, 0),
    });

    return (
        <div className="container">
            <div className="left">
                <div className="sub-heading">Top Five Languages:</div>
                <PieChart width={450} height={500}>
                    <Pie
                        data={topFive}
                        dataKey="used"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={150}
                    >
                        <LabelList
                            position="outside"
                            style={{
                                fill: "#000",
                                stroke: "#000",
                            }}
                            valueAccessor={(v, i) => {
                                return `${topFive[i].name} : ${topFive[i].used}`;
                            }}
                        />
                        {topFive.map((entry, index) => (
                            <Cell
                                key={`topFiveLang-cell-${index}`}
                                fill={combined[index]}
                            />
                        ))}
                    </Pie>

                    <Tooltip />
                    <Legend />
                </PieChart>
            </div>
            <div className="heading">Language Summary</div>
            <div className="right">
                <div className="sub-heading">Top 10 Languages used:</div>
                <BarChart
                    width={600}
                    height={500}
                    data={languages.slice(0, 10)}
                    barSize={30}
                    margin={{ top: 100 }}
                >
                    <XAxis dataKey="name" interval={0} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="used" fill={secArr[1]} />
                </BarChart>
            </div>
        </div>
    );
}
