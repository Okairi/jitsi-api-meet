<template>
  <section>
    <p>Estas en el room {{ greatRoomName }}</p>
    <q-btn label="terminar reunión" @click="endMeeting" />
    <!-- <q-btn ref="thegrate" label="unirse" @click="initJitsi" /> -->
    <div class="user">
      <p>LOCAL {{ user.name }}</p>
      <div class="user__ui column items-center">
        <video ref="videoTracks" autoplay muted></video>
        <audio ref="audioTracks" autoplay muted></audio>
        <div class="row items-center justify-around full-width">
          <q-btn
            dense
            round
            class="bg-amber"
            :icon="user.cameraOn ? 'videocam' : 'videocam_off'"
            @click="toggleCamera"
          />
          <q-btn
            dense
            round
            class="bg-amber"
            :icon="user.micOn ? 'mic' : 'mic_off'"
            @click="toggleMic"
          />
          <q-btn
            dense
            round
            class="bg-amber"
            :icon="
              user.screenShared ? 'desktop_windows' : 'desktop_access_disabled'
            "
            @click="shareScreen"
          />
        </div>
      </div>
    </div>
    N°participants:{{ participants.length }}
    <br />
    videotracks->{{ remotevideoTracks.length }}
    <div v-if="participants.length > 0" class="participant-container">
      <br />
      <br />
      <div class="user">
        <br />
        <div
          v-for="p in participants"
          :key="p.id"
          class="user__ui remote column items-center"
        >
          <label>{{ p.id }} - {{ p.name }}</label>
          <!-- render tracks -->
          <video
            v-for="track in remotevideoTracks"
            :key="track.getId()"
            :srcObject.prop="track.stream"
            :ref="
              ($el) => {
                videosR[track.getId()] = $el;
              }
            "
            autoplay
          ></video>
          <audio
            v-for="track in remoteaudioTracks"
            :key="track.getId()"
            :ref="
              ($el) => {
                audiosR[track.getId()] = $el;
              }
            "
            autoplay
          ></audio>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import {
  defineComponent,
  onMounted,
  ref,
  nextTick,
  watch,
  computed,
} from "vue";
import { useRouter } from "vue-router";
import { useRoute } from "vue-router";
import JitsiMeetJS from "@solyd/lib-jitsi-meet";
import {
  createTracksToAddedinRoom,
  createAndJoinRoom,
  connect,
} from "../utils/jitsi";
import { useRoom } from "../composables/room";
import $ from "jquery";
window.$ = $;
export default defineComponent({
  name: "PageIndex",
  setup() {
    const router = useRouter();
    const route = useRoute();
    const {
      roomName,
      setFilterTracks,
      audioTracks,
      videoTracks,
      localTracks,
      connectionInstance,
      setUserName,
      participants,
      setFilterRemoteTrack,
      remoteaudioTracks,
      remotevideoTracks,
      updateUser,
      user,
      roomInstance,
    } = useRoom();
    const audios = ref([]);
    const videos = ref([]);
    const audiosR = ref([]);
    const videosR = ref([]);
    const theroom = route.query.room;
    const userNameQuery = route.query.user;

    const addTrack = (track) => {
      setFilterTracks(track);
      // set container
      void nextTick(() => {
        if (track.getType() == "audio") {
          track.attach(audiotracks.value);
          // track.attach(audios.value[track.getId()]);
        } else if (track.getType() == "video") {
          track.attach(videoTracks.value);
          // track.attach(videos.value[track.getId()]);
        }
      });
    };
    const addRemoteTrack = (track) => {
      setFilterRemoteTrack(track);
      // set container
      void nextTick(() => {
        if (track.getType() == "audio") {
          track.attach(audiosR.value[track.getId()]);
        } else if (track.getType() == "video") {
          track.attach(videosR.value[track.getId()]);
        }
      });
    };

    watch(
      () => localTracks.value,
      (newval) => {
        localTracks.value.forEach((track) => {
          if (track.getType() == "audio") {
            track.attach(audioTracks.value);
          } else {
            track.attach(videoTracks.value);
          }
        });
      }
    );
    watch(
      () => remoteaudioTracks.value,
      (newval) => {
        console.log("HAY DOM PARA REMOTO TRAKCS 🤔", newval);
        remoteaudioTracks.value.forEach((track) => {
          void nextTick(() => {
            track.attach(audiosR.value[track.getId()]);
            console.log("refs de audios->", audiosR.value);
          });
        });
        remotevideoTracks.value.forEach((track) => {
          void nextTick(() => {
            track.attach(videosR.value[track.getId()]);
            console.log("refs de videos->", videosR.value);
          });
        });
      }
    );
    const greatRoomName = computed(() => {
      return roomName.value || theroom;
    });

    setUserName(userNameQuery);
    updateUser({
      name: userNameQuery,
    });

    onMounted(() => {
      connect(greatRoomName.value);
      // connect(roomName.value)
      //   .then((connection) => {
      //     copyConnection.value = connection;
      //     return createAndJoinRoom(connection, roomName.value);
      //   })
      //   .then((room) => {
      //     room.on(JitsiMeetJS.events.conference.TRACK_ADDED, (track) =>
      //       addTrack(track)
      //     );
      //     createTracksToAddedinRoom(room);
      //   })
      //   .catch((error) => console.error(error));
    });
    const endMeeting = () => {
      // clean and redirect
      connectionInstance.value.disconnect();
      router.push({ name: "end" });
    };

    const toggleCamera = () => {
      const videoLocalTrack = localTracks.value.find(
        (track) => track.getType() == "video"
      );
      if (user.cameraOn) {
        videoLocalTrack.mute();
      } else {
        videoLocalTrack.unmute();
      }
      updateUser({ cameraOn: !user.cameraOn });
    };
    const toggleMic = () => {
      console.log("room instance", roomInstance.value);
      const audioLocalTrack = localTracks.value.find(
        (track) => track.getType() == "audio"
      );
      if (user.micOn) {
        audioLocalTrack.mute();
      } else {
        audioLocalTrack.unmute();
      }
      updateUser({ micOn: !user.micOn });
    };

    const shareScreen = async () => {
      // dispose video
      updateUser({ screenShared: !user.screenShared });
      // remove video local
      // localTracks.value.forEach((track) => {
      //   if (track.getType() == "video") {
      //     track.detach(videoTracks.value);
      //   }
      // });
      if (localTracks.value[1]) {
        localTracks.value[1].dispose();
        localTracks.value.pop();
      }
      console.log("local sin cámara->", localTracks.value);
      const desktopTrack = await JitsiMeetJS.createLocalTracks({
        devices: [user.screenShared ? "desktop" : "video"],
      });
      localTracks.value.push(desktopTrack[0]);
      void nextTick(() => {
        localTracks.value[1].attach(videoTracks.value);
      });
      roomInstance.value.addTrack(localTracks.value[1]);
    };

    return {
      audioTracks,
      videoTracks,
      audios,
      videos,
      roomName,
      endMeeting,
      greatRoomName,
      remoteaudioTracks,
      remotevideoTracks,
      videosR,
      audiosR,
      participants,
      toggleCamera,
      user,
      updateUser,
      toggleMic,
      roomInstance,
      shareScreen,
    };
  },
});
</script>
<style scoped lang="scss">
@import "./Index.scss";
</style>
