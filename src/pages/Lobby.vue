<template>
  <section class="lobbyWrapper">
    <h4>Lobby</h4>
    <main class="userWrapper row items-center justify-around col-md-12 q-px-lg">
      <aside class="inputFields col-md-4">
        <q-input label="Usuario" dense outlined />
        <q-input label="Sala" dense outlined />
        <q-btn class="q-mt-md full-width" label="Unirse" color="green" />
      </aside>
      <aside class="previewWrapper col-md-5">
        <div class="videoContainer">
          <video v-show="cameraOn || screen" ref="videoTrack" autoplay></video>
          <div v-if="!cameraOn" class="userAvatar">
            <img
              src="https://api002.backblazeb2.com/file/FractalUpUsersFiles/Businesses/1/pic/profile_pic_mini.png"
              class="userImage"
            />
          </div>
          <audio ref="audioTrack" autoplay muted></audio>
        </div>
        <div class="controls row justify-around">
          <q-btn
            dense
            round
            class="bg-amber"
            :icon="cameraOn ? 'videocam' : 'videocam_off'"
            @click="handleToggleCamera"
          />
          <q-btn
            dense
            round
            class="bg-amber"
            :icon="micOn ? 'mic' : 'mic_off'"
            @click="toggleMic"
          />
          <q-btn
            dense
            round
            class="bg-amber"
            :icon="screen ? 'desktop_windows' : 'desktop_access_disabled'"
            @click="shareScreen"
          />
        </div>
      </aside>
    </main>
  </section>
</template>

<script>
import { onMounted, ref } from "vue";
import JitsiMeetJS from "@solyd/lib-jitsi-meet";

export default {
  name: "Lobby",
  setup() {
    JitsiMeetJS.init();
    const videoTrack = ref({});
    const audioTrack = ref({});
    const lobbyTracks = ref([]);
    const micOn = ref(true);
    const cameraOn = ref(true);
    const screen = ref(false);

    onMounted(() => {
      JitsiMeetJS.createLocalTracks({
        devices: ["audio", "video"],
      })
        .then((tracks) => {
          lobbyTracks.value = tracks;
          tracks.forEach((track) => {
            if (track.getType() == "audio") {
              track.attach(audioTrack.value);
            } else {
              track.attach(videoTrack.value);
            }
          });
        })
        .catch((error) => {
          console.error("There was an error creating the local tracks:", error);
        });
    });

    const toggleMic = () => {
      const localAudioTrack = lobbyTracks.value.find(
        (track) => track.getType() == "audio"
      );
      if (micOn.value) {
        localAudioTrack.mute();
      } else {
        localAudioTrack.unmute();
      }
      micOn.value = !micOn.value;
    };

    const handleToggleCamera = () => {
      const localVideoTrack = lobbyTracks.value.find(
        (track) => track.getType() == "video"
      );
      if (cameraOn.value) {
        localVideoTrack.mute();
      } else {
        localVideoTrack.unmute();
      }
      setTimeout(() => {
        cameraOn.value = !cameraOn.value;
      }, 500);
    };

    const shareScreen = async () => {
      screen.value = !screen.value;
      // apagar cámara, retirar de arreglo
      lobbyTracks.value.forEach((track) => {
        if (track.getType() == "video") {
          track.detach(videoTrack.value);
        }
      });
      if (lobbyTracks.value[1]) {
        lobbyTracks.value[1].dispose();
        lobbyTracks.value.pop();
      }
      // habilitar screen
      const screenTrack = await JitsiMeetJS.createLocalTracks({
        devices: [screen.value ? "desktop" : "video"],
      });
      //actualizar lobbytracks
      lobbyTracks.value.push(screenTrack[0]);
      lobbyTracks.value[1].attach(videoTrack.value);
      console.log("track nuevo con screen", lobbyTracks.value);
    };

    return {
      videoTrack,
      audioTrack,
      micOn,
      cameraOn,
      toggleMic,
      handleToggleCamera,
      screen,
      shareScreen,
    };
  },
};
</script>

<style lang="scss" scoped>
@import "./Lobby.scss";
</style>
