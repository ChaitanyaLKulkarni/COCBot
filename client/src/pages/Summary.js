import React, { useEffect, useState } from "react";
import P1Summary from "../components/P1Summary";
import P2TopPlayers from "../components/P2TopPlayers";
export default function Summary(props) {
    const [data, setData] = useState(null);

    useEffect(() => {
        const channelName = props.match.params.channelName;
        fetch("/api/summary/" + channelName)
            .then((d) => d.json())
            .then((res) => {
                console.log(res);
                if (res.status !== 200) return;
                setData(res.data);
            })
            .catch((err) => {
                console.log(err);
            });
    }, [props.match.params.channelName]);

    return (
        <div>
            {data && (
                <div>
                    <P1Summary data={data} />
                    <P2TopPlayers data={data} />
                </div>
            )}
        </div>
    );
}
