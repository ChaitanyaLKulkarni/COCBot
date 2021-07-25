import React from "react";
import { Route, Switch, BrowserRouter as Router } from "react-router-dom";
import Leaderboard from "./pages/Leaderboard";
import Summary from "./pages/Summary";
import "./App.css";

function App() {
    return (
        <Router>
            <Switch>
                <Route path="/web/summary/:channelName" component={Summary} />
                <Route path="/web/:channelName" component={Leaderboard} />
            </Switch>
        </Router>
    );
}

export default App;
