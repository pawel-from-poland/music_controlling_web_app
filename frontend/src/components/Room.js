import React, { useState, useEffect } from "react";
import { Grid, Button, Typography } from "@material-ui/core";
import CreateRoomPage from "./CreateRoomPage";
import MusicPlayer from "./MusicPlayer";

const Room = (props) => {
  const [votesToSkip, setVotesToSkip] = useState(2);
  const [guestCanPause, setGuestCanPause] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [song, setSong] = useState({});

  let roomCode = props.match.params.roomCode;

  const getCurrentSong = async () => {
    const response = await fetch("../spotify/current-song");
    if (!(response.status === 204)) {
      const data = await response.json();
      setSong(data);
    } else if (song !== {}) setSong({});
  };

  useEffect(() => {
    getRoomDetails();
    const interval = setInterval(getCurrentSong, 1000);

    return () => clearInterval(interval);
  }, []);

  const getRoomDetails = async () => {
    const response = await fetch("/api/get-room" + "?code=" + roomCode);
    if (!response.ok) {
      props.leaveRoomCallback();
      props.history.push("/");
    }
    const data = await response.json();
    setVotesToSkip(data.votes_to_skip);
    setGuestCanPause(data.guest_can_pause);
    setIsHost(data.is_host);
    if (data.is_host) authenticateSpotify();
  };

  const authenticateSpotify = async () => {
    const auth = async () => {
      const response = await fetch("/spotify/get-auth-url");
      const data = await response.json();
      window.location.replace(data.url);
    };

    const response = await fetch("/spotify/is-authenticated");
    if (response.status === 500) auth();
    else {
      const data = await response.json();
      if (!data.status) auth();
    }
  };

  const leaveButtonPressed = async () => {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    };

    await fetch("/api/leave-room", requestOptions);
    props.leaveRoomCallback();
    props.history.push("../");
  };

  const renderSettings = () => (
    <Grid container spacing={1}>
      <Grid item xs={12} align="center">
        <CreateRoomPage
          update={true}
          votesToSkip={votesToSkip}
          guestCanPause={guestCanPause}
          roomCode={roomCode}
          updateCallback={getRoomDetails}
          history={props.history}
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

  const renderSettingsButton = () => (
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

  return showSettings ? (
    renderSettings()
  ) : (
    <Grid container spacing={1}>
      <Grid item xs={12} align="center">
        <Typography variant="h4" component="h4">
          Code: {roomCode}
        </Typography>
      </Grid>
      <MusicPlayer
        {...song}
        votesToSkip={votesToSkip}
        guestCanPause={guestCanPause}
        isHost={isHost}
      />
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
    </Grid>
  );
};

export default Room;
