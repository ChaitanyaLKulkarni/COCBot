import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';

function App() {
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    fetch('/api/report/1677470cf5cf83fe07e9882820318644e5ac939').then(res => res.json()).then(data => {
      console.log(data);
	  setCurrentTime(data.message.players[0].codingamerNickname);
    });
  }, []);
  
  return (
    <div className="App">
	{currentTime}
    </div>
  );
}

export default App;
