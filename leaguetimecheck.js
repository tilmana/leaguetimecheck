let value = 0;
let count = 0;
let totalPlayValue = 0;

if (window.location.host.includes("op.gg")) {
    try {
        if (typeof __NEXT_DATA__.props.pageProps.data.summoner_id === 'undefined') {
        } else {
            getPlayTime(__NEXT_DATA__.props.pageProps.data.summoner_id, value)
        }
    } catch (error) {
        console.log("Not on profile page, proceeding to prompt...")
        var targetUser = prompt("Summoner ID (ex: Example#NA1):")
        getSummonerId(targetUser, value)
    }
} else {
    var confirmation = window.confirm("Not on OP.GG. Click OK to redirect or cancel to stay. Please re-run this script upon arriving.")
    if (confirmation) {
        window.location = "https://www.op.gg"
    } else {
        alert("Cancelling...")
    }
}

function getSummonerId(targetUser, value) {
    fetch(`/summoners/na/${targetUser.replace("#", "-")}`)
    .then(function(response) {
        return response.text()
    })
    .then(function(html) {
        var parser = new DOMParser();
        var doc = parser.parseFromString(html, "text/html");
        const regex = /"summoner_id"\s*:\s*"([^"]*)"/;
        const match = regex.exec(doc.children[0].innerHTML);
        if (match) {
            var summonerId = match[1];
            console.log("Summoner ID:", summonerId);
            getPlayTime(summonerId, value);
        } else {
            console.log("Summoner ID not found in the HTML.")
            alert("Summoner ID not found in the HTML.")
        }
    })
    .catch(error => {
        console.error("Error:", error);
    });
}

function getPlayTime(summonerId, value) {
    fetch(`https://lol-web-api.op.gg/api/v1.0/internal/bypass/summoners/na/${summonerId}/most-champions/rank?game_type=RANKED&season_id=${value}`)
        .then(response => {
            if (!response.ok) {
                if (response.status === 422) {
                    count = count + 1
                    if (count === 3) {
                        var hours = (totalPlayValue * 30) / 60;
                        console.log(hours)
                        alert(`Total ranked hours (avg 30 min per match): ${hours}\nTotal ranked matches: ${totalPlayValue}`)
                        return
                    }
                } else {
                    console.error(`Unexpected response code: ${response.status}!`)
                }
            } else {
                count = 0
                response.json().then(data => {
                    if (data && data.data && typeof data.data.play === "number") {
                        totalPlayValue = totalPlayValue + data.data.play;
                        console.log("Total ranked matches played:", totalPlayValue);
                    }
                }).catch(error => {
                    console.error("Error:", error);
                });
            }
            value = value + 1
            getPlayTime(summonerId, value);
        })
        .catch(error => {
            console.error("Error:", error);
        });
}
