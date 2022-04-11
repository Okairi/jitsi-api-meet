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
///
const remoteAudioNew = ref([]);
const remoteVideoNew = ref([]);

const user = reactive({
  id: "",
  micOn: true,
  cameraOn: true,
  name: "",
  tracks: [],
  screenShared: false,
  videoActivated: true,
});
const userUpHand = ref([]);

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
    remoteAudioNew.value = _.cloneDeep(remoteaudioTracks.value);
    remoteVideoNew.value = _.cloneDeep(remotevideoTracks.value);
    if (track.getType() == "audio") {
      remoteAudioNew.value = [...remoteAudioNew.value, track];
      remoteaudioTracks.value = remoteAudioNew.value;
    } else if (track.getType() == "video") {
      remoteVideoNew.value = [...remoteVideoNew.value, track];
      remotevideoTracks.value = remoteVideoNew.value;
    }
  };
  const updateUser = (payload) => {
    Object.assign(user, { ...user, ...payload });
  };

  const addMessages = (val) => {
    dataMessage.value = [...dataMessage.value, val];
  };
  const addHandTestAdd = (val) => {
    userUpHand.value = [...userUpHand.value, val];
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
    userUpHand,
    addHandTestAdd,
  };
}
