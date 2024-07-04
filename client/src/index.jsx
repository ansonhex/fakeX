import React from "react";
import * as ReactDOMClient from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import App from "./components/App";
import NotFound from "./components/NotFound";
import Home from "./components/Home";
import { Auth0Provider } from "@auth0/auth0-react";
import { AuthTokenProvider } from "./contexts/AuthTokenContext";
import VerifyUser from "./components/VerifyUser";
import PostDetails from "./components/PostDetails";
import RequireAuth from "./components/RequireAuth";
import Profile from "./components/Profile";
import Auth0Debugger from "./components/Auth0Debugger";
import "./index.css";
import { HelmetProvider } from "react-helmet-async";

const container = document.getElementById("root");
const root = ReactDOMClient.createRoot(container);

const requestedScopes = ["profile", "email"];

root.render(
  <React.StrictMode>
    <Auth0Provider
      domain={process.env.REACT_APP_AUTH0_DOMAIN}
      clientId={process.env.REACT_APP_AUTH0_CLIENT_ID}
      authorizationParams={{
        redirect_uri: `${window.location.origin}/verify-user`,
        audience: process.env.REACT_APP_AUTH0_AUDIENCE,
        scope: requestedScopes.join(" "),
      }}
    >
      <AuthTokenProvider>
        <HelmetProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<App />}>
                <Route index element={<Navigate to="/home" />} />
                <Route path="home" element={<Home />} />
                <Route path="verify-user" element={<VerifyUser />} />
                <Route element={<RequireAuth />}>
                  <Route path="posts/:id" element={<PostDetails />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="auth0-debugger" element={<Auth0Debugger />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </HelmetProvider>
      </AuthTokenProvider>
    </Auth0Provider>
  </React.StrictMode>
);
