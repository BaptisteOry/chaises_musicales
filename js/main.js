/*------------------------------
General
------------------------------*/
"use strict"; //force to declare any variable used

const home_menu = document.getElementById("home_menu");
const play_menu = document.getElementById("play_menu");
const button_start_music = document.getElementById("start_music");
const loser_area = document.getElementById("loser_area");
const players_area = document.getElementById("players_area");
var music_player;
var musicToStop = true;
var players;
var nb_chairs;
var chairs;
var chair_chosen;
var round = 1;

document.addEventListener("DOMContentLoaded", initialiser);


/*------------------------------
API YouTube
------------------------------*/
//Load the code of the API asynchronously
let tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
let firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

//Create an <iframe> (YouTube player) with a playlist after the API has been downloaded
function onYouTubeIframeAPIReady() {
    music_player = new YT.Player('music_player', {
        height: '1',
        width: '1',
        playerVars: {
            list: 'PL9REC4N8Y-3obDuWaMU_RGwWiACGM81ZW',
            suggestedQuality: 'small',
            controls: 0
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

//As soon as the player is ready
//Set up the playlist
function onPlayerReady(event) {
    setTimeout(function () {
        event.target.setShuffle(true); //playlist random
        event.target.setLoop(true);
    }, 100);
}

//As soon as the state of the player changes
//When the player play a music, stops after a random moment and starts the pauseGame function, 
function onPlayerStateChange(event) {
    if (event.data == YT.PlayerState.PLAYING && musicToStop) {
        setTimeout(pauseGame, Math.random() * (18000 - 3000) + 3000);
        musicToStop = false;
    }
}

//Play a music
function startMusic() {
    music_player.nextVideo(); //Operated the onPlayerStateChange function 2/2
    music_player.seekTo(music_player.getDuration() / 2, true); //Starts at half of the video
}

//Stop a music
function stopMusic() {
    music_player.pauseVideo();
    musicToStop = true; //Operated the onPlayerStateChange function 1/2
}


/*------------------------------
Game
------------------------------*/
//Initialize the general elements and the beginning of the user journey : home menu and clickable buttons
function initialiser(evt) {
    home_menu.classList.add("active");
    document.getElementById("play_game").addEventListener("click", initialiseGame);
    document.getElementById("replay_game").addEventListener("click", replayGame);
    document.querySelector("h2").addEventListener("click", replayGame);
}

//Initialize the game : play menu
function initialiseGame(evt) {
    nb_chairs = document.querySelector(".slider").value;
    createObjects(nb_chairs);
    players = document.querySelectorAll("#players_area>img");
    chairs = document.querySelectorAll("#chairs_area>img");
    placeObjects();
    button_start_music.addEventListener("click", playGame);
    home_menu.classList.remove("active");
    play_menu.classList.add("active");
}

//Create the objects (chairs and players)
//According to the number of chairs chosen by the user
function createObjects(nb_chairs) {
    let players_heads = ["hitler", "hollande", "kimjongun", "staline", "marine", "maryTudor", "medicis", "thatcher", "hitler", "hollande", "player"];
    let players_heads_positions_alea = mixPositions(players_heads);
    for (let i = 0; i < nb_chairs; i++) {
        //Chairs
        let chair = document.createElement("img");
        chair.setAttribute("src", "images/chaise.png");
        chair.setAttribute("alt", "Une chaise");
        document.getElementById("chairs_area").appendChild(chair);
        //Players
        let dictator = players_heads[players_heads_positions_alea[i]];
        let player = document.createElement("img");
        player.setAttribute("src", "images/" + dictator + "_head.png");
        player.setAttribute("alt", dictator);
        player.setAttribute("title", dictator);
        players_area.appendChild(player);
    }
    //Player user according to the chosen avatar
    let choicePlayer = document.querySelector('input[name="avatar"]:checked').value;
    let player = document.createElement("img");
    player.setAttribute("src", "images/" + choicePlayer + "_head.png");
    player.setAttribute("id", "player_character");
    player.setAttribute("alt", "Ton joueur : " + choicePlayer);
    player.setAttribute("title", "Ton joueur : " + choicePlayer);
    players_area.appendChild(player);
}

//Place objects (chairs and players) on the play area
function placeObjects() {
    //Chairs
    if (round != nb_chairs) {
        for (let i = 0; i < chairs.length; i++) {
            chairs[i].style.transform = "rotate(" + (360 / chairs.length) * (i + 1) + "deg) translate(0px, -130px)";
        }
    } else {
        chairs[0].style.transform = "rotate(0deg) translate(0px, 0px)";
    }
    //Players
    for (let i = 0; i < players.length; i++) {
        players[i].style.transform = "rotate(" + (360 / players.length) * (i + 1) + "deg) translate(0px, -230px)";
    }
}

//Start or restart the game, when the user clicks the start_music button
function playGame(evt) {
    if (round > 1) {
        loser_area.classList.remove("animationPaused");
        loser_area.classList.remove("animationRotatePlayers");
        loser_area.offsetHeight; /* trigger reflow */
        document.querySelector(".loser").remove();
        chair_chosen = undefined;
        players_area.classList.remove("above");
        chairs[0].remove();
        players = document.querySelectorAll("#players_area>img");
        chairs = document.querySelectorAll("#chairs_area>img");
        placeObjects();
    }
    startMusic();
    play_menu.classList.add("noCursor");
    button_start_music.classList.add("invisible");
    loser_area.classList.add("animationRotatePlayers");
    players_area.classList.add("animationRotatePlayers");
}

//Pause the game and let the user choose a chair as quickly as possible
function pauseGame(evt) {
    stopMusic();
    play_menu.classList.remove("noCursor");
    for (let a_chair of chairs) {
        a_chair.classList.add("pointerCursor");
        a_chair.addEventListener("click", chooseChair);
    }
    let max_sit_time = 3200 - (2000 * (round / nb_chairs));
    let min_sit_time = 800 - (300 * (round / nb_chairs));
    let sit_time = Math.random() * (max_sit_time - min_sit_time) + min_sit_time;
    let delay_sit = setTimeout(sitDownAllPlayers, sit_time);
}

//Chair chosen by the user in time
function chooseChair(evt) {
    chair_chosen = this;
}

//Seat the players considering the user's victory or not for this round (chair chosen in time)
function sitDownAllPlayers(evt) {
    let info = document.getElementById("info");
    let info_text = document.querySelector("#info_frame>p");

    loser_area.classList.add("animationPaused");
    players_area.classList.remove("animationRotatePlayers");
    players_area.classList.add("above");
    for (let a_chair of chairs) {
        a_chair.classList.remove("pointerCursor");
        a_chair.removeEventListener("click", chooseChair);
    }
    let players_positions_alea = mixPositions(players);
    //The user win the round
    if (chair_chosen) {
        for (let i = 0; i < chairs.length; i++) {
            if (chairs[i] == chair_chosen) {
                players[players_positions_alea[i]].classList.add("loser");
                loser_area.appendChild(players[players_positions_alea[i]]);
                players[players.length - 1].style.transform = chairs[i].style.transform;
            } else {
                players[players_positions_alea[i]].style.transform = chairs[i].style.transform;
            }
        }
        round++;
        if (round <= nb_chairs) {
            button_start_music.classList.remove("invisible");
        } else {
            info_text.innerHTML = "Vous avez vaincu tous les dictateurs ! Bravo !";
            info.classList.add("active");
        }
        //The user loses the round and therefore the game
    } else {
        for (let i = 0; i < chairs.length; i++) {
            players[players.length - 1].classList.add("loser");
            loser_area.appendChild(players[players.length - 1]);
            players[players_positions_alea[i]].style.transform = chairs[i].style.transform;
        }
        info_text.innerHTML = "Les dictateurs ont gagné...";
        info.classList.add("active");
    }
}

//Reload the page to replay
function replayGame(evt) {
    document.location.reload(true);
}

//Create and return an array of random positions, except for the last of the elements
//According to the list of objects in parameter
function mixPositions(objects) {
    let positions_alea = new Array;
    for (let i = 0; i < objects.length; i++) {
        positions_alea[i] = i;
    }
    for (let position = positions_alea.length - 2; position >= 0; position--) {
        //Alea receives a random integer between 0 and position (not included)
        let alea = Math.floor(Math.random() * (position));
        //Swap
        let save = positions_alea[position];
        positions_alea[position] = positions_alea[alea];
        positions_alea[alea] = save;
    }
    return positions_alea;
}