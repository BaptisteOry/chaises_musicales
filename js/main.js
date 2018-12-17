"use strict"; /* oblige à déclarer toute variable utilisée */

var music_player;
var home_menu = document.getElementById("home_menu");
var play_menu = document.getElementById("play_menu");
var loser_area = document.getElementById("loser_area");
var players_area = document.getElementById("players_area");
var players;
var chairs_area = document.getElementById("chairs_area");
var chairs;
var chair_chosen;
var button_play_game = document.getElementById("play_game");
var button_start_music = document.getElementById("start_music");
var round = 1;
var info = document.getElementById("info");
var info_text = document.querySelector("#info_frame>p");
var nb_chairs;

document.addEventListener("DOMContentLoaded", initialiser);

/*Initialisation du lecteur Youtube*/

// Charge le code du lecteur API iframe asynchronously
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// Créé un <iframe> (et lecteur YouTube) après que l'API ai été téléchargée
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

// Cette fonction est appelée dès que le lecteur est prêt
function onPlayerReady(event) {
    setTimeout(function () {
        event.target.setShuffle(true); // rend la playlist aléatoire
        event.target.setLoop(true);
    }, 100);
}

// Cette fonction est appelée dès que l'état du lecteur change
// Lorsque son état = 1 (lorsqu'il joue une musique), il s'arrete au bout d'un moment aléatoire et lance la fonction stopMusic
var done = false;

function onPlayerStateChange(event) {
    if (event.data == YT.PlayerState.PLAYING && !done) {
        setTimeout(stopMusic, Math.random() * (18000 - 3000) + 3000);
        done = true;
    }
}

function startMusic() {
    music_player.nextVideo();
    music_player.seekTo(music_player.getDuration() / 2, true); //commence à la moitié de la vidéo
}

function pauseMusic() {
    music_player.pauseVideo();
    done = false;
}

/*Fin initialisation*/


function initialiser(evt) {
    home_menu.classList.add("active");
    button_play_game.addEventListener("click", initialiseGame);
    document.getElementById("replay_game").addEventListener("click", replayGame);
    document.querySelector("h3").addEventListener("click", replayGame);
}

function replayGame(evt) {
    document.location.reload(true);
}

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

function createObjects(nb_chairs) {
    var players_heads = ["hitler", "hollande", "kimjongun", "staline", "marine", "maryTudor", "medicis", "thatcher", "hitler", "hollande", "player"];
    var players_heads_positions_alea = mixPositions(players_heads);
    for (var i = 0; i < nb_chairs; i++) {
        var chair = document.createElement("img");
        chair.setAttribute("src", "images/chaise.png");
        chair.setAttribute("alt", "Une chaise");
        chairs_area.appendChild(chair);

        var player = document.createElement("img");
        player.setAttribute("src", "images/" + players_heads[players_heads_positions_alea[i]] + "_head.png");
        player.setAttribute("alt", "Un joueur");
        players_area.appendChild(player);
    }
    
    var choicePlayer = document.querySelector('input[name="avatar"]:checked').value;
    var player = document.createElement("img");
    player.setAttribute("src", "images/"+choicePlayer+"_head.png");
    player.setAttribute("id", "player_character");
    player.setAttribute("alt", "Votre joueur");
    players_area.appendChild(player);
}

function placeObjects() {
    if (round != nb_chairs) {
        for (var i = 0; i < chairs.length; i++) {
            chairs[i].style.transform = "rotate(" + (360 / chairs.length) * (i+1) + "deg) translate(0px, -130px)";
        }
    } else {
        chairs[0].style.transform = "rotate(0deg) translate(0px, 0px)";
    }

    for (var i = 0; i < players.length; i++) {
        players[i].style.transform = "rotate(" + (360 / players.length) * (i+1) + "deg) translate(0px, -230px)";
    }
}

function playGame(evt) {
    if (round > 1) {
        loser_area.style.animation = "none";
        loser_area.offsetHeight; /* trigger reflow */
        chair_chosen = undefined;
        players_area.style.zIndex = null;
        document.querySelector(".loser").remove();
        chairs[0].remove();
        players = document.querySelectorAll("#players_area>img");
        chairs = document.querySelectorAll("#chairs_area>img");
        placeObjects();
    }
    play_menu.style.cursor = "none";
    button_start_music.style.visibility = "hidden";
    startMusic();
    players_area.style.animation = "rotatePlayers 5s linear infinite";
    loser_area.style.animation = "rotatePlayers 5s linear infinite";
}

function stopMusic(evt) {
    play_menu.style.cursor = null;
    pauseMusic();
    for (var a_chair of chairs) {
        a_chair.style.cursor = "pointer";
        a_chair.addEventListener("click", chooseChair);
    }
    var sit_time = Math.random() * ((2000 / round) + 200 - (200 / round) + 200) + (200 / round) + 200;
    var delay_sit = setTimeout(sitDownAllPlayers, sit_time);
}

function chooseChair(evt) {
    chair_chosen = this;
}

function sitDownAllPlayers(evt) {
    players_area.style.animation = null;
    loser_area.style.animationPlayState = "paused";
    players_area.style.zIndex = 1;
    for (var a_chair of chairs) {
        a_chair.style.cursor = null;
        a_chair.removeEventListener("click", chooseChair);
    }

    var players_positions_alea = mixPositions(players);
    if (chair_chosen) { //Gagné
        for (var i = 0; i < chairs.length; i++) {
            if (chairs[i] == chair_chosen) {
                players[players.length - 1].style.transform = chairs[i].style.transform;
                players[players_positions_alea[i]].classList.add("loser");
                loser_area.appendChild(players[players_positions_alea[i]]);
            } else {
                players[players_positions_alea[i]].style.transform = chairs[i].style.transform;
            }
        }
        round++;
        if (round <= nb_chairs) {
            button_start_music.style.visibility = "visible";
        } else {
            info_text.innerHTML = "Vous avez vaincu tous les dictateurs ! Bravo !";
            info.classList.add("active");
        }
    } else { //Perdu
        for (var i = 0; i < chairs.length; i++) {
            players[players_positions_alea[i]].style.transform = chairs[i].style.transform;
            players[players.length - 1].classList.add("loser");
            loser_area.appendChild(players[players.length - 1]);
        }
        info_text.innerHTML = "Les dictateurs ont gagné...";
        info.classList.add("active");
    }
}

function mixPositions(objects) {
    var positions_alea = new Array;
    for (var i = 0; i < objects.length; i++) {
        positions_alea[i] = i;
    }
    for (var position = positions_alea.length - 2; position >= 0; position--) {
        //Hasard reçoit un nombre entier aléatoire entre 0 et position (non-inclus)
        var alea = Math.floor(Math.random() * (position));
        //Echange
        var save = positions_alea[position];
        positions_alea[position] = positions_alea[alea];
        positions_alea[alea] = save;
    }
    return positions_alea;
}