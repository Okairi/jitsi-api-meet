<template>
  <section>
    <p>Estas en el room {{ greatRoomName }}</p>
    <q-btn label="terminar reunión" @click="endMeeting" />
    <!-- <q-btn ref="thegrate" label="unirse" @click="initJitsi" /> -->
    <div class="user">
      <p>LOCAL {{ user.name }}</p>
      <div class="user__ui column items-center">
        <video
          v-for="track in videoTracks"
          :key="track.getId()"
          :srcObject.prop="track.stream"
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
          muted
        ></audio>
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
        </div>
      </div>
    </div>
    <div v-if="participants.length > 0" class="participant-container">
      <label v-for="p in participants" :key="p.id">
        {{ p.participant._displayName }}
      </label>
      <div class="user">
        <div class="user__ui remote column items-center">
          {{ remotevideoTracks.length }}
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
          <!-- <div class="row items-center justify-around full-width">
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
          </div> -->
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
          track.attach(audios.value[track.getId()]);
        } else if (track.getType() == "video") {
          track.attach(videos.value[track.getId()]);
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
        localTracks.value.forEach((track) => addTrack(track));
      }
    );
    watch(
      () => remoteaudioTracks.value,
      (newval) => {
        console.log("HAY DOM PARA REMOTO TRAKCS 🤔", newval);
        remoteaudioTracks.value.forEach((track) => {
          void nextTick(() => {
            track.attach(audiosR.value[track.getId()]);
          });
        });
        remotevideoTracks.value.forEach((track) => {
          void nextTick(() => {
            track.attach(videosR.value[track.getId()]);
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
      router.push({ name: "home" });
    };

    const toggleCamera = () => {
      if (user.cameraOn) {
        videoTracks.value[0].mute();
      } else {
        videoTracks.value[0].unmute();
      }
      updateUser({ cameraOn: !user.cameraOn });
    };
    const toggleMic = () => {
      if (user.micOn) {
        audioTracks.value[0].mute();
      } else {
        audioTracks.value[0].unmute();
      }
      updateUser({ micOn: !user.micOn });
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
    };
  },
});
</script>
<style scoped lang="scss">
@import "./Index.scss";
</style>
