let currentSong = new Audio();
let songs;
let currFolder;
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00 : 00";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60)
    const formatedMinutes = String(minutes).padStart(2, '0');
    const formatedSeconds = String(remainingSeconds).padStart(2, '0');
    return `${formatedMinutes}:${formatedSeconds}`;
}
async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`/${folder}/`);
    let responce = await a.text();
    let div = document.createElement("div")
    div.innerHTML = responce
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }
    // show all the songs in the playlist
    let songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li>
               <img class="invert" src="imgs/music.svg" alt="">
               <div class="info">
                 <div>${song.replaceAll("%20", " ")}</div>
                 <div>Spotify Music</div>
               </div>
               <div class="playnow">
                 <span>Play Now</span>
                 <img class="invert" src="imgs/play.svg" alt="">
               </div></li>`
    }
    //attch an event istener to each song
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
        })
    })
    return songs
}
const playMusic = (track, pause = false) => {
    //play the song
    currentSong.src = `/${currFolder}/` + track
    if (!pause) {
        currentSong.play();
        play.src = "imgs/pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
}
async function displayAlbumbs() {
    let a = await fetch(`/songs/`);
    let responce = await a.text();
    let div = document.createElement("div")
    div.innerHTML = responce
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/songs/") && !e.href.includes(".htaccess")) {
            let folder = e.href.split("/").slice(-1)[0];
            //get the meta data of the folder
            let a = await fetch(`/songs/${folder}/info.json`);
            let responce = await a.json();
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
                <div class="play">
                  <img src="imgs/greenPlayBtn.svg" alt="">
                </div>
                <img src="/songs/${folder}/cover.jpg" alt="">
                <h2>${responce.title}</h2>
                <p>${responce.description}</p>
              </div>`
        }
        //load the playlist whenever card is clicked
        Array.from(document.getElementsByClassName("card")).forEach(e => {
            e.addEventListener("click", async item => {
                songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
                playMusic(songs[0])
            })
        })
    }
    //add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100
    })
    //add an event listener to previous
    previous.addEventListener("click", () => {
        currentSong.pause()
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if (index - 1 >= 0) {
            playMusic(songs[index - 1])
        }else{
            currentSong.play()
        }
    })
    //add an event listener to next
    next.addEventListener("click", () => {
        currentSong.pause()
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if (index + 1 < songs.length) {
            playMusic(songs[index + 1])
        }
        else{
            currentSong.play()
        }
    })
    //add an event listener to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100
        if (currentSong.volume>0) {
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("volumeOff.svg", "volumeOn.svg")
        }
    })
    //add an event listener to mute Volume
    document.querySelector(".volume>img").addEventListener("click", e => {
        if (e.target.src.includes("volumeOn.svg")) {
            e.target.src = e.target.src.replace("volumeOn.svg", "volumeOff.svg")
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        } else {
            e.target.src = e.target.src.replace("volumeOff.svg", "volumeOn.svg")
            currentSong.volume = .10;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }
    })
}
async function main() {
    //get the list of all songs
    await getSongs("songs/all");
    playMusic(songs[0], true)
    //display all albumbs on the page
    await displayAlbumbs()
    //attach an event listener to play button
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "imgs/pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "imgs/play.svg"
        }
    })
    //listen for timeUpdate event
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)}/${secondsToMinutesSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%"
        if (currentSong.currentTime==currentSong.duration) {
            play.src = "imgs/play.svg"
        }
    })
    //add an event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })
    //add an event listener for close button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-130%"
    })
}
main()