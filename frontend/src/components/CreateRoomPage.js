import React, { useState } from 'react';
import { Button, Grid, Typography, TextField, FormHelperText, FormControl, Radio, RadioGroup, FormControlLabel } from '@material-ui/core';
import { Link } from 'react-router-dom';

const CreateRoomPage = props => {
    const defaultProps = {
        votesToSkip: 2,
        guestCanPause: true,
        update: false,
        roomCode: null,
        updateCallback: () => {}
    };

    const [guestCanPause, setGuestCanPause] = useState(props.guestCanPause != undefined ? props.guestCanPause : defaultProps.guestCanPause);
    const [votesToSkip, setVotesToSkip] = useState(props.votesToSkip ? props.votesToSkip : defaultProps.votesToSkip);

    const handleVotesChange = e => setVotesToSkip(e.target.value);

    const handleGuestCanPauseChange = e => setGuestCanPause(e.target.value === 'true');

    const handleRoomButtonPressed = () => {
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                votes_to_skip: votesToSkip,
                guest_can_pause: guestCanPause,
            }),
        };

        fetch("/api/create-room", requestOptions)
        .then(response => response.json())
        .then(data => props.history.push('/room/' + data.code));
    }

    const handleUpdateButtonPressed = () => {
        const requestOptions = {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            votes_to_skip: votesToSkip,
            guest_can_pause: guestCanPause,
            code: props.roomCode,
          }),
        };
        fetch("/api/update-room", requestOptions).then(_response => props.updateCallback());
        props.history.push('../');
      }

    const createBackButton = () => {
        return (!props.update ? 
        (<Grid item xs={12} align="center">
            <Button color="secondary" variant="contained" to="/" component={Link}>Back</Button>
        </Grid>)
        : null)
    }

    
    const title = props.update ? 'Update Room' : 'Create a Room';
    const buttonLabel = props.update ? 'Update Settings' : 'Create a Room';
    
    return (<Grid container spacing={1}>
        <Grid item xs={12} align="center">
            <Typography component='h4' variant='h4'>{title}</Typography>
        </Grid>
        <Grid item xs={12} align="center">
            <FormControl component='fieldset'>
                <FormHelperText>
                    <div align='center'>Guests Control of Playback State</div>
                </FormHelperText>
                <RadioGroup row defaultValue={guestCanPause.toString()} onChange={handleGuestCanPauseChange}>
                    <FormControlLabel value="true" control={<Radio color="primary" />} label="Play/Pause" labelPlacement="bottom" />
                    <FormControlLabel value="false" control={<Radio color="secondary" />} label="No Control" labelPlacement="bottom" />    
                </RadioGroup> 
            </FormControl>
        </Grid>
        <Grid item xs={12} align="center">
            <FormControl>
                <TextField required={true} type="number" defaultValue={votesToSkip} inputProps={{min: 1, style: {textAlign: "center"}}} onChange={handleVotesChange}/>
                <FormHelperText>
                    <div align="center">Votes Required to Skip a Song</div>
                </FormHelperText>
            </FormControl>
        </Grid>
        <Grid item xs={12} align="center">
            <Button color="primary" variant="contained" onClick={!props.update ? handleRoomButtonPressed : handleUpdateButtonPressed}>{buttonLabel}</Button>
        </Grid>
        {createBackButton()}
    </Grid>);
}

export default CreateRoomPage;