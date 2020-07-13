require('dotenv').config();

const Discord = require("discord.js");
const client = new Discord.Client();

const tstList = {
  values: [],
  options: {
    maxPlayers: 8,
    name: 'TST'
  }
};

const fortList6 = {
  values: [],
  options: {
    maxPlayers: 12,
    name: 'Fort6v6'
  }
};

const fortList5 = {
  values: [],
  options: {
    maxPlayers: 10,
    name: 'Fort5v5'
  }
}

const wstList = {
  values: [],
  options: {
    maxPlayers: 6,
    name: 'WST'
  }
};

const aggList = [wstList, tstList, fortList5, fortList6];

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {

  // skip message if it meets the following conditions

  if (msg.channel.name !== 'pickup') {
    //console.log(`SKIP: Wrong channel`);
    return;
  }

  if (msg.author.id === client.user.id) {
    //console.log(`SKIP: Wrote this one myself`);
    return;
  }

  // !add functionality

  if (msg.content.toLowerCase() === '!add tst') {
    addPlayer(tstList, msg);
    return;
  }
  if (msg.content.toLowerCase() === '!add fort5') {
    addPlayer(fortList5, msg);
    return;
  }
  if (msg.content.toLowerCase() === '!add fort6') {
    addPlayer(fortList6, msg);
    return;
  }
  if (msg.content.toLowerCase() === '!add wst') {
    addPlayer(wstList, msg);
    return;
  }
  if (msg.content.toLowerCase() === '!add fort') {
    if (addPlayer(fortList5, msg)) {
      addPlayer(fortList6, msg);
    }
    return;
  }
  if (msg.content.toLowerCase() === '!add sumo') {
    if (addPlayer(wstList, msg)) {
      addPlayer(tstList, msg);
    }
    return;
  }
  if (msg.content.toLowerCase() === '!add nowst') {
    if (addPlayer(tstList, msg)) {
      if (addPlayer(fortList5, msg)) {
        addPlayer(fortList6, msg);
      }
    }
    return;
  }
  if (msg.content.toLowerCase() === '!add') {
    if (addPlayer(wstList, msg)) {
      if (addPlayer(tstList, msg)) {
        if (addPlayer(fortList5, msg)) { 
          addPlayer(fortList6, msg);
        }
      }
    }
    return;
  }

  // Utility functionality
  
  if (msg.content.toLowerCase() === '!who') {
    whoAllAdded(msg);
    return;
  }

  if (msg.content.toLowerCase() === '!help') {
    printHelpMessage(msg);
    return;
  }

  // !remove functionality

  if (msg.content.toLowerCase() === '!remove tst') {
    removePlayer(tstList, msg);
    return;
  }
  if (msg.content.toLowerCase() === '!remove fort') {
    removePlayer(fortList6, msg);
    return;
  }
  if (msg.content.toLowerCase() === '!remove wst') {
    removePlayer(wstList, msg);
    return;
  }
  if (msg.content.toLowerCase() === '!remove') {
    let onTSTList = false;
    let onfortList6 = false;
    let onWSTList = false;
    if (removePlayerId(wstList, msg.author.id)) {
      printList(wstList, msg.channel);
      onWSTList = true;
    }
    if (removePlayerId(tstList, msg.author.id)) {
      printList(tstList, msg.channel);
      onTSTList = true;
    }
    if (removePlayerId(fortList5, msg.author.id)) {
      printList(fortList5, msg.channel);
      onfortList6 = true;
    }
    if (removePlayerId(fortList6, msg.author.id)) {
      printList(fortList6, msg.channel);
      onWSTList = true;
    }
    if (!onTSTList && !onfortList6 && !onWSTList) {
      msg.reply(`You are not on any list`);
    }
    return;
  }

  // Development / Testing functionality

  if (msg.channel.guild.name === process.env.TESTING_CHANNEL) {
    if (msg.content.toLowerCase() === '!start tst') {
      startList(tstList, msg);
      clearOtherLists(tst, msg);
    }
    if (msg.content.toLowerCase() === '!start fort') {
      startList(fortList6, msg);
      clearOtherLists(fort6, msg);
    }
    if (msg.content.toLowerCase() === '!start wst') {
      startList(wstList, msg);
      clearOtherLists(wst, msg);
    }
    return;
  }
});

// Development / Testing helper functions

function startList(list, msg) {
  const newPlayer = { id: msg.author.id, name: "" };
  for (i=0; i<list.options.maxPlayers; i++) {
    newPlayer.name = "User" + i.toString();
    list.values.push(newPlayer);
  }
  msg.channel.send(
    `${list.options.name} ready to start!\n${getRandom(list)}`
  );

  list.values = [];
}

// Add helper functions

function addPlayer(list, msg) {
  /**
   * returns false when list reached maximum nr of players
   */
  if (list.values.length >= list.options.maxPlayers) {
    msg.reply(`Can't add you to ${list.options.name} because it's full`);
    return true;
  }
  const newPlayer = { id: msg.author.id, name: "" };
  if (msg.member.nickname) {
    newPlayer.name = msg.member.nickname;
  } else {
    newPlayer.name = msg.author.username;
  }
  if (list.values.some(player => player.id === newPlayer.id)) {
    msg.reply(`You are already on the ${list.options.name} list`);
    return true;
  }
  list.values.push(newPlayer);

  if (list.values.length === list.options.maxPlayers) {
    msg.channel.send(
      `${list.options.name} ready to start!\n${getRandom(list)}`
    );
    
    clearOtherLists(list, msg);
    list.values = [];
    return false;
  }
  const newList = list.values.map(player => `<@${player.id}>`);
  msg.channel.send(`${list.options.name} list updated (${list.values.length}/${list.options.maxPlayers}): ${newList}`);
  return true;
}

// Utility helper functions

function printHelpMessage(msg) {
  msg.reply('available pickup commands are:\n' +
            `**!add**: Add to all available game modes\n` +
            `**!add <gamemode>**: Add to a specific game mode (fort, tst, or wst)\n` +
            `**!add nowst**: Add to fort and tst game modes only\n` +
            `**!add sumo**: Add to sumo game modes only\n\n` +
            `**!remove**: Remove from all added game modes\n` +
            `**!remove <gamemode>**: Remove from a specific game mode (fort, tst, or wst)\n\n` +
            `**!who**: Display who is added to each game mode\n`
  );
}

function printList(list, channel) {
  if (list.values.length === 0) {
    channel.send(`${list.options.name} list is empty!`);
  } else {
    const newList = list.values.map(player => `<@${player.id}>`);
    channel.send(`${list.options.name} list updated (${list.values.length}/${list.options.maxPlayers}: ${newList}`);
  }
}

function whoAllAdded(msg) {
  if (isAnyoneAdded) {
    aggList.forEach(list => whoAddedList(list, msg));
  } else {
    msg.channel.send('Nobody is added yet');
  }
  return;
}

function whoAddedList(list, msg) {
  if (list.values.length > 0)
    msg.channel.send(
      `${list.options.name} players added (${list.values.length}/${list.options.maxPlayers}): ${list.values.map(player => player.name)}`
    );
  return;
}

function isAnyoneAdded() {
  console.log("I made it here!");
  console.log(aggList.length);

  aggList.forEach(function (list) {
    console.log(list.options.name);
    console.log(list.length);
    if (list.values.length != 0) {
      return true;
    }
  });
  return false;
}

// Remove helper functions

function clearOtherLists(list, msg) {
  if (list.options.name === 'TST') {
    clearDuplicates(list, wstList, msg);
    clearDuplicates(list, fortList6, msg);
    clearDuplicates(list, fortList5, msg);
  }
  if (list.options.name === 'Fort6v6') {
    clearDuplicates(list, wstList, msg);
    clearDuplicates(list, tstList, msg);
    clearDuplicates(list, fortList5, msg);
  }
  if (list.options.name === 'WST') {
    clearDuplicates(list, fortList6, msg);
    clearDuplicates(list, fortList5, msg);
    clearDuplicates(list, tstList, msg);
  }
  if (list.options.name === 'Fort5v5') {
    clearDuplicates(list, fortList6, msg);
    clearDuplicates(list, wstList, msg);
    clearDuplicates(list, tstList, msg);
  }
  return;
}

function clearDuplicates(startedList, targetList, msg) {
  startedList.values.forEach(player => removePlayerId(targetList, player.id));
  printList(targetList, msg.channel);
  return;
}

function removePlayerId(list, id) {
  for (let index in list.values) {
    if (list.values[index].id === id) {
      list.values.splice(index, 1);
      return true;
    }
  }
  return false;
}

function removePlayer(list, msg) {
  if (removePlayerId(list, msg.author.id)) {
    printList(list, msg.channel);
    return;
  }
  msg.reply(`You are not on the ${list.options.name} list`);
}

// Randomize ready to start game modes

function getRandom(list) {
  if (list.options.name === 'TST') {
    shuffle(list.values);
    return (
      `Team 1: <@${list.values[0].id}>, <@${list.values[1].id}>\n` +
      `Team 2: <@${list.values[2].id}>, <@${list.values[3].id}>\n` +
      `Team 3: <@${list.values[4].id}>, <@${list.values[5].id}>\n` +
      `Team 4: <@${list.values[6].id}>, <@${list.values[7].id}>\n`
    );
  }
  if (list.options.name === 'Fort5v5' || 'Fort6v6' || 'WST') {
    shuffle(list.values);
    return getDraft(list);
  }
  return '';
}

function getDraft(list) {
  const nonCaptains = list.values
    .slice(2, list.values.length)
    .map(player => `<@${player.id}>`);
  return (
    `Team 1 captain: <@${list.values[0].id}>\n` +
    `Team 2 captatin: <@${list.values[1].id}>\n` 
    `Everyone else: ${nonCaptains}`
  );
}

function shuffle(list) {
  for (let i = 0; i < list.length; i++) {
    let j = Math.floor(Math.random() * list.length);
    [list[i], list[j]] = [list[j], list[i]];
  }
}

client.login(process.env.DISCORD_TOKEN);
