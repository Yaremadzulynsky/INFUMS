"use client"
import React, { ReactNode, useContext } from "react";
import { GlobalContext } from "../providers/GlobalProvider";
import { Navigate } from "react-router-dom";

/**
 * A React function component that renders its child components if the user is authenticated. If the user is not
 * authenticated, it will redirect to the login page.
 *
 * @param {Object} props - The properties for the AuthorizationRequired component.
 * @param {ReactNode} props.children - The child components to render if the user is authenticated.
 * @returns {JSX.Element} - The AuthorizationRequired component.
 */
export function AuthorizationRequired({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  // Use the authContext from the GlobalContext provider to get the authenticated user
  const { user } = useContext(GlobalContext).authContext;

  // Render the child components if the user is authenticated, otherwise redirect to the login page

  // NO REDIRECT FOR PUBLIC FACING
  //   return <>{user ? children : <Navigate to="/login"/>}</>;
  return <>{children}</>;
}
