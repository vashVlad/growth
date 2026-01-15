"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
    useEffect(() => {
        if ("serviceWorker" in navigator && window.location.hostname !== "localhost") {
            // Only register in production or if specifically testing PWA locally with HTTPS/modified config
            // For localhost dev, often better to skip unless testing offline behavior
            navigator.serviceWorker
                .register("/sw.js")
                .then((registration) => {
                    console.log("SW registered: ", registration);
                })
                .catch((registrationError) => {
                    console.log("SW registration failed: ", registrationError);
                });
        }
    }, []);

    return null;
}
