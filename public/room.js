
const socket = io("localhost:3000");
const videoGrid = document.getElementById('video-grid')
const myVideo = document.createElement('video')
myVideo.muted = true;

var peer = new Peer(undefined, {
    path: '/peerjs',
    host: '/',
    port: '443'
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


    socket.on('user-connected', (userId) => {
        connectToNewUser(userId, stream)
    })

    socket.on('create-message', (message)=>{
        console.log(message)
        $('ul').append(`<li class="message"> <b>user</b> <br/> ${message} </li>`)
        scrollBottom();
    })

});

peer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id)
})



const connectToNewUser = (userId, stream) => {
    const call = peer.call(userId, stream);
    const video = document.createElement('vide');
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
        socket.emit('message', text.val());
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