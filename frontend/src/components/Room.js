import React, { useState, useEffect } from "react";
import { Grid, Button, Typography } from "@material-ui/core";
import CreateRoomPage from "./CreateRoomPage";
import MusicPlayer from "./MusicPlayer";

const Room = props => {
  const [votesToSkip, setVotesToSkip] = useState(2);
  const [guestCanPause, setGuestCanPause] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [song, setSong] = useState({});
  
  let roomCode = props.match.params.roomCode;

  const getCurrentSong = async () => {
    fetch("../spotify/current-song")
      .then(response => response.json()).catch(() => {})
      .then(data => {
        setSong(data);
        if (data === {}) authenticateSpotify();
      });
  }

  useEffect(() => {
    getRoomDetails();
    const interval = setInterval(getCurrentSong, 250);

    return () => clearInterval(interval);
  }, [isHost]);

  const getRoomDetails = () => {
    fetch("/api/get-room" + "?code=" + roomCode)
    .then(response => {
      if (!response.ok) {
        props.leaveRoomCallback();
        props.history.push("/");
      }
      return response.json();
    })
    .then(data => {
      setVotesToSkip(data.votes_to_skip);
      setGuestCanPause(data.guest_can_pause);
      setIsHost(data.is_host);
      return data.is_host;
    })
    .then(data => data ? authenticateSpotify() : null);
  }

  const authenticateSpotify = () => {
    fetch("/spotify/is-authenticated")
      .then(response => {
        if (response.status === 500) {
          fetch("/spotify/get-auth-url")
            .then(response => response.json())
            .then(data => window.location.replace(data.url));
        }        
        return response.json()
      })
      .then(data => {
        if (!data.status) {
          fetch("/spotify/get-auth-url")
            .then(response => response.json())
            .then(data => window.location.replace(data.url));
        }
      });
  }

  const leaveButtonPressed = () => {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    };
    fetch("/api/leave-room", requestOptions).then(_response => {
      props.leaveRoomCallback();
      props.history.push("/");
    });
  }

  const renderSettings = () => {
    return (
      <Grid container spacing={1}>
        <Grid item xs={12} align="center">
          <CreateRoomPage
            update={true}
            votesToSkip={votesToSkip}
            guestCanPause={guestCanPause}
            roomCode={roomCode}
            updateCallback={getRoomDetails}
            history = {props.history}
          />
        </Grid>
        <Grid item xs={12} align="center">
          <Button
            variant="contained"
            color="secondary"
            onClick={() => setShowSettings(false)}
          >
            Close
          </Button>
        </Grid>
      </Grid>
    );
  }

  const renderSettingsButton = () => {
    return (
      <Grid item xs={12} align="center">
        <Button
          variant="contained"
          color="primary"
          onClick={() => setShowSettings(true)}
        >
          Settings
        </Button>
      </Grid>
    );
  }

  
  
  return showSettings ? renderSettings() 
  : (<Grid container spacing={1}>
      <Grid item xs={12} align="center">
        <Typography variant="h4" component="h4">
          Code: {roomCode}
        </Typography>
      </Grid>
      <MusicPlayer {...song} votesToSkip={votesToSkip} guestCanPause={guestCanPause} isHost={isHost} song={song} />
      {isHost ? renderSettingsButton() : null}
      <Grid item xs={12} align="center">
        <Button
          variant="contained"
          color="secondary"
          onClick={leaveButtonPressed}
        >
          Leave Room
        </Button>
      </Grid>
    </Grid>);
}

export default Room;