import JitsiMeetJS from "@solyd/lib-jitsi-meet";
import options from "./config";
import { useRoom } from "../composables/room";
import $ from "jquery";
window.$ = $;

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
} = useRoom();

let room = null;
let connection = null;
let joined = false;
const remoteTracks = {};
let participantIds = new Set();
let roomtep = "";

JitsiMeetJS.init();
JitsiMeetJS.setLogLevel(JitsiMeetJS.logLevels.ERROR);

export function createTracksToAddedinRoom(room) {
  JitsiMeetJS.createLocalTracks({
    devices: ["video", "audio"],
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
  videoTracks.value.forEach((track) => track.dispose());
  audioTracks.value.forEach((track) => track.dispose());

  if (room) {
    room.leave();
  }
  if (connection) {
    connection.disconnect();
  }
}

function onConferenceJoined() {
  console.log(" 🚀UNIÉNDOSE A LA CONFERENCIA ");

  joined = true;
  // agregar tracks a la sala
  localTracks.value.forEach((track) => {
    room.addTrack(track);
  });
}
function onRemoteTracks(track) {
  const participant = track.getParticipantId();
  console.log("ID REMOTO", participant);
  console.log("TRACK DEL REMOTO", track);
  // confirmar si existe
  if (!remoteTracks[participant]) {
    console.log("tipo-track-as>", track.getType());
    remoteTracks[participant] = [];
  }
  setFilterRemoteTrack(track);

  // setea track remoto
  // const idx = remoteTracks[participant].push(track);
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
  participantIds.add(arg);
  if (!participants.value.includes(arg)) {
    console.log("USER NUEVO ÚNICO", user);
    setParticipants({ id: arg, participant: user });
  }

  // room.selectParticipant(Array.from(participantIds));
}

function onUserLeft(arg, user) {
  console.log("USUARIO QUE SE VA DE LA SALA", {
    id: arg,
    human: user,
  });
  participantIds.delete(arg);
  // room.selectParticipant(Array.from(participantIds));
}

function onSuccessConnection() {
  //Crear conferencia
  room = connection.initJitsiConference(roomtep, {});
  getLocalTracks();

  room.on(JitsiMeetJS.events.conference.TRACK_ADDED, (track) => {
    !track.isLocal() && onRemoteTracks(track);
  });
  room.on(JitsiMeetJS.events.conference.TRACK_ADDED, (track) => {
    console.log("TRACK REMOVED", track);
  });
  room.on(JitsiMeetJS.events.conference.CONFERENCE_JOINED, onConferenceJoined);
  room.on(JitsiMeetJS.events.conference.USER_JOINED, onUserJoined);
  room.on(JitsiMeetJS.events.conference.USER_LEFT, onUserLeft);
  room.setDisplayName(userName.value);
  setRoomInstance(room);
  room.join();
}

function handleLocalTracks(tracks) {
  setLocalTracks(tracks);
  updateUser({
    tracks: [...tracks],
  });
  localTracks.value.forEach((track) => {
    if (joined) {
      console.log("PARTICPANTE UNIDO?");
      room.addTrack(track);
    }
  });
  // revisar la unión a la sala
  // se deben cargar los tracks a la vista
}

function getLocalTracks() {
  JitsiMeetJS.createLocalTracks({ devices: ["audio", "video"] })
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
