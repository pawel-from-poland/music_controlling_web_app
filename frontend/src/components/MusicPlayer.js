import React, { useState } from "react";
import KeyboardEventHandler from "react-keyboard-event-handler";
import {
  Grid,
  Typography,
  Card,
  IconButton,
  Slider,
  FormControl,
  FormHelperText,
  RadioGroup,
  Radio,
  FormControlLabel,
  Button,
} from "@material-ui/core";
import PlayArrowIcon from "@material-ui/icons/PlayArrow";
import PauseIcon from "@material-ui/icons/Pause";
import SkipNextIcon from "@material-ui/icons/SkipNext";
import SkipPreviousIcon from "@material-ui/icons/SkipPrevious";
import VolumeDown from "@material-ui/icons/VolumeDown";
import VolumeUp from "@material-ui/icons/VolumeUp";
import RepeatIcon from "@material-ui/icons/Repeat";
import RepeatOneIcon from "@material-ui/icons/RepeatOne";
import ShuffleIcon from "@material-ui/icons/Shuffle";
import Replay5Icon from "@material-ui/icons/Replay5";
import Forward5Icon from "@material-ui/icons/Forward5";
import Forward10Icon from "@material-ui/icons/Forward10";
import Replay10Icon from "@material-ui/icons/Replay10";
import FavoriteIcon from "@material-ui/icons/Favorite";
import FavoriteBorderIcon from "@material-ui/icons/FavoriteBorder";
import "react-scrubber/lib/scrubber.css";

const MusicPlayer = (props) => {
  const [voted, setVoted] = useState(false);
  let progress = props.time,
    volume = props.volume,
    repeatState = props.repeat_state,
    shuffleState = props.shuffle_state;

  const createRequestOptions = (method, body = null) => ({
    method: method,
    headers: { "Content-Type": "application/json" },
    body: body || null,
  });

  const pauseSong = () => {
    const requestOptions = {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
    };
    fetch("/spotify/pause", requestOptions);
  };

  const playSong = () => {
    const requestOptions = {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
    };
    fetch("/spotify/play", requestOptions);
  };

  const skipSong = async () => {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    };
    const response = await fetch("/spotify/skip", requestOptions);
    const data = await response.json();
    setVoted(data.voted);
  };

  const previousSong = () => {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    };
    fetch("/spotify/previous", requestOptions);
  };

  const seek = (time) => {
    progress = time;
    const requestOptions = {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
    };
    fetch(`/spotify/seek?time=${time}`, requestOptions);
  };

  const changeVolume = (newVolume) => {
    volume = newVolume;
    const requestOptions = {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
    };
    fetch(`/spotify/set-volume?new_volume=${newVolume}`, requestOptions);
  };

  const renderPrevious = () =>
    props.isHost ? (
      <IconButton id="previousButton" onClick={() => previousSong()}>
        <SkipPreviousIcon />
      </IconButton>
    ) : null;

  const renderPlayPause = () => (
    <IconButton
      onClick={() => (props.is_playing ? pauseSong() : playSong())}
      id="playPauseButton"
      disabled={!(props.guestCanPause || props.isHost)}
    >
      {props.is_playing ? <PauseIcon /> : <PlayArrowIcon />}
    </IconButton>
  );

  const renderIcons = () => (
    <div>
      {renderPrevious()}
      {renderPlayPause()}
      <IconButton
        id="nextButton"
        onClick={() => skipSong()}
        color={voted ? "primary" : "neutral"}
      >
        <SkipNextIcon />
        {`${props.votes} / ${props.votesToSkip}`}
      </IconButton>
    </div>
  );

  const setRepeat = (e) => {
    const requestOptions = {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
    };

    repeatState = e.target.value;
    fetch(`/spotify/set-repeat?state=${repeatState}`, requestOptions);
  };

  const setShuffle = () => {
    const requestOptions = {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
    };

    shuffleState = !shuffleState;
    fetch(`/spotify/set-shuffle?state=${shuffleState}`, requestOptions);
  };

  const favoriteButtonClicked = () => {
    const requestOptions = {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
    };

    fetch(`/spotify/favorite?song_id=${props.id}`, requestOptions);
  };

  const notFavoriteButtonClicked = () => {
    const requestOptions = {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    };

    fetch(`/spotify/favorite?song_id=${props.id}`, requestOptions);
  };

  const playPauseButton = document.getElementById("playPauseButton");
  const nextButton = document.getElementById("nextButton");
  const prevButton = document.getElementById("previousButton");

  const renderForHost = () => (
    <div>
      <Card>
        <Grid container alignItems="center">
          <Grid item align="center" xs={4}>
            <img src={props.image_url} height="100%" width="100%" />
          </Grid>
          <Grid item align="center" xs={8}>
            <Typography component="h5" variant="h5">
              {props.title}
            </Typography>
            <Typography color="textSecondary" variant="subtitle1">
              {props.artist}
            </Typography>
            {renderIcons()}
            <IconButton
              onClick={() => seek(progress > 13000 ? progress - 13000 : 0)}
            >
              <Replay10Icon />
            </IconButton>
            <IconButton
              onClick={() => seek(progress > 6500 ? progress - 6500 : 0)}
            >
              <Replay5Icon />
            </IconButton>
            <IconButton onClick={() => favoriteButtonClicked()}>
              <FavoriteIcon />
            </IconButton>
            <IconButton onClick={() => notFavoriteButtonClicked()}>
              <FavoriteBorderIcon />
            </IconButton>
            <IconButton onClick={() => setShuffle()}>
              <ShuffleIcon color={shuffleState ? "primary" : "action"} />
            </IconButton>
            <IconButton onClick={() => seek(progress + 4000)}>
              <Forward5Icon />
            </IconButton>
            <IconButton onClick={() => seek(progress + 8000)}>
              <Forward10Icon />
            </IconButton>
          </Grid>
          <Grid item xs={12} align="center">
            <Slider
              value={progress}
              onChangeCommitted={(_e, value) => seek(Math.round(value))}
              aria-labelledby="continuous-slider"
              min={0}
              max={props.duration}
            />
          </Grid>
        </Grid>
      </Card>
      <Grid container spacing={1}>
        <Grid item xs={2} align="right">
          <VolumeDown />
        </Grid>
        <Grid item xs={8} align="center">
          <Slider
            defaultValue={volume}
            onChangeCommitted={(e_, value) => changeVolume(Math.round(value))}
            aria-labelledby="continuous-slider"
          />
        </Grid>
        <Grid item xs={2} align="left">
          <VolumeUp />
        </Grid>
        <Grid item xs={12} align="center">
          <FormControl component="fieldset" disabled={!props.isHost}>
            <FormHelperText>
              <div align="center">Repeat Mode</div>
            </FormHelperText>
            <RadioGroup row value={repeatState} onChange={(e) => setRepeat(e)}>
              <FormControlLabel
                value="off"
                control={<Radio color="neutral" />}
                label="Off"
                labelPlacement="bottom"
              />
              <FormControlLabel
                value="context"
                control={<Radio color="primary" />}
                label={<RepeatIcon />}
                labelPlacement="bottom"
              />
              <FormControlLabel
                value="track"
                control={<Radio color="primary" />}
                label={<RepeatOneIcon />}
                labelPlacement="bottom"
              />
            </RadioGroup>
          </FormControl>
        </Grid>
      </Grid>
      <KeyboardEventHandler
        handleKeys={["space"]}
        onKeyEvent={() => playPauseButton.click()}
      />
      <KeyboardEventHandler
        handleKeys={["ctrl+right"]}
        onKeyEvent={() => nextButton.click()}
      />
      <KeyboardEventHandler
        handleKeys={["ctrl+left"]}
        onKeyEvent={() => prevButton.click()}
      />
      <KeyboardEventHandler
        handleKeys={["right"]}
        onKeyEvent={() => seek(progress + 4000)}
      />
      <KeyboardEventHandler
        handleKeys={["left"]}
        onKeyEvent={() => seek(progress > 6500 ? progress - 6500 : 0)}
      />
    </div>
  );

  const renderForGuest = () => (
    <div>
      <Card>
        <Grid container alignItems="center">
          <Grid item align="center" xs={4}>
            <img src={props.image_url} height="100%" width="100%" />
          </Grid>
          <Grid item align="center" xs={8}>
            <Typography component="h5" variant="h5">
              {props.title}
            </Typography>
            <Typography color="textSecondary" variant="subtitle1">
              {props.artist}
            </Typography>
            {renderIcons()}
          </Grid>
          <Grid item xs={12} align="center">
            <Slider
              value={progress}
              onChangeCommitted={(_e, value) => seek(Math.round(value))}
              aria-labelledby="continuous-slider"
              disabled={true}
              min={0}
              max={props.duration}
            />
          </Grid>
        </Grid>
      </Card>
      <KeyboardEventHandler
        handleKeys={["space"]}
        onKeyEvent={() => playPauseButton.click()}
      />
      <KeyboardEventHandler
        handleKeys={["ctrl+right"]}
        onKeyEvent={() => nextButton.click()}
      />
    </div>
  );

  return props.title ? (
    props.isHost ? (
      renderForHost()
    ) : (
      renderForGuest()
    )
  ) : (
    <Grid container alignItems="center">
      <Grid iems xs={12} align="center">
        <Typography variant="h6" component="h6" align="center">
          Play a Song and/or Refresh the Page! If it doesn't work, try creating
          a new room.
        </Typography>
        <br />
      </Grid>
      <Grid item xs={12} align="center">
        <Button
          variant="contained"
          color="default"
          onClick={() =>
            window
              .open("https://open.spotify.com", "https://open.spotify.com")
              .focus()
          }
        >
          Open Spotify
        </Button>
        <hr />
      </Grid>
    </Grid>
  );
};

export default MusicPlayer;
