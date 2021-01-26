import React, { useState } from 'react';
import { TextField, Button, Grid, Typography } from '@material-ui/core';
import { Link } from 'react-router-dom';

const RoomJoinPage = props => {
    const [roomCode, setRoomCode] = useState("");
    const [error, setError] = useState("");

    const roomButtonPressed = async () => {
        const requestOptions = {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({code: roomCode})
        };
        try {
            const response = await fetch('/api/join-room', requestOptions);
            if (response.ok) props.history.push(`/room/${roomCode}`);
            else setError('Room not Found');
        } catch (e) {
            console.log(e)
        };
    };

    return (<Grid container spacing={1}>
        <Grid item xs={12} align="center">
            <Typography variant="h4" component="h4">Join a Room</Typography>
        </Grid>
        <Grid item xs={12} align="center">
            <TextField error={error} label="Code" placeholder="Enter a Room Code" helperText={error} variant="outlined" onChange={e => setRoomCode(e.target.value)} value={roomCode} />
        </Grid>
        <Grid item xs={12} align="center">
            <Button variant="contained" color="primary" onClick={roomButtonPressed}>Join</Button>
        </Grid>
        <Grid item xs={12} align="center">
            <Button variant="contained" color="secondary" to="/" component={Link}>Back</Button>
        </Grid>
    </Grid>);
}

export default RoomJoinPage;