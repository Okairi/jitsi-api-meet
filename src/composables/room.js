import { ref } from "vue";

const roomName = ref("");
const roomInstance = ref({});
const connectionInstance = ref({});

const videoTracks = ref([]);
const audioTracks = ref([]);

export function useRoom() {
  const setRoomName = (name) => {
    roomName.value = name;
  };
  const setRoomInstance = (room) => {
    roomInstance.value = room;
  };

  const setConnectionInstance = (connection) => {
    connectionInstance.value = connection;
  };

  const setTracks = (track) => {
    if (track.getType() == "audio") {
      audioTracks.value.push(track);
    } else if (track.getType() == "video") {
      videoTracks.value.push(track);
    }
  };

  return {
    roomName,
    setRoomName,
    setRoomInstance,
    roomInstance,
    videoTracks,
    audioTracks,
    setTracks,
    setConnectionInstance,
    connectionInstance,
  };
}
