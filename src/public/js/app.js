const socket = io();

const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");
const room = document.getElementById("room");

room.hidden = true;

let roomName;

const addMessage = (message) => {
    const ul = room.querySelector("ul");
    const li = document.createElement("li");
    li.innerText = message;
    ul.appendChild(li);   
}

const handleNicknameSubmit = (event) => {
    event.preventDefault();
    const input = room.querySelector("#name input");
    socket.emit("nickname", input.value);
};

const handleMessageSubmmit = (event) => {
    event.preventDefault();
    const input = room.querySelector("#msg input");
    const value = input.value;
    socket.emit("new_message", input.value, roomName, ()=>{
        addMessage(`You: ${value}`);
    });
    input.value="";
}

const showRoom = () => {
    welcome.hidden = true;
    room.hidden = false;
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomName}`;
    const msgForm = room.querySelector("#msg");
    const nameForm = room.querySelector("#name");
    msgForm.addEventListener("submit",handleMessageSubmmit);
    nameForm.addEventListener("submit",handleNicknameSubmit);
}

const handleRoomSubmit = (event) => {
    event.preventDefault();
    const roomNameInput = form.querySelector("#roomName");
    const nicknameInput = form.querySelector("#name");
    socket.emit("enter_room", roomNameInput.value, nicknameInput.value, showRoom);
    roomName = roomNameInput.value;
    roomNameInput.value="";
    const changeNameInput = room.querySelector("#name input");
    changeNameInput.value = nicknameInput.value;
}

form.addEventListener("submit",handleRoomSubmit);

socket.on("welcome",(user)=>{
    addMessage(`${user} Joined!`);
});

socket.on("bye",(left)=>{
    addMessage(`${left} Left!`);
})

socket.on("new_message",addMessage);

socket.on("room_change",(rooms)=>{
    const roomList = welcome.querySelector("ul");
    roomList.innerHTML = "";
    if(rooms.legnth === 0){
        return;
    }
    rooms.forEach(room => {
        const li = document.createElement("li");
        li.innerText = room;
        roomList.append(li);
    })
})