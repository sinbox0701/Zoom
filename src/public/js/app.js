const socket = io();

const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");

let myStream;
let muted = false;
let cameraOff = false;

const getMedia = async () => {
    try {
        myStream = await navigator.mediaDevices.getUserMedia({
            audio:true,
            video:true
        });
        myFace.srcObject = myStream;
    }catch(e){
        console.log(e);
    }
}
getMedia();

const handleMuteClick = () => {
    if(!muted){
        muteBtn.innerText = "Unmute";
        muted = true;
    }else {
        muteBtn.innerText = "Mute";
        muted = false;
    }
}
//소리 on/off function

const handleCameraClick = () => {
    if(cameraOff){
        cameraBtn.innerText = "Turn Camera Off";
        cameraOff = false;
    }else {
        cameraBtn.innerText = "Turn Camera On";
        cameraOff = true;
    }
}
//카메라 on/off function

muteBtn.addEventListener("click",handleMuteClick);
cameraBtn.addEventListener("click",handleCameraClick);