"use client"
import React, {useContext, useState} from "react";
import styled from "styled-components";
import {Grid} from "semantic-ui-react";
import {GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup, User} from "firebase/auth";
import {GlobalContext} from "../providers/GlobalProvider";
import {useNavigate} from "react-router-dom";


const LoginPageContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100vw;
`;
const LoginPageCard = styled.div`

  background-color: #ffffff;
  width: 275px;
  border-radius: 8px;
  padding: 32px;
  justify-content: center;
  box-shadow: 0px 4px 16px rgba(0, 0, 0, 0.1);
`;
const LoginPageButton = styled.button`
  background-color: #db4437;
  color: #ffffff;
  border-radius: 4px;
  padding: 8px 16px;
  font-size: 18px;
  border: none;
  cursor: pointer;
  width: 85%;


  &:hover {
    background-color: #c33f36;
  }
`;
const LoginPageInput = styled.input`
  font-size: 18px;
  padding: 8px;
  border: 1px solid #cccccc;
  border-radius: 4px;
  font-family: 'Lato', 'Helvetica Neue', Arial, Helvetica, sans-serif;
`;
/**

 LoginPage component displays a login form and handles user authentication with email and password, or Google Sign-In.

 @returns {JSX.Element}
 */
export default function LoginPage(): JSX.Element {

//init useState hooks
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const {setUser, auth, provider} = useContext(GlobalContext).authContext;
    const [error, setError] = useState(null);

    const navigate = useNavigate();

    /**

     Sign in with email and password

     @param {React.FormEvent<HTMLFormElement>} event - The event object for the form submission
     */
    function signInWithEmailAndPasswordHandler(event: React.FormEvent<HTMLFormElement>): void {

        event.preventDefault();

        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
// set user to the signed in user
                const user: User = userCredential.user;
                setUser(user);
// navigate("/"); // Use the navigate hook to go back to the homepage
            })
            .catch((error) => {
                const errorCode = error.code;
                let errorMessage = error.message;
                if (errorCode === "auth/wrong-password" || errorCode === "auth/user-not-found" || errorCode === "auth/invalid-email") {
                    errorMessage = "Invalid email or password";
                }
                setError(errorMessage);
            });
    }

    /**

     Sign in with Google
     */
    function signInWithGoogle(): void {
        signInWithPopup(auth, provider)
            .then((result) => {
// This gives you a Google Access Token. You can use it to access the Google API.
                const credential = GoogleAuthProvider.credentialFromResult(result);
// @ts-ignore
                const token = credential.accessToken;
                // The signed-in user info.
                const user = result.user;
                setUser(user);
            })
            .catch((error) => {
                // Handle Errors here.
                const errorCode = error.code;
                const errorMessage = error.message;
// The email of the user's account used.
                const email = error.email;
// The AuthCredential type that was used.
                const credential = GoogleAuthProvider.credentialFromError(error);
// ...
            });
    };
    return (
        <LoginPageContainer>


            <LoginPageCard>
                <Grid columns={3} divided={true}>

                    <Grid.Row centered verticalAlign={"middle"}>
                        <h1>Sign In</h1>
                    </Grid.Row>

                    <form onSubmit={signInWithEmailAndPasswordHandler} style={{width: "100%", marginBottom: 0}}>
                        <Grid.Row centered verticalAlign={"middle"} style={{padding: 5}}>
                            <label>
                                <LoginPageInput type="email" value={email} placeholder={"email..."}
                                                onChange={(e) => setEmail(e.target.value)}/>
                            </label>
                        </Grid.Row>
                        <Grid.Row centered verticalAlign={"middle"} style={{padding: 5}}>
                            <label>
                                <LoginPageInput type="password" value={password} placeholder={"password"}
                                                onChange={(e) => setPassword(e.target.value)}/>

                            </label>
                            {error && <div style={{color: "red", paddingBottom: "10px"}}>{error}</div>}
                        </Grid.Row>
                        <Grid.Row centered verticalAlign={"middle"} style={{paddingBottom: 0, paddingTop: 4}}>

                            <LoginPageButton onClick={() => {
                            }} style={{width: 202, margin: 5.2}}>Sign In</LoginPageButton>
                        </Grid.Row>
                    </form>
                    <Grid.Row centered verticalAlign={"middle"} style={{padding: 3}}>
                        <h3>or</h3>
                    </Grid.Row>
                    <Grid.Row centered verticalAlign={"middle"} style={{paddingTop: 4}}>
                        <LoginPageButton onClick={signInWithGoogle}>Sign in with Google</LoginPageButton>
                    </Grid.Row>

                </Grid>
            </LoginPageCard>
        </LoginPageContainer>
    );
}
