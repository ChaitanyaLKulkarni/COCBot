TODO:

-   [ ] _Debug_: Showing Multiple lobby in api/<ChannleName>
    -   [x] In server if `nosPlyer`< 0 after getting report
        -   [x] _discard_ the match and remove it from `currents`
        -   [x] send response with code `409` i.e. _Conflict_
    -   [ ] In Client if `status`=409
        -   [ ] increment `retry` conunter
        -   [ ] if `retry` < 3 then repeat the request
    -   [ ] if `status`=200 or 404
        -   [ ] reset `retry` to `0`
-   [ ] UI
-   [ ] Add Proper Logging
-   [ ] Add Clear button to reset localStorage
-   [ ] Get Language icon for corresponding ones

-   [x] _Debug_: Showing null in prev Container not addind multiple prev
-   [x] Cache output of report function for some time to reduce outgoing bandwidth
