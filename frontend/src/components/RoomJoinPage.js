import React, { useState } from 'react';
import { TextField, Button, Grid, Typography } from '@material-ui/core';
import { Link } from 'react-router-dom';

const RoomJoinPage = props => {
    const [roomCode, setRoomCode] = useState("");
    const [error, setError] = useState("")

    const handleRoomCodeChange = e => setRoomCode(e.target.value);

    const roomButtonPressed = () => {
        const requestOptions = {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({code: roomCode})
        };
        fetch('/api/join-room', requestOptions)
        .then((response) => response.ok ? props.history.push(`/room/${roomCode}`) : setError('Room not Found'))
        .catch(error => console.log(error));
    }

    return (<Grid container spacing={1}>
        <Grid item xs={12} align="center">
            <Typography variant="h4" component="h4">
                Join a Room
            </Typography>
        </Grid>
        <Grid item xs={12} align="center">
            <TextField 
                error={error}
                label="Code"
                placeholder="Enter a Room Code"
                defaultValue= ""
                helperText={error}
                variant="outlined"
                onChange={handleRoomCodeChange}
                value={roomCode}
            />
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