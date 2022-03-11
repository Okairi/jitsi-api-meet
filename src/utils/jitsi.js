import JitsiMeetJS from "@solyd/lib-jitsi-meet";
import options from "./config";
import { useRoom } from "../composables/room";

const { videoTracks, audioTracks } = useRoom();

let room = null;
let connection = null;

JitsiMeetJS.init();
JitsiMeetJS.setLogLevel(JitsiMeetJS.logLevels.INFO);

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

export function connect(roomName) {
  return new Promise((resolve, reject) => {
    const jitsiOptions = { ...options };
    jitsiOptions.serviceUrl = `${jitsiOptions.serviceUrl}?room=${roomName}`;
    connection = new JitsiMeetJS.JitsiConnection(null, null, jitsiOptions);

    connection.addEventListener(
      JitsiMeetJS.events.connection.CONNECTION_ESTABLISHED,
      () => {
        resolve(connection);
      }
    );
    connection.addEventListener(
      JitsiMeetJS.events.connection.CONNECTION_FAILED,
      () => {
        reject("The connection failed.");
      }
    );
    connection.addEventListener(
      JitsiMeetJS.events.connection.CONNECTION_DISCONNECTED,
      diconnectAll
    );

    connection.connect();
  });
}
