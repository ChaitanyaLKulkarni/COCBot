(this.webpackJsonpclient=this.webpackJsonpclient||[]).push([[0],{12:function(e,t,n){},14:function(e,t,n){},15:function(e,t,n){"use strict";n.r(t);var c=n(1),r=n.n(c),a=n(6),i=n.n(a),s=(n(12),n(7)),l=n(4),o=n(0);var d=function(e){var t=e.playerData,n=e.index,c=Math.floor(t.duration/1e3),r="".concat(("00"+Math.floor(c/60)).slice(-2),"m:").concat(("00"+Math.floor(c%60)).slice(-2),"s");return Object(o.jsxs)("div",{className:"player-info "+(void 0!==n?n%2===0?"light":"dark":""),children:[Object(o.jsx)("div",{children:t.language}),Object(o.jsx)("div",{children:t.name}),Object(o.jsx)("div",{children:r})]})};var j=function(e){var t,n=e.matchData;if(!n.started)return Object(o.jsxs)("div",{className:"waiting-container",children:[Object(o.jsx)("h2",{children:(t=n,0!==Object.keys(t).length?"Waiting for Players":"No Match Found!!!")}),Object(o.jsxs)("p",{children:["Players:",Object(o.jsx)("span",{className:"no-player",children:n.noPlayers})]})]});var c=n.players.filter((function(e){return e.finished})).sort((function(e,t){return e.rank-t.rank})).slice(0,2);return Object(o.jsxs)("div",{className:"match-info",children:[Object(o.jsxs)("h2",{children:["Mode:",n.mode]}),0===c.length&&Object(o.jsx)("h2",{children:"Clashining.."}),c.map((function(e,t){return Object(o.jsx)(d,{playerData:e,index:t},e.name)})),Object(o.jsxs)("p",{children:["Players:",Object(o.jsx)("span",{className:"no-player",children:n.noPlayers})]})]})};n(14);var h=function(){var e=Object(c.useState)(""),t=Object(l.a)(e,2),n=t[0],r=t[1],a=Object(c.useState)({}),i=Object(l.a)(a,2),h=i[0],u=i[1],f=Object(c.useState)(JSON.parse(window.localStorage.getItem("prevData"))||[]),b=Object(l.a)(f,2),O=b[0],m=b[1],p=Object(c.useRef)(null),x=function(){fetch("/api/".concat(n)).then((function(e){return e.json()})).then((function(e){200===e.status&&u((function(t){return t.matchId!==e.matchId&&t&&t.started&&m((function(e){if(e.some((function(e){return e.matchId===t.matchId})))return e;var n=t.players.filter((function(e){return e.finished})).sort((function(e,t){return e.rank-t.rank}))[0],c=[{matchId:t.matchId,mode:t.mode,winner:n}].concat(Object(s.a)(e));return window.localStorage.setItem("prevData",JSON.stringify(c)),c})),e}))}))};return Object(c.useEffect)((function(){return fetch("/start"),r(window.location.pathname.split("/").slice(-1)[0].trim()),x(),p.current=setInterval((function(){return x()}),5e3),function(){clearInterval(p.current),p.current=null}}),[]),Object(o.jsxs)("div",{className:"App",children:[Object(o.jsx)("center",{children:Object(o.jsx)("h2",{children:n||"GOTO : /web/<ChannleName>"})}),n&&Object(o.jsxs)("div",{id:"main",children:[Object(o.jsx)(j,{matchData:h}),Object(o.jsxs)("div",{style:{marginBottom:5},children:[Object(o.jsx)("span",{style:{fontSize:"20px",fontWeight:"bolder"},children:"Winners"}),":"]}),Object(o.jsx)("div",{id:"prev-container",children:O.map((function(e){return Object(o.jsx)(d,{playerData:e.winner,matchData:e},e.matchId)}))})]})]})};i.a.render(Object(o.jsx)(r.a.StrictMode,{children:Object(o.jsx)(h,{})}),document.getElementById("root"))}},[[15,1,2]]]);
//# sourceMappingURL=main.224d4e96.chunk.js.map