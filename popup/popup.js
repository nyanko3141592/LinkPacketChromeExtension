let nowUrl = "";
let nowTitle = "";
let userPacketsUuids = [];
let packetNames = [];
let name, email, photoUrl, uid, emailVerified;

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBKzJzgdoqim8ZwR_6LpVd4iS9MGM_41kw",
    authDomain: "link-packet.firebaseapp.com",
    projectId: "link-packet",
    storageBucket: "link-packet.appspot.com",
    messagingSenderId: "75094459461",
    appId: "1:75094459461:web:70e7159120515644a44f2c",
    measurementId: "G-759CSS30HY"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
console.log(db)

firebase.auth().onAuthStateChanged((user) => {
    if (!user) {
        // 認証処理
        const provider = new firebase.auth.GoogleAuthProvider()
        provider.addScope('https://www.googleapis.com/auth/userinfo.email');
        firebase.auth().useDeviceLanguage()
        firebase.auth().signInWithPopup(provider).then(function (result) {
            console.log('userInfo: ' + JSON.stringify(result.user))
        }).catch(function (error) {
            console.log(error)
        });
        // location.href = '/signin.html';
        console.log(name, email)
    } else {
        // サインイン済み
        console.log("have signed in")
        const user = firebase.auth().currentUser;
        console.log(user)
        if (user != null) {
            name = user.displayName;
            email = user.email;
            photoUrl = user.photoURL;
            emailVerified = user.emailVerified;
            uid = user.uid;
            console.log(name, uid)
        }
        let docRef = db.collection("users").doc(uid);
        docRef.get().then(function (doc) {
            if (doc.exists) {
                //所有packetの一覧
                let packetPath = doc.data()["packetRefs"];
                let packetIds = [];
                packetPath.forEach(ref => {
                    console.log(ref.id)
                    packetIds.push(ref.id)
                })
                console.log("Document data:", packetPath)
                //packetsのタイトルを取得する
                packetIds.forEach(packet => {
                    let packetRefs = db.collection("packets").doc(packet);
                    let id = packet.replace('packets/', '')
                    packetRefs.get().then(function (doc2) {
                        console.log(packet)
                        userPacketsUuids.push(packet)
                        if (doc2.exists) {
                            console.log("Title", doc2.data()['title']);
                            console.log("ID", id);
                            packetNames.push(doc2.data()['title'])
                            makeCard(id, doc2.data()['title'])
                        } else {
                            console.log("No such document!");
                        }
                    }).catch(function (error) {
                        console.log("Error getting document:", error);
                    });
                })
            } else {
                console.log("No such document!");
            }
        }).catch(function (error) {
            console.log("Error getting document:", error);
        });
    }
})

//並べる
function showList(userPacketsUuids, packetNames) {
    for (let i = 0; i < userPacketsUuids.length; i++) {
        makeCard(userPacketsUuids[i], packetNames[i])
    }
}

window.onload = function () {
};

function makeCard(userPacketsUuid, packetName) {
    let card = "   <section class=\"card\">\n" +
        "        <label for=\"@\"></label><input id=\"@\" type=\"checkbox\" name=\"checkbox\"/>\n" +
        "        <label for=\"@\">Title</label>\n" +
        "    </section>"
    $("#packets").append(card.replaceAll("@", userPacketsUuid).replaceAll("Title", packetName.slice(0, 13)));
    // $("#packets").append(card.replaceAll("@", userPacketsUuid).replaceAll("Title", packetName).slice(0, 20));
}

chrome.tabs.getSelected(null, function (tab) {
    // 　　現在のサイトの表示
    nowUrl = tab.url;
    nowTitle = tab.title;
    document.getElementById("now-title").innerText = nowTitle;
    document.getElementById("now-url").innerText = nowUrl;
});

// checked
document.getElementById('submit').onclick = function getChecked() {
    let checked = [];
    const checkbox = document.getElementsByName("checkbox");
    for (let i = 0; i < checkbox.length; i++) {
        if (checkbox[i].checked) {
            console.log('CHECKED', checkbox[i].id);
            checked.push(checkbox[i].id);
            let id = checkbox[i].id
            let packetRefs = db.collection("packets").doc(id);
            packetRefs.get().then(function (doc2) {
                console.log(id)
                if (doc2.exists) {
                    let urls = doc2.data()['urls']
                    console.log("Title", doc2.data()['urls']);
                    urls.push({'link': nowUrl, 'title': nowTitle})
                    console.log(urls);
                    db.collection('packets').doc(id).update({
                        urls: firebase.firestore.FieldValue.arrayUnion({'link': nowUrl, 'title': nowTitle})
                    })
                    $('#float').append('<div class="float-card"><a href="" class="btn btn-flat"><span>追加しました</span></a></div>')
                } else {
                    console.log("No such document!");
                }
            }).catch(function (error) {
                console.log("Error getting document:", error);
            });
        }
    }
    let input_message = document.getElementById("new-packet").value;
    if (input_message !== '') {
        // Add a new document with a generated id.
        db.collection("packets").add({
            title: input_message,
            postedDate: firebase.firestore.Timestamp.now(),
            urls: [{'link': nowUrl, 'title': nowTitle}],
            userRef: db.collection('users').doc(uid),
            id: ''
        })
            .then(function (docRef) {
                db.collection('packets').doc(docRef.id).update({
                    id: docRef.id
                })
                db.collection('users').doc(uid).update({
                    packetRefs: firebase.firestore.FieldValue.arrayUnion(db.collection('packets').doc(docRef.id))
                })
                console.log("Document written with ID: ", docRef.id);
                if (checked.length === 0) {
                    $('#float').append('<div class="float-card"><a href="" class="btn btn-flat"><span>追加しました</span></a></div>')
                }
            })
            .catch(function (error) {
                console.error("Error adding document: ", error);
            });
    }
    console.log(checked);
    console.log(input_message)
}
