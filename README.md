# TODO:

-   [ ] Visualizer

    -   [x] Get Data From COC
    -   [x] Formate Data
        -   [x] Get only relatale
    -   [x] Save minified and normal version
    -   [x] Give data to react client and let them process it

        -   _Given only needed data so will be fine for_

    -   [ ] Pages:
        -   [x] Page 1 Summary
        -   [x] Page 2 Top Players
        -   [x] Page 3 Language Summary
        -   [ ] Page 4 Most played Players
        -   [ ] Page 5 Player wise Summary
    -   [ ] Add Parllax Scrolling with nice background

---

## Needed Tools

-   [Recharts](https://www.npmjs.com/package/recharts)
-   [Axios](https://www.npmjs.com/package/axios)

## Plan

1. Summary:

    - Left: Toal number of matches
    - Right: Pie Chart of Modes

2. Top Players:

    - Left: Top Three Player show with bar graph
    - Right: min summary of player:
        - _Attended Matches / Total matches_ - _Wins_ - _win Ratio_ (Maybe Add language too)

3. Languages summary:

    - Left: Horizontal Bar with all languages
    - Right: Top Three languages

4. Consistency Players(NOT SURE):

    - Left: Top Three consitance players (Calculate ?)
        - Most played players
    - Right: Summary Maybe?
        - Mode wise most played players

5. Player wise summary:
    - Choose player
    - Left: Summary:
        - Match Attended / Total Matches
        - Wins win Ration
        - Fav lang
        - Languages Used
    - Right: Pie Chart Mode Wise Summary
