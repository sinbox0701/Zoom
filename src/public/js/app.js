const socket = io();

const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const cameraSelect = document.getElementById("cameras");
const call = document.getElementById("call");

call.hidden=true;

let myStream;
let muted = false;
let cameraOff = false;
let roomName;

const getCameras = async () => {
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        //유저가 사용하는 장치들을 받아옴 
        const cameras = devices.filter((device) => device.kind === "videoinput");
        //비디오 장치만 따로 받아옴
        const currentCamera = myStream.getVideoTracks()[0];
        cameras.forEach((camera) => {
            const option = document.createElement("option");
            option.value = camera.deviceId;
            option.innerText = camera.label;
            if(currentCamera.label === camera.label){
                option.selected = true;
            }
            cameraSelect.append(option);
        });
    }catch(e){
        console.log(e);
    }
}
//User가 가지고있는 카메라 리스트 만들기

const getMedia = async (deviceId) => {
    const initialConstrains = {
        audio:true,
        video:{facingMode:"user"}
    };
    //facingMode --> 스마트폰에서는 셀카로 보여지게댐
    const cameraConstrains = {
        audio:true,
        video:{deviceId:{exact:deviceId}}
    };
    //파라미터로 받는 deviceId값을 가지고있는 카메라를 받아옴
    try {
        myStream = await navigator.mediaDevices.getUserMedia(deviceId ? cameraConstrains : initialConstrains);
        //deviceId를 parameter로 가진다면 video:{deviceId:{exact:deviceId}} 이런형태, 아니면 video:{facingMode:"user"} 이런형태 
        myFace.srcObject = myStream;
        if(!deviceId){
            await getCameras();
        }
    }catch(e){
        console.log(e);
    }
}

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

const handleCameraChange = async () => {
    await getMedia(cameraSelect.value);
}

muteBtn.addEventListener("click",handleMuteClick);
cameraBtn.addEventListener("click",handleCameraClick);
cameraSelect.addEventListener("input",handleCameraChange);

//welcome Form (join a room)

const welcome = document.getElementById("welcome");
const welcomeForm = welcome.querySelector("form");

const startMedia = () =>{
    welcome.hidden = true;
    call.hidden = false;
    getMedia();
}

const handleWelcomeSubmit = (event) => {
    event.preventDefault();
    const input = welcomeForm.querySelector("input");
    socket.emit("join_room",input.value,startMedia);
    roomName = input.value;
    input.value="";
}

welcomeForm.addEventListener("submit",handleWelcomeSubmit);

//Socket Code
socket.on("welcome",()=>{
    console.log("someone joined");
})