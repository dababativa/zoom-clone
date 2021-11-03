const express = require('express');
const app = express();
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { v4: uuid } = require('uuid');
const { ExpressPeerServer } = require('peer')
const peerServer = ExpressPeerServer(server, {
    debug:true
})
app.set('view engine', 'ejs');
app.use(express.static('public'))
app.use('/peerjs', peerServer)

app.get('/', (req, res) => {
    res.redirect(`/${uuid()}`)
})

app.get('/:room', (req, res) => {
    res.render('room', { roomId: req.params.room })
})

io.on('connection', socket => {
    socket.on('join-room', (roomId, userId, username)=>{
        console.log(userId)
        socket.join(roomId);
        socket.to(roomId).emit('user-connected', userId, username);
        socket.on('message', (message, username) => {
            io.to(roomId).emit('create-message', message, username)
        })
        // socket.on('disconnect', ()=>{
        //     console.log("user did leave", userId, username)
        //     io.to(roomId).emit('user-disconnected', userId, username)
        // })
    })
    
})

server.listen(process.env.PORT || 3000)