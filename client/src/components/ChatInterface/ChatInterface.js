import {
  Box,
  TextField,
  Grid,
  IconButton,
  Typography,
  List,
  ListItemText,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ListItem,
} from '@material-ui/core';

import React, { useEffect } from 'react';
import { useState, useContext, Fragment } from 'react';
import { Context } from '../../context/ContextProvider';
import { makeStyles } from '@material-ui/core/styles';
import { SendIcon } from '../Icons';

const ChatInterface = ({}) => {
  // Grab the elements from ContextProvider.js
  const {
    chatMessagesAll,
    chatMessagesTeam,
    chat_sendToAll,
    chat_sendToTeam,
    hideAllChat,
    hideTeamChat,
    isHost,
  } = useContext(Context);
  const [selectedChatType, setSelectedChatType] = useState('allPlayer');

  // Variable for text box
  const [textTeam, setTextTeam] = useState('');
  const [textAll, setTextAll] = useState('');

  // Variable for scrolling to bottom
  const messagesEndRefAll = React.createRef();
  const messagesEndRefTeam = React.createRef();

  // When the user clicks enter in all chat, send the message
  // Click the allChatButton
  const handleKeyUpAll = e => {
    if (e.keyCode === 13) {
      e.preventDefault();
      document.getElementById('allChatButton').click();
    }
  };

  // When the user clicks enter in team chat, send the message
  // Click the teamChatButton
  const handleKeyUpTeam = e => {
    if (e.keyCode === 13) {
      e.preventDefault();
      document.getElementById('teamChatButton').click();
    }
  };

  // Send to all chat function
  const sendToAll = () => {
    chat_sendToAll(textAll);
    setTextAll('');
  };

  const sendToTeam = () => {
    chat_sendToTeam(textTeam);
    setTextTeam('');
  };

  // Scrolling for All Chat
  const scrollToBottomAll = () => {
    messagesEndRefAll.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
      inline: 'nearest',
    });
  };

  useEffect(() => {
    scrollToBottomAll();
  }, [chatMessagesAll]);

  // Scrolling for Team Chat
  const scrollToBottomTeam = () => {
    messagesEndRefTeam.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
      inline: 'nearest',
    });
  };

  useEffect(() => {
    scrollToBottomTeam();
  }, [chatMessagesTeam]);

  // Handle the text field changes
  const handleChangeAll = e => {
    // set the value of value
    setTextAll(e.target.value); // Edit here
  };

  const handleChangeTeam = e => {
    // set the value of value
    setTextTeam(e.target.value); // edit here
  };

  const useStyles = makeStyles(theme => ({
    textFieldStyling: {
      marginBottom: '15px',
      marginLeft: '15px',
    },
    typographyStyling: {
      fontWeight: 600,
      fontSize: '19px',
      margin: '15px',
    },
    buttonStyling: {
      marginTop: '25px',
      border: '1px solid #D3D3D3 ',
      position: 'absolute',
      right: '15px',
      bottom: '10px',
    },
    headerStyling: {
      backgroundColor: '#FAF9F6',
      borderTop: 1,
      borderRight: 1,
      borderLeft: 1,
      border: '1px solid #D3D3D3',
    },
    chatMessageUserNameStyling: {
      fontWeight: 600,
      color: '#71797E',
    },
  }));

  const classes = useStyles();

  // Return the actual chat box

  return (
    // Container for the chat box

    <Box align="center" position="absolute" top="0px" left="1%">
      {!hideAllChat && (
        <Grid
          container
          style={{
            boxShadow: '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)',
            borderRadius: '5px',
            position: 'relative',
            width: '400px',
          }}
        >
          <Grid item xs={12} align="center" className={classes.headerStyling}>
            {!isHost && !hideTeamChat ? (
              <Box display="flex" marginX="30px">
                <FormControl>
                  <InputLabel id="selectChatType">*</InputLabel>
                  <Select
                    fontFamily="arial"
                    labelId="selectChatType"
                    id="selectChatType"
                    onChange={event => setSelectedChatType(event.target.value)}
                  >
                    <MenuItem value={'allPlayer'}> All players</MenuItem>
                    <MenuItem value={'team'}>Team</MenuItem>
                  </Select>
                </FormControl>
                <Typography className={classes.typographyStyling}>
                  Chat with {selectedChatType === 'allPlayer' ? ' All Players' : 'Team'}
                </Typography>
              </Box>
            ) : (
              <Typography className={classes.typographyStyling}>Chat Box All</Typography>
            )}
          </Grid>
          {selectedChatType === 'allPlayer' ? (
            <Fragment>
              <Grid item xs={12}>
                <List
                  id="ChatBoxMessagesAll"
                  style={{
                    maxHeight: '200px',
                    width: '100%',
                    overflow: 'scroll',
                    alignItems: 'start',
                    minHeight: '25vh',
                  }}
                >
                  {chatMessagesAll &&
                    { chatMessagesAll }.chatMessagesAll.map(chatMessage => {
                      return (
                        <ul>
                          <ListItem
                            style={{
                              width: '100%',
                            }}
                          >
                            <ListItemText
                              primary={
                                <Typography className={classes.chatMessageUserNameStyling}>
                                  {chatMessage.alias}:
                                </Typography>
                              }
                              secondary={<Typography>{chatMessage.message}</Typography>}
                            />
                          </ListItem>
                        </ul>
                      );
                    })}
                  <div ref={messagesEndRefAll} />
                </List>
              </Grid>
              <Box display="flex" id="allChatBox">
                <TextField
                  value={textAll}
                  onKeyUp={handleKeyUpAll}
                  onChange={handleChangeAll}
                  variant="standard"
                  label="Send message all"
                  className={classes.textFieldStyling}
                />

                <IconButton
                  id="allChatButton"
                  onClick={sendToAll}
                  size="small"
                  className={classes.buttonStyling}
                >
                  <SendIcon />
                </IconButton>
              </Box>
            </Fragment>
          ) : (
            <Fragment>
              <Grid item xs={12}>
                <List
                  id="ChatBoxMessagesTeam"
                  style={{
                    maxHeight: '200px',
                    width: '100%',
                    overflow: 'scroll',
                    alignItems: 'start',
                    minHeight: '25vh',
                  }}
                >
                  {chatMessagesTeam &&
                    { chatMessagesTeam }.chatMessagesTeam.map(chatMessage => {
                      return (
                        <ul>
                          <ListItem
                            style={{
                              display: 'flex ',
                              marginLeft: '15px',
                            }}
                          >
                            <ListItemText
                              primary={
                                <Typography className={classes.chatMessageUserNameStyling}>
                                  {chatMessage.alias}:
                                </Typography>
                              }
                              secondary={<Typography>{chatMessage.message}</Typography>}
                            />
                          </ListItem>
                        </ul>
                      );
                    })}
                  <div ref={messagesEndRefTeam} />
                </List>
              </Grid>
              <Box display="flex">
                <TextField
                  value={textTeam}
                  onKeyUp={handleKeyUpTeam}
                  onChange={handleChangeTeam}
                  variant="standard"
                  label="Send message team"
                  className={classes.textFieldStyling}
                />

                <IconButton
                  id="teamChatButton"
                  onClick={sendToTeam}
                  size="small"
                  className={classes.buttonStyling}
                >
                  <SendIcon />
                </IconButton>
              </Box>
            </Fragment>
          )}
        </Grid>
      )}
    </Box>
  );
};

export default ChatInterface;
