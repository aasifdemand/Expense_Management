/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { io } from "socket.io-client";

const socket = io("http://localhost:5000", {
    query: { userId: "68d40cca0e7c9fb7d501f7fd" },
});

socket.on("connect", () => {
    console.log("✅ Connected:", socket.id);
});

socket.on("notification", (msg) => {
    console.log("📩 Got notification:", msg);
});
