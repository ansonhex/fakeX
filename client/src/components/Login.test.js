import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import Login from "./Login";
import { useAuth0 } from "@auth0/auth0-react";

// Mock Auth0
jest.mock("@auth0/auth0-react");

describe("Login Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders login and signup when not authenticated", () => {
    useAuth0.mockReturnValue({
      isAuthenticated: false,
      loginWithRedirect: jest.fn(),
      logout: jest.fn(),
    });

    render(<Login />);

    // check if login is rendered
    const loginButton = screen.getByText("Login");
    expect(loginButton).toBeInTheDocument();

    // check if Sign up
    const signUpButton = screen.getByText("Sign Up");
    expect(signUpButton).toBeInTheDocument();
  });

  it("renders logout when authenticated", () => {
    useAuth0.mockReturnValue({
      isAuthenticated: true,
      loginWithRedirect: jest.fn(),
      logout: jest.fn(),
    });

    render(<Login />);

    // check if logout is rendered
    const logoutButton = screen.getByText("Logout");
    expect(logoutButton).toBeInTheDocument();
  });

  it("calls loginWithRedirect when login is clicked", () => {
    const mockLoginWithRedirect = jest.fn();
    useAuth0.mockReturnValue({
      isAuthenticated: false,
      loginWithRedirect: mockLoginWithRedirect,
      logout: jest.fn(),
    });

    render(<Login />);

    const loginButton = screen.getByText("Login");
    fireEvent.click(loginButton);
    expect(mockLoginWithRedirect).toHaveBeenCalled();
  });

  it("calls logout when logout is clicked", () => {
    const mockLogout = jest.fn();
    useAuth0.mockReturnValue({
      isAuthenticated: true,
      loginWithRedirect: jest.fn(),
      logout: mockLogout,
    });

    render(<Login />);

    const logoutButton = screen.getByText("Logout");
    fireEvent.click(logoutButton);

    expect(mockLogout).toHaveBeenCalled();
  });
});
