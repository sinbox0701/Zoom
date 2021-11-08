const socket = io();

const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const cameraSelect = document.getElementById("cameras");

let myStream;
let muted = false;
let cameraOff = false;

const getCameras = async () => {
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        //유저가 사용하는 장치들을 받아옴 
        const cameras = devices.filter((device) => device.kind === "videoinput");
        //비디오 장치만 따로 받아옴
        cameras.forEach((camera) => {
            const option = document.createElement("option");
            option.value = camera.deviceId;
            option.innerText = camera.label;
            cameraSelect.append(option);
        });
    }catch(e){
        console.log(e);
    }
}
//User가 가지고있는 카메라 리스트 만들기

const getMedia = async () => {
    try {
        myStream = await navigator.mediaDevices.getUserMedia({
            audio:true,
            video:true
        });
        myFace.srcObject = myStream;
        await getCameras();
    }catch(e){
        console.log(e);
    }
}
getMedia();

const handleMuteClick = () => {
    myStream.getAudioTracks().forEach((track) => (track.enabled = !track.enabled));
    if(!muted){
        muteBtn.innerText = "Unmute";
        muted = true;
    }else {
        muteBtn.innerText = "Mute";
        muted = false;
    }
}

const handleCameraClick = () => {
    myStream.getVideoTracks().forEach((track) => (track.enabled = !track.enabled));
    if(cameraOff){
        cameraBtn.innerText = "Turn Camera Off";
        cameraOff = false;
    }else {
        cameraBtn.innerText = "Turn Camera On";
        cameraOff = true;
    }
}

muteBtn.addEventListener("click",handleMuteClick);
cameraBtn.addEventListener("click",handleCameraClick);