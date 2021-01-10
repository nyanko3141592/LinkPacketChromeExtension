let nowUrl = "";
let nowTitle = "";
let userPacketsUuids = [];
let packetNames = [];

window.onload = function () {
    chrome.tabs.getSelected(null, function (tab) {
        // 　　現在のサイトの表示
        nowUrl = tab.url;
        nowTitle = tab.title;
        document.getElementById("now-title").innerText = nowTitle;
        document.getElementById("now-url").innerText = nowUrl;
    });
    //    APIでパケットリストを取得
    userPacketsUuids = ["neko", "dog"];
    // userPacketsUuids = [];
    packetNames = [];
    userPacketsUuids.forEach(uuid => {
        //TODO タイトルに差し替える
        packetNames.push("a");
    })
    //代替のリスト
    packetNames = ["ねこ", "いぬ"];


    if (userPacketsUuids.length === 0) {
        //　新規リストを作成する(LPに飛ばす)
        $("#submit").remove()
    } else {
        $("#makeNew").remove()
        //    リストを並べる
        let card = "   <section class=\"card\">\n" +
            "        <label for=\"@\"></label><input id=\"@\" type=\"checkbox\" name=\"checkbox\"/>\n" +
            "        <label for=\"@\">Title</label>\n" +
            "    </section>"
        for (let i = 0; i < userPacketsUuids.length; i++) {
            console.log(packetNames[i]);
            $("#packets").append(card.replaceAll("@", userPacketsUuids[i]).replaceAll("Title", packetNames[i]));
        }
    }
    // jump LP
    const els = document.getElementsByClassName("jumpLP")
    for (let i = 0; i < els.length; i++) {
        console.log(document.getElementsByClassName("jumpLP")[i])
        document.getElementsByClassName("jumpLP")[i].addEventListener("click", jumpToLP, false);
    }
    console.log(els)
};

//submitボタンを押された時の処理
document.getElementById("submit").onclick = function () {
    console.log('Submit');
    //    選択されたリストの取得
    let checked = getChecked()
    //    API叩く

    //    API正常に叩けた表示

};


//jump to LP
function jumpToLP() {
    console.log("move to LP")
    chrome.tabs.query({'active': true}, function (tabs) {
        chrome.tabs.update(tabs[0].id, {url: "https://linkpacket.web.app/"});
    });
}

// checked
function getChecked() {
    let checked = [];
    const chechboxs = document.getElementsByName("checkbox");

    for (let i = 0; i < chechboxs.length; i++) {
        if (chechboxs[i].checked) {
            checked.push(chechboxs[i].id);
        }
    }
    console.log(checked);
    return checked
}
