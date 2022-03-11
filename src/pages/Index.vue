<template>
  <h1>HOLA 👻</h1>
  <p>Esas en el room {{ roomName }}</p>
  <q-btn label="terminar reunión" @click="endMeeting" />
  <!-- <q-btn ref="thegrate" label="unirse" @click="initJitsi" /> -->

  <video
    v-for="track in videoTracks"
    :key="track.getId()"
    :ref="
      ($el) => {
        videos[track.getId()] = $el;
      }
    "
    autoplay
  ></video>
  <audio
    v-for="track in audioTracks"
    :key="track.getId()"
    :ref="
      ($el) => {
        audios[track.getId()] = $el;
      }
    "
    autoplay
  ></audio>
</template>

<script>
import { defineComponent, onMounted, ref, nextTick } from "vue";
import { useRouter } from "vue-router";
import JitsiMeetJS from "@solyd/lib-jitsi-meet";
import {
  createTracksToAddedinRoom,
  createAndJoinRoom,
  connect,
} from "../utils/jitsi";
import { useRoom } from "../composables/room";

export default defineComponent({
  name: "PageIndex",
  setup() {
    const router = useRouter();
    const { roomName, setTracks, audioTracks, videoTracks } = useRoom();
    const audios = ref([]);
    const videos = ref([]);
    const copyConnection = ref({});

    const addTrack = (track) => {
      setTracks(track);
      // set container
      void nextTick(() => {
        if (track.getType() == "audio") {
          track.attach(audios.value[track.getId()]);
        } else if (track.getType() == "video") {
          track.attach(videos.value[track.getId()]);
        }
      });
    };
    onMounted(() => {
      connect(roomName.value)
        .then((connection) => {
          copyConnection.value = connection;
          return createAndJoinRoom(connection, roomName.value);
        })
        .then((room) => {
          room.on(JitsiMeetJS.events.conference.TRACK_ADDED, (track) =>
            addTrack(track)
          );
          createTracksToAddedinRoom(room);
        })
        .catch((error) => console.error(error));
    });
    const endMeeting = () => {
      // clean and redirect
      copyConnection.value.disconnect();
      router.push({ name: "home" });
    };

    return {
      audioTracks,
      videoTracks,
      audios,
      videos,
      roomName,
      endMeeting,
    };
  },
});
</script>
