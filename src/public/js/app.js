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
let myPeerConnection;

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

const getMedia = async (deviceId) => {
    const initialConstrains = {
        audio:true,
        video:{facingMode:"user"}
    };
    const cameraConstrains = {
        audio:true,
        video:{deviceId:{exact:deviceId}}
    };
    try {
        myStream = await navigator.mediaDevices.getUserMedia(deviceId ? cameraConstrains : initialConstrains);
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

const initCall = async () =>{
    welcome.hidden = true;
    call.hidden = false;
    await getMedia();
    makeConnection();
}

const handleWelcomeSubmit = async (event) => {
    event.preventDefault();
    const input = welcomeForm.querySelector("input");
    await initCall();
    socket.emit("join_room",input.value);
    roomName = input.value;
    input.value="";
}

welcomeForm.addEventListener("submit",handleWelcomeSubmit);

//Socket Code
socket.on("welcome",async ()=>{
    const offer = await myPeerConnection.createOffer();
    //다른 브라우저가 참가할수있도록 보내는 참가장 ==> offer
    myPeerConnection.setLocalDescription(offer);
    console.log("sent the offer");
    socket.emit("offer",offer,roomName);
});
//먼저 생성된 브라우저에서 createOffer를 세팅하고 다른 브라우저로 offer 전송

socket.on("offer", async (offer) => {
    console.log("received the offer");
    myPeerConnection.setRemoteDescription(offer);
    const answer = await myPeerConnection.createAnswer();
    myPeerConnection.setLocalDescription(answer);
    socket.emit("answer",answer,roomName);
    console.log("sent the answer");
});
//다른 브라우저에서 offer받고 createAnswer세팅 answer를 먼저 생성된 브라우저에게 전송

socket.on("answer",(answer)=>{
    console.log("received the answer");
    myPeerConnection.setRemoteDescription(answer);
})
//먼저 생성된 브라우저에서 answer를 받음

socket.on("ice",(ice)=>{
    console.log("received candidate");
    myPeerConnection.addIceCandidate(ice);
})

//RTC Code
const makeConnection = () => {
    myPeerConnection = new RTCPeerConnection();
    //브라우저간의 연결을 만들어 줌
    myPeerConnection.addEventListener("icecandidate",handleIce);
    myPeerConnection.addEventListener("addstream",handleAddStream);
    myStream.getTracks().forEach((track)=>myPeerConnection.addTrack(track,myStream));
    //브라우저의 카메라,마이크의 데이터 스트림을 받아 연결에 집어넣음
}
//브라우저끼리 연결

const handleIce = (data) => {
    console.log("sent candidate");
    socket.emit("ice",data.candidate,roomName);
}

const handleAddStream = (data) => {
    const peerFace = document.getElementById("peerFace");
    peerFace.srcObject = data.stream;
}