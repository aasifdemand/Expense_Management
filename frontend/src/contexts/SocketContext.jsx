/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useDispatch, useSelector } from "react-redux";
import { fetchUser } from "../store/authSlice";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const { user } = useSelector((state) => state?.auth);
    const dispatch = useDispatch()
    useEffect(() => {
        dispatch(fetchUser())
    }, [dispatch])

    useEffect(() => {
        if (!user?._id) {
            console.log("No user ID available");
            return;
        }

        console.log("Connecting socket for user:", user._id);

        // Use auth instead of query for Socket.IO v4+
        const newSocket = io("http://localhost:5000", {
            auth: { userId: user._id },
            transports: ["websocket", "polling"],
            reconnection: true,
        });

        setSocket(newSocket);

        // Connection established
        newSocket.on("connect", () => {
            console.log("✅ Socket CONNECTED with ID:", newSocket.id);
        });

        newSocket.on("notification", (data) => {
            console.log("📩 NOTIFICATION RECEIVED:", data);

            if (!data?.message) return;

            // Check for permission
            if (Notification.permission === "granted") {
                new Notification("New Notification", {
                    body: data.message,
                    icon: "/notification-icon.png",
                });
            } else if (Notification.permission !== "denied") {
                Notification.requestPermission().then((permission) => {
                    if (permission === "granted") {
                        new Notification("New Notification", {
                            body: data.message,
                            icon: "/notification-icon.png", // optional
                        });
                    }
                });
            }
        });

        // Connection error
        newSocket.on("connect_error", (error) => {
            console.error("❌ Socket connection error:", error.message);
        });

        // Disconnection
        newSocket.on("disconnect", (reason) => {
            console.log("🔌 Socket disconnected:", reason);
        });

        // Cleanup on unmount or user change
        return () => {
            console.log("Cleaning up socket connection");
            newSocket.disconnect();
        };
    }, [user?._id]);

    return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
};

export const useSocket = () => useContext(SocketContext);
