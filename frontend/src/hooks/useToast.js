import { toast } from "react-hot-toast";


export const useToastMessage = () => {
    // ✅ Success Toast
    const success = (message, duration = 3000) => {
        toast.success(message, {
            duration,
            position: "bottom-left",
            style: {
                background: "#ecfdf5",
                color: "#065f46",
                border: "1px solid #34d399",
                padding: "12px 16px",
                borderRadius: "8px",
                fontWeight: 600,
            },
            iconTheme: {
                primary: "#10b981",
                secondary: "#ffffff",
            },
        });
    };

    // ❌ Error Toast
    const error = (message, duration = 4000) => {
        toast.error(message, {
            duration,
            position: "bottom-left",
            style: {
                background: "#fef2f2",
                color: "#991b1b",
                border: "1px solid #f87171",
                padding: "12px 16px",
                borderRadius: "8px",
                fontWeight: 600,
            },
            iconTheme: {
                primary: "#ef4444",
                secondary: "#ffffff",
            },
        });
    };

    return { success, error };
};
