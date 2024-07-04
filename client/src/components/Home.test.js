import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { AuthTokenProvider, useAuthToken } from "../contexts/AuthTokenContext";
import Home from "../components/Home";
import { Navigate } from "react-router-dom";
import App from "../components/App";
import { HelmetProvider } from "react-helmet-async";

// Mock Auth0
jest.mock("@auth0/auth0-react");

// Mock useAuthToken
jest.mock("../contexts/AuthTokenContext", () => ({
  ...jest.requireActual("../contexts/AuthTokenContext"),
  useAuthToken: jest.fn(),
}));

describe("Home Page", () => {
  beforeEach(() => {
    useAuth0.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
    });

    useAuthToken.mockReturnValue({
      accessToken: "fakeAccessToken",
    });
  });

  it("should display a warning for unauthenticated users", () => {
    const { container, debug } = render(
      <AuthTokenProvider>
        <HelmetProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<App />}>
                <Route index element={<Navigate to="/home" />} />
                <Route path="home" element={<Home />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </HelmetProvider>
      </AuthTokenProvider>
    );

    debug(container);

    const alertMessage = screen.getByText((content, element) => {
      return content.includes(
        "You are not logged in. Only the latest 5 posts are shown."
      );
    });
    expect(alertMessage).toBeInTheDocument();
  });
});
