import React, { useState } from 'react';
import KeyboardEventHandler from 'react-keyboard-event-handler';
import { Grid, Typography, Card, IconButton, Slider, FormControl, FormHelperText, RadioGroup, Radio, FormControlLabel } from '@material-ui/core';
import PlayArrowIcon from "@material-ui/icons/PlayArrow";
import PauseIcon from "@material-ui/icons/Pause";
import SkipNextIcon from "@material-ui/icons/SkipNext";
import SkipPreviousIcon from "@material-ui/icons/SkipPrevious";
import { Scrubber } from 'react-scrubber';
import VolumeDown from '@material-ui/icons/VolumeDown';
import VolumeUp from '@material-ui/icons/VolumeUp';
import RepeatIcon from '@material-ui/icons/Repeat';
import RepeatOneIcon from '@material-ui/icons/RepeatOne';

import 'react-scrubber/lib/scrubber.css';


const MusicPlayer = props => {
    const [voted, setVoted] = useState(false);
    let progress = props.time,
        volume = props.volume,
        repeatState = props.repeat_state;
    
    const pauseSong = () => {
        const requestOptions = {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
        };
        fetch('/spotify/pause', requestOptions);
    };

    const playSong = () => {
        const requestOptions = {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
        };
        fetch('/spotify/play', requestOptions);
    };

    const skipSong = async () => {
        const requestOptions = {
            method: "POST",
            headers: {'Content-Type': 'application/json'},
        };
        const response = await (await fetch('/spotify/skip', requestOptions)).json();
        setVoted(response.voted);
    };

    const previousSong = () => {
        const requestOptions = {
            method: "POST",
            headers: {'Content-Type': 'application/json'},
        };
        fetch('/spotify/previous', requestOptions);
    };

    const seek = time => {
        progress = time;
        const requestOptions = {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
        };
        fetch(`/spotify/seek?time=${time}`, requestOptions);
    };

    const changeVolume = newVolume => {
        volume = newVolume;
        const requestOptions = {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
        };
        fetch(`/spotify/set_volume?new_volume=${newVolume}`, requestOptions);
    };

    const renderPrevious = () => {
        return props.isHost ? (<IconButton id="previousButton" onClick={() => previousSong()}>
            <SkipPreviousIcon />
        </IconButton>) : null;
    };

    const renderPlayPause = () => {
        return (<IconButton onClick={() => (props.is_playing ? pauseSong() : playSong())} id="playPauseButton" disabled={!(props.guestCanPause || props.isHost)}>
            {props.is_playing ? <PauseIcon /> : <PlayArrowIcon />}
        </IconButton>);
    };

    const renderIcons = () => {
        return (<div>
            {renderPrevious()}
            {renderPlayPause()}
            <IconButton id="nextButton" onClick={() => skipSong()} color={voted ? 'primary' : 'neutral'}>
                <SkipNextIcon />{`${props.votes} / ${props.votesToSkip}`}
            </IconButton>
        </div>);
    };

    const setRepeat = e => {
        const requestOptions = {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
        };
        
        repeatState = e.target.value;
        fetch(`/spotify/set_repeat?state=${repeatState}`, requestOptions);
    };

    const playPauseButton = document.getElementById('playPauseButton');
    const nextButton = document.getElementById('nextButton');
    const prevButton = document.getElementById('previousButton');
    
    return props.title ? (<div>
        <Card>
            <Grid container alignItems="center">
                <Grid item align="center" xs={4}>
                    <img src={props.image_url} height="100%" width="100%" />
                </Grid>
                <Grid item align="center" xs={8}>
                    <Typography component="h5" variant="h5">{props.title}</Typography>
                    <Typography color="textSecondary" variant="subtitle1">{props.artist}</Typography>
                    {renderIcons()}
                </Grid>
            </Grid>
            <Scrubber min={0} max={props.duration} value={progress} color="primary" onScrubEnd={value => seek(Math.round(value))} disabled={!props.isHost}/>
        </Card>
        <Grid container spacing={1}>
            <Grid item xs={2} align="right">
                <VolumeDown />
            </Grid>
            <Grid item xs={8} align="center">
                <Slider defaultValue={volume} onChange={(_e, value) => changeVolume(Math.round(value))} aria-labelledby="continuous-slider" disabled={!props.isHost} />
            </Grid>    
            <Grid item xs={2} align="left">    
                <VolumeUp />
            </Grid>
            <Grid item xs={12} align="center">
                <FormControl component='fieldset' disabled={!props.isHost}>
                    <FormHelperText>
                        <div align='center'>Repeat Mode</div>
                    </FormHelperText>
                    <RadioGroup row value={repeatState} onChange={e => setRepeat(e)} >
                        <FormControlLabel value="off" control={<Radio color="neutral" />} label="Off" labelPlacement="bottom" />
                        <FormControlLabel value="context" control={<Radio color="primary" />} label={<RepeatIcon />} labelPlacement="bottom" />  
                        <FormControlLabel value="track" control={<Radio color="primary" />} label={<RepeatOneIcon />} labelPlacement="bottom" />    
                    </RadioGroup> 
                </FormControl>
            </Grid>
        </Grid>
        <KeyboardEventHandler handleKeys={['space']} onKeyEvent={(_key, _e) => playPauseButton.click()} />
        <KeyboardEventHandler handleKeys={['ctrl+right']} onKeyEvent={(_key, _e) => nextButton.click()} />
        <KeyboardEventHandler handleKeys={['ctrl+left']} onKeyEvent={(_key, _e) => prevButton.click()} />
        <KeyboardEventHandler handleKeys={['right']} onKeyEvent={(_key, _e) => seek(progress + 4000)} />
        <KeyboardEventHandler handleKeys={['left']} onKeyEvent={(_key, _e) => seek(progress > 6500 ? progress - 6500 : 0)} />
    </div>) : <Typography variant="h6" component="h6" align="center">Play a Song and Refresh the Page! If it doesn't work, try creating a new room.</Typography>;
};

export default MusicPlayer;