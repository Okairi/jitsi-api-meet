<template>
  <div>
    <h3>DATOS</h3>
    <q-input v-model="roomName" label="sala" outlined dense />
    <!-- <q-input v-model="userName" label="usuario" outlined dense /> -->
    <q-btn label="GO" color="green" @click="goMeet" />
  </div>
</template>

<script>
import { defineComponent, ref } from "vue";
import { useRouter } from "vue-router";
import { useRoom } from "../composables/room";

export default defineComponent({
  setup() {
    const router = useRouter();
    const roomName = ref("");
    const userName = ref("");
    const { setRoomName } = useRoom();

    const goMeet = () => {
      setRoomName(roomName.value);
      router.push({ name: "meet" });
    };
    return {
      roomName,
      userName,
      goMeet,
    };
  },
});
</script>

<style lang="scss" scoped></style>
