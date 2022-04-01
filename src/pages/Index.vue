<template>
  <section class="room-meet relative-position">
    <p>Estas en el room {{ greatRoomName }}</p>
    <q-btn label="terminar reunión" @click="endMeeting" />
    <div class="user">
      {{ user.name }}
      <div v-show="user.videoActivated" class="videoWrapper">
        <video ref="videoTracks" autoplay muted></video>
      </div>
      <div
        v-show="!user.videoActivated"
        class="user__card column items-center justify-center"
      >
        <img
          src="https://encrypted.fractalup.com/file/MainPublic/fractalup_assets/landing/main.png"
          class="userImage"
        />
        <p>
          <b>
            {{ user.name }}
          </b>
        </p>
      </div>
      <audio style="display: none" ref="audioTracks" autoplay muted></audio>
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
    <div v-if="participants.length > 0" class="participant-container">
      <div v-for="p in participants" :key="p.id" class="user">
        <div v-show="p.videoActivated" class="videoWrapper">
          {{ p.id }} - {{ p.name }}
          <video
            :ref="
              ($el) => {
                videosR[p.id] = $el;
              }
            "
            autoplay
          ></video>
        </div>
        <div
          v-show="!p.videoActivated"
          class="user__card column items-center justify-center"
        >
          <img
            src="https://encrypted.fractalup.com/file/MainPublic/fractalup_assets/landing/main.png"
            class="userImage"
          />
          <p>
            <b> {{ p.id }}-{{ p.name }} </b>
          </p>
        </div>
        <audio
          style="display: none"
          :ref="
            ($el) => {
              audiosR[p.id] = $el;
            }
          "
          autoplay
        ></audio>
        <div class="controls">
          <q-icon :name="p.cameraOn ? 'videocam' : 'videocam_off'" />
          <q-icon :name="p.micOn ? 'mic' : 'mic_off'" />
        </div>
      </div>
    </div>
    <section class="statistics q-pa-sm absolute-top-right q-mr-lg q-mt-lg">
      {{ remoteaudioTracks.length }}
      {{ remotevideoTracks.length }}
      <h6 class="no-margin">Info</h6>
      <p class="no-margin">Participantes en la sala: {{ totalParticipants }}</p>
      <div class="list">
        <p
          v-for="participant in participants"
          :key="participant.id"
          class="no-margin"
        >
          {{ participant.name }}
        </p>
      </div>
    </section>

    <br /><br /><br />

    <br /><br /><br />
    Super chat en vivo
    <br /><br />
    <div class="menuChat row justify-center">
      <div
        v-for="data in dataMessage"
        :key="data.id"
        style="width: 100%; max-width: 400px"
      >
        <q-chat-message
          v-if="data.id === '0903c0ef'"
          :text="[data.message]"
          :sent="data.id === '0903c0ef'"
        />

        <q-chat-message v-if="data.id != '0903c0ef'" :text="[data.message]" />
      </div>
    </div>
    <input
      placeholder="Ingresa el mensaje"
      v-model="message"
      @keyup.enter="sendMessage"
    />

    <q-btn @click="sendMessage" label="Send Message" />
    <q-btn @click="getUserName" label="Get userName" />
    <br />

    <input v-model="idUser" /> Ingresar id del usuario a eliminar de la reunion
    <q-btn @click="kickUser">Eliminar usuario</q-btn>

    {{ dataMessage }}
  </section>
</template>

<script>
// :ref="
//($el) => {
//videosR[track.getId()] = $el;
//}
//"
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
  testeoMessage,
  kickUser,
} from "../utils/jitsi";
import { useRoom } from "../composables/room";
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
      dataMessage,
      userName,
    } = useRoom();
    const audios = ref([]);
    const videos = ref([]);
    const audiosR = ref([]);
    const videosR = ref([]);
    const theroom = route.query.room;
    const userNameQuery = route.query.user;
    const message = ref("");
    const idUser = ref("");
    let statusSendMessage = ref(false);

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
      [() => remoteaudioTracks.value, () => remotevideoTracks.value],
      () => {
        remoteaudioTracks.value.forEach((track) => {
          void nextTick(() => {
            track.attach(audiosR.value[track.getParticipantId()]);
          });
        });
        remotevideoTracks.value.forEach((track) => {
          void nextTick(() => {
            track.attach(videosR.value[track.getParticipantId()]);
          });
        });
      }
    );
    const greatRoomName = computed(() => {
      return roomName.value || theroom;
    });
    const totalParticipants = computed(() => {
      return participants.value.length + 1;
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
    const sendMessage = () => {
      // if (dataMessage.idUser === idUser.value) {
      //   testeoMessage(message.value, dataMessage);
      // }
      // if (dataMessage.value.idUser) {
      //   testeoMessage(message.value);
      //   message.value = "";
      //   statusSendMessage.value = true;
      // }

      testeoMessage(message.value);
      message.value = "";
    };
    const kickUser = () => {
      kickUser(idUser.value, "mal comportamiento");
    };

    const toggleCamera = () => {
      const videoLocalTrack = localTracks.value.find(
        (track) => track.getType() == "video"
      );
      if (user.cameraOn) {
        videoLocalTrack.mute();
        updateUser({ videoActivated: false });
        roomInstance.value.sendCommandOnce("sayhi", {
          value: user.id,
          attributes: { color: "red" },
        });
      } else {
        updateUser({ videoActivated: true });
        roomInstance.value.sendCommandOnce("saybye", {
          value: user.id,
          attributes: { color: "red" },
        });
        nextTick(() => {
          videoLocalTrack.unmute();
        });
      }
      updateUser({ cameraOn: !user.cameraOn });
    };
    const toggleMic = () => {
      const audioLocalTrack = localTracks.value.find(
        (track) => track.getType() == "audio"
      );
      if (user.micOn) {
        audioLocalTrack.mute();
        roomInstance.value.sendCommandOnce("MIC_OFF", {
          value: user.id,
        });
      } else {
        audioLocalTrack.unmute();
        roomInstance.value.sendCommandOnce("MIC_ON", {
          value: user.id,
        });
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
      const desktopTrack = await JitsiMeetJS.createLocalTracks({
        devices: [user.screenShared ? "desktop" : "video"],
      });
      localTracks.value.push(desktopTrack[0]);
      void nextTick(() => {
        localTracks.value[1].attach(videoTracks.value);
      });
      roomInstance.value.addTrack(localTracks.value[1]);
    };

    const getUserName = () => {
      console.log(user.id);
      console.log("show datamessage [] : ", dataMessage.value);
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
      totalParticipants,
      sendMessage,
      message,
      dataMessage,
      userName,
      getUserName,
      kickUser,
      idUser,
      statusSendMessage,
    };
  },
});
</script>
<style scoped lang="scss">
@import "./Index.scss";
</style>
