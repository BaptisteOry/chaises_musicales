"use strict"; /* oblige à déclarer toute variable utilisée */

document.addEventListener("DOMContentLoaded", initialiser);

var music = document.getElementById("audio_player");
var play_area = document.getElementById("play_area");
var loser_area = document.getElementById("loser_area");
var players_area = document.getElementById("players_area");
var players = document.querySelectorAll("#players_area>img");
var chairs = document.querySelectorAll("#chairs_area>img");
var chair_chosen;
var button_play_game = document.getElementById("play_game");
var round = 1;
var rounds = document.querySelectorAll("#chairs_area>img").length;

function initialiser(evt) {
    placeObjects();
    button_play_game.addEventListener("click", playGame);
}

function placeObjects() {
    for (var i = 0; i < chairs.length; i++) {
        chairs[i].style.transform = "rotate(" + (360 / chairs.length) * i + "deg) translate(0px, -150px)";
    }
    for (var i = 0; i < players.length; i++) {
        players[i].style.transform = "rotate(" + (360 / players.length) * i + "deg) translate(0px, -250px)";
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
    play_area.style.cursor = "none";
    button_play_game.style.visibility = "hidden";
    music.play();
    players_area.style.animation = "rotatePlayers 5s linear infinite";
    loser_area.style.animation = "rotatePlayers 5s linear infinite";
    var music_time = Math.random() * (15000 - 1000) + 1000;
    var delay_stop = setTimeout(stopMusic, music_time);
}

function stopMusic(evt) {
    play_area.style.cursor = null;
    music.pause();
    /*music.currentTime = 0;*/
    for (var a_chair of chairs) {
        a_chair.style.cursor = "pointer";
        a_chair.addEventListener("click", chooseChair);
    }
    var sit_time = Math.random() * ((2000 / round) + 200 - (200 / round) + 200) + (200 / round) + 200;
    console.log(sit_time);
    var delay_sit = setTimeout(sitDownAllPlayers, sit_time);
}

function chooseChair(evt) {
    chair_chosen = this;
    console.log("Chaise choisie !");
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
        if (round <= rounds) {
            button_play_game.style.visibility = "visible";
        } else {
            console.log("Tu as battu tout le monde !");
        }
    } else { //Perdu
        for (var i = 0; i < chairs.length; i++) {
            players[players_positions_alea[i]].style.transform = chairs[i].style.transform;
            players[players.length - 1].classList.add("loser");
            loser_area.appendChild(players[players.length - 1]);
        }
    }
}

function mixPositions(objects) {
    var positions_alea = new Array;
    for (var i = 0; i < objects.length; i++) {
        positions_alea[i] = i;
    }
    for (var position = positions_alea.length - 2; position >= 1; position--) {
        //Hasard reçoit un nombre entier aléatoire entre 0 et position-1
        var alea = Math.floor(Math.random() * (position));
        //Echange
        var save = positions_alea[position];
        positions_alea[position] = positions_alea[alea];
        positions_alea[alea] = save;
    }
    return positions_alea;
}