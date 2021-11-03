// Prod
const socket = io();
// Dev
// const socket = io('localhost:3000');
const videoGrid = document.getElementById('video-grid')
const myVideo = document.createElement('video')
myVideo.muted = true;
const names = ["Pepito", "Luna Lunera", "Cascabelera", "Natsu", "Sapo", "Isis"]
let currentUsername = names[parseInt(Math.random()*(0,6))];
$('ul').append(`<li class="join-left"> Welcome ${currentUsername} </li>`)

let peerId;

var peer = new Peer(undefined, {
    path: '/peerjs',
    host: '/',
    // Prod
    port: '443'
    // Dev
    // port: '3000'
})

let myVideoStream;
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true,
}).then(stream => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream)

    peer.on('call', call => {
        call.answer(stream)
        const video = document.createElement('video')
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream)
        })
    })


    socket.on('user-connected', (userId, username) => {
        connectToNewUser(userId, stream, username)
    })

    socket.on('create-message', (message, user)=>{
        console.log(message)
        $('ul').append(`<li class="message"> <b>${user}</b> <br/> ${message} </li>`)
        scrollBottom();
    })

    // socket.on('user-disconnected', (peerId, username)=>{
    //     document.getElementById(peerId).remove();
    //     $('ul').append(`<li class="join-left"> ${username} left </li>`)
    // })
});

peer.on('open', id => {
    peerId = id;
    socket.emit('join-room', ROOM_ID, id, currentUsername)
})

const disconnectFromChat = () => {
    socket.emit('message', peerId, currentUsername)
}



const connectToNewUser = (userId, stream, username) => {
    const call = peer.call(userId, stream);
    const video = document.createElement('video');
    video.setAttribute('id', userId)
    $('ul').append(`<li class="join-left"> ${username} joined </li>`)
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
    })
}

const addVideoStream = (video, stream) => {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play();
    })
    videoGrid.append(video)
}

let text = $('input')
$('html').keydown((event) => {
    if (event.which == 13 && text.val().length !== 0) {
        console.log(currentUsername)
        socket.emit('message', text.val(), currentUsername);
        text.val('')
    }
})

const scrollBottom = () => {
    let d = $('.main-chat-window');
    d.scrollTop(d.prop("scrollHeight"))
}

const muteUnmute = () => {
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if(enabled){
        myVideoStream.getAudioTracks()[0].enabled = false;
        setUnmuteButton();
    } else {
        setMuteButton();
        myVideoStream.getAudioTracks()[0].enabled = true;
    }
}

const setUnmuteButton = () =>{
    const html = `<span class="unmute icons"><i class="fas fa-microphone-slash"></i></span>
    <span>Unmute</span>`
    document.querySelector('.main-mute-button').innerHTML = html
}

const setMuteButton = () =>{
    const html = `<span class="icons"><i class="fas fa-microphone"></i></span>
    <span>Mute</span>`
    document.querySelector('.main-mute-button').innerHTML = html
}

const playStop = () => {
    let enabled = myVideoStream.getVideoTracks()[0].enabled;
    if(enabled){
        myVideoStream.getVideoTracks()[0].enabled = false;
        setPlayVideo();
    } else {
        setStopVideo();
        myVideoStream.getVideoTracks()[0].enabled = true;
    }
}

const setStopVideo = () =>{
    const html = `<span class=" icons"><i class="fas fa-video"></i></span>
    <span>Stop Video</span>`
    document.querySelector('.main-video-button').innerHTML = html
}

const setPlayVideo = () =>{
    const html = `<span class="icons stop"><i class="fas fa-video-slash"></i></span>
    <span>Start Video</span>`
    document.querySelector('.main-video-button').innerHTML = html
}