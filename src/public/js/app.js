const socket = io();

const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");

function backendDone(msg){
    console.log(`The backend says: `, msg);
    //msg: backend의 done("Hello from backend");
}
function handleRoomSubmit(event) {
    event.preventDefault();
    const input = form.querySelector("input");
    socket.emit("enter_room",{payload: input.value}, backendDone);
    //emit --> "event name" (어떤 이벤트던 만들 수 있음), {key:value}형식의 javascript object 전송 가능
    input.value="";
}

form.addEventListener("submit",handleRoomSubmit)