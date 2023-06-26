var nodemailer = require('nodemailer')
const express = require("express");
const app = express();
const server = require("http").Server(app);
app.set("view engine", "ejs");
app.use(express.static('public'))
const {v4: uuidv4} = require("uuid")

const io = require("socket.io")(server, {cors: {origin: '*'}});
const transpoter = nodemailer.createTransport({ port: 465, 
                                                host: "smtp.gmail.com", 
                                                auth:{user: "yagyajha02jan@gmail.com",
                                                      pass:"johrlsxphfiwctnw"},
                                                secure: true});

const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, {
    debug: true,
});

app.use("/peerjs", peerServer);

app.get("/", (req, res) => {
    res.redirect(`/${uuidv4()}`);
});
app.get("/:root", (req,res)=>{
    res.render("index",{roomId: req.params.room})
});

app.post("/send-mail", (req, res)=>{
    const to=req.body.to;
    const url=req.body.url;
    const mailData={
        from: "yagyajha02jan@gmail.com",
        to: to,
        subject: 'Join Meeting',
        html: `<p>Hey there ! <br> Come and join me for Video Chat.<br>${url}<br>Just Click on the link to join.</p>`
    }
    transpoter.sendMail(mailData, (error, info)=>{
        if(error){
            return console.error(error);
        }else{
            res.status(200).send({message: "Invitation Sent !!", message_id: info.messageId});
        }
    });
});

io.on("connection",(socket) => {
    socket.on('join-room', (roomId, userId, userName)=>{
        socket.join(roomId);
        io.to(roomId).emit("user-connected", userId);
        socket.on('message',(message) =>{
            io.to(roomId).emit("create_message", message, userName)
        });
    });
});

server.listen(3030);
