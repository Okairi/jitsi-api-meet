import JitsiMeetJS from "@solyd/lib-jitsi-meet";
import options from "./config";
import { useRoom } from "../composables/room";

const {
  videoTracks,
  audioTracks,
  setConnectionInstance,
  setLocalTracks,
  setRoomInstance,
  roomName,
  localTracks,
  userName,
  setParticipants,
  updateUser,
  participants,
  setFilterRemoteTrack,
  remotevideoTracks,
  addMessages,
  user,
} = useRoom();

let room = null;
let connection = null;
let joined = false;
const remoteTracks = {};
let participantIds = new Set();
let roomtep = "";

JitsiMeetJS.init({
  disableAudioLevels: false,
});
JitsiMeetJS.setLogLevel(JitsiMeetJS.logLevels.ERROR);

export function createTracksToAddedinRoom(room) {
  JitsiMeetJS.createLocalTracks({
    devices: ["audio"],
  })
    .then((tracks) => {
      tracks.forEach((track) => {
        room.addTrack(track);
      });
    })
    .catch((error) => {
      console.error("There was an error creating the local tracks:", error);
    });
}

export function createAndJoinRoom(connection, roomName) {
  return new Promise((resolve) => {
    room = connection.initJitsiConference(roomName, {});

    room.on(JitsiMeetJS.events.conference.CONFERENCE_JOINED, () => {
      console.log("onConferenceJoined", arguments);
      resolve(room);
    });
    room.join();
  });
}

function diconnectAll() {
  localTracks.value.forEach((track) => {
    track.dispose();
  });

  if (room) {
    room.leave();
  }
  if (connection) {
    connection.disconnect();
  }
}

// export const sendMessage = () => {
// room.sendMessage("hello").then(() => {
//   console.log("test");
// });
// };

// export const sendMessage = async () => {
//   if (room) {
//     room.on.sendTextMessage("test");
//   } else {
//     room.on.sendTextMessage("default");
//   }
// };

function onConferenceJoined() {
  console.log(" 🚀UNIÉNDOSE A LA CONFERENCIA ");
  joined = true;
  // agregar tracks a la sala
  updateUser({ id: room.myUserId() });
  localTracks.value.forEach((track) => {
    room.addTrack(track);
  });
}
function onRemoteTracks(track) {
  const participant = track.getParticipantId();
  // confirmar si existe
  console.log("tipo-track-as>", track.getType());
  if (!remoteTracks[participant]) {
    remoteTracks[participant] = [];
  }
  setFilterRemoteTrack(track);
  // if(track.getType() == 'video'){
  //   track.attach()
  // }
  // setea track remoto
  const idx = remoteTracks[participant].push(track);
  // console.log("remotTRACKS 🤔", remoteTracks);

  // const id = participant + track.getType() + idx;

  // if (track.getType() === "video") {
  //   $("body").append(`<video autoplay='1' id='${participant}video${idx}' />`);
  // } else {
  //   $("body").append(`<audio autoplay='1' id='${participant}audio${idx}' />`);
  // }
  // track.attach($(`#${id}`)[0]);
}

function onUserJoined(arg, user) {
  console.log("SOLO USER JOINED REMOTO");
  if (!participants.value.includes(arg)) {
    participantIds.add(arg);
    setParticipants({
      id: arg,
      participant: user,
      name: user._displayName,
      micOn: true,
      cameraOn: true,
      screenShared: false,
      tracks: user._tracks,
      videoActivated: true,
    });
  }
}

function onUserLeft(arg, user) {
  console.log("USUARIO QUE SE VA DE LA SALA", {
    id: arg,
    human: user,
  });
  participantIds.delete(arg);
  // room.selectParticipant(Array.from(participantIds));
}

function onKicked(arg, user) {
  console.log("Se expulso al estudiante", {
    id: arg,
    human: user,
  });

  // room.selectParticipant(Array.from(participantIds));
}

function on_recived(id, message, timestamp) {
  console.log("Recibiendo mensaje", {
    id,
    message,
    timestamp,
    user: this.user,
  });
  addMessages({ id, message, user: this.user });
}

function getUserById(id) {
  return participants.value.find((p) => p.id == id);
}
export const testeoMessage = (userData) => {
  // room.sendMessage(userData);

  room.sendTextMessage(userData);
};

export const kickUser = (id, reason) => {
  // room.sendMessage(userData);

  room.kickParticipant(id, reason);
};

export const listMessage = () => {
  room.sendTextMessage(userData);
};

function handleHi(args) {
  console.log("comando sayhi recibido", args);
  const user = getUserById(args.value);
  if (user) {
    user.videoActivated = false;
    user.cameraOn = false;
  }
}
function turnOnCamera(args) {
  const user = getUserById(args.value);
  if (user) {
    user.videoActivated = true;
    user.cameraOn = true;
  }
}

function turnOnMicrophone(args) {
  const user = getUserById(args.value);
  if (user) {
    user.micOn = true;
  }
}

function turnOffMicrophone(args) {
  const user = getUserById(args.value);
  if (user) {
    user.micOn = false;
  }
}

function onSuccessConnection() {
  //Crear conferencia
  room = connection.initJitsiConference(roomtep, {
    p2p: {
      enabled: false,
    },
  });
  getLocalTracks();

  room.on(JitsiMeetJS.events.conference.TRACK_ADDED, (track) => {
    !track.isLocal() && onRemoteTracks(track);
  });
  room.on(JitsiMeetJS.events.conference.TRACK_REMOVED, (track) => {
    console.log("REMOVED TRACK", track);
    const index = remotevideoTracks.value.findIndex(
      (rm) => rm.getId() == track.getId()
    );
    console.log("index encontrado del elminado", index);
    console.log("remotevideotr", remotevideoTracks.value);
    // if (index > 0) {
    //   remotevideoTracks.value.splice(index, 1);
    // }
    const participantId = track.getParticipantId();
    delete remoteTracks[participantId];
    const ownser = participants.value.find((p) => p.id == participantId);
  });
  room.on(JitsiMeetJS.events.conference.CONFERENCE_JOINED, onConferenceJoined);
  room.on(JitsiMeetJS.events.conference.USER_JOINED, onUserJoined);
  room.on(JitsiMeetJS.events.conference.USER_LEFT, onUserLeft);
  room.on(JitsiMeetJS.events.conference.KICKED, onKicked);
  room.on(JitsiMeetJS.events.conference.MESSAGE_RECEIVED, on_recived);
  room.on(JitsiMeetJS.events.conference.TRACK_MUTE_CHANGED, (track) => {
    console.log("track cambiado", track);
  });
  room.addCommandListener("sayhi", handleHi);
  room.addCommandListener("saybye", turnOnCamera);
  room.addCommandListener("MIC_ON", turnOnMicrophone);
  room.addCommandListener("MIC_OFF", turnOffMicrophone);
  room.setDisplayName(userName.value);
  setRoomInstance(room);
  room.join();
}

function handleLocalTracks(tracks) {
  setLocalTracks(tracks);
  updateUser({
    tracks: [...tracks],
  });
  console.log("PARTICPANTE UNIDO?");
  localTracks.value.forEach((track) => {
    if (joined) {
      room.addTrack(track);
    }
  });
}

function getLocalTracks() {
  JitsiMeetJS.createLocalTracks({ devices: ["audio"] })
    .then(handleLocalTracks)
    .catch((error) => console.log(error));
}
export function connect(roomName) {
  // const queryRoomName = route.query.room;
  roomtep = roomName;
  // return new Promise((resolve, reject) => {
  const jitsiOptions = { ...options };
  jitsiOptions.serviceUrl = `${jitsiOptions.serviceUrl}?room=${roomName}`;
  connection = new JitsiMeetJS.JitsiConnection(null, null, jitsiOptions);
  setConnectionInstance(connection);
  connection.addEventListener(
    JitsiMeetJS.events.connection.CONNECTION_ESTABLISHED,
    onSuccessConnection
  );
  connection.addEventListener(
    JitsiMeetJS.events.connection.CONNECTION_FAILED,
    () => {
      console.log("The connection failed.");
    }
  );
  connection.addEventListener(
    JitsiMeetJS.events.connection.CONNECTION_DISCONNECTED,
    diconnectAll
  );

  connection.connect();

  // });
}
