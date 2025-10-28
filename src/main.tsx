import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { I18nextProvider } from "react-i18next";
import { Toaster } from "sonner";

import App from "./App";
import RootProvider from "@/providers/RootProvider";
import i18n from "@/lib/i18n/i18n";
import "@/index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {/* 🌍 Global translation context */}
    <I18nextProvider i18n={i18n}>
      {/* 🧭 Router context */}
      <BrowserRouter>
        {/* 🔐 Auth/session + Zustand provider */}
        <RootProvider>
          {/* 🧩 App routes */}
          <App />
          {/* 🔔 Global toast handler */}
          <Toaster
            position='top-center'
            richColors
            expand={true}
            duration={3500}
          />
        </RootProvider>
      </BrowserRouter>
    </I18nextProvider>
  </React.StrictMode>
);
