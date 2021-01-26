import React, { useState } from "react";
import {
  Button,
  Grid,
  Typography,
  TextField,
  FormHelperText,
  FormControl,
  Radio,
  RadioGroup,
  FormControlLabel,
  Checkbox,
} from "@material-ui/core";

const BetterCreateRoomPage = (props) => {
  const [guestsCanPause, setGuestsCanPause] = useState(true);
  const [guestsCanSkip, setGuestsCanSkip] = useState(true);

  return (
    <Grid container spacing={2} alignItems="center">
      <Grid item xs={12} align="center">
        <Typography variant="h2" component="h2">
          Create a Room
        </Typography>
      </Grid>
      <Grid item xs={12} align="left">
        <Typography variant="h6" component="h6">
          Guests' Control over your Playback:
        </Typography>
      </Grid>
      <Grid item xs={12} align="left">
        <FormControlLabel
          control={
            <Checkbox
              checked={guestsCanPause}
              onChange={(e) => setGuestsCanPause(e.target.checked)}
              color="primary"
            />
          }
          label="Playing/Pausing"
          labelPlacement="right"
        />
      </Grid>
      <Grid item xs={12} align="left">
        <FormControlLabel
          control={
            <Checkbox
              checked={guestsCanSkip}
              onChange={(e) => setGuestsCanSkip(e.target.checked)}
              color="primary"
            />
          }
          label="Skipping"
          labelPlacement="right"
        />
      </Grid>
    </Grid>
  );
};

export default BetterCreateRoomPage;
