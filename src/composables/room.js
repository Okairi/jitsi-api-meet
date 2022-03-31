import { ref, reactive } from "vue";
import _ from "lodash";

const roomName = ref("");
const userName = ref("");
const roomInstance = ref({});
const connectionInstance = ref({});
const dataMessage = ref([]);

const videoTracks = ref({});
const audioTracks = ref({});
const remotevideoTracks = ref([]);
const remoteaudioTracks = ref([]);

const localTracks = ref([]);
const participants = ref([]);
const user = reactive({
  id: "",
  micOn: true,
  cameraOn: true,
  name: "",
  tracks: [],
  screenShared: false,
  videoActivated: true,
});

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

  const setLocalTracks = (tracks) => {
    localTracks.value = tracks; // audio y video se supone
  };
  const setFilterTracks = (track) => {
    if (track.getType() == "audio") {
      audioTracks.value = track;
    } else if (track.getType() == "video") {
      videoTracks.value = track;
    }
  };

  const setUserName = (name) => {
    userName.value = name;
  };

  const setParticipants = (payload) => {
    const cloneParicipants = _.cloneDeep(participants.value);
    cloneParicipants.push(payload);
    participants.value = cloneParicipants;
  };

  const setFilterRemoteTrack = (track) => {
    let remoteAudioNew = [];
    remoteAudioNew = _.cloneDeep(remoteaudioTracks.value);
    let remoteVideoNew = [];
    remoteVideoNew = _.cloneDeep(remotevideoTracks.value);
    if (track.getType() == "audio") {
      remoteAudioNew.push(track);
      remoteaudioTracks.value = remoteAudioNew;
    } else if (track.getType() == "video") {
      remoteVideoNew.push(track);
      remotevideoTracks.value = remoteVideoNew;
    }
  };
  const updateUser = (payload) => {
    Object.assign(user, { ...user, ...payload });
  };

  const addMessages = (val) => {
    dataMessage.value.push(val);
  };

  return {
    roomName,
    setRoomName,
    setRoomInstance,
    roomInstance,
    videoTracks,
    audioTracks,
    setLocalTracks,
    setConnectionInstance,
    connectionInstance,
    localTracks,
    setFilterTracks,
    userName,
    setUserName,
    setParticipants,
    setFilterRemoteTrack,
    remoteaudioTracks,
    remotevideoTracks,
    participants,
    user,
    updateUser,
    addMessages,
    dataMessage,
  };
}
