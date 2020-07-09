const Discord = require("discord.js");
const client = new Discord.Client();

const tstList = {
  values: [],
  options: {
    maxPlayers: 8,
    name: 'TST'
  }
};

const fortList = {
  values: [],
  options: {
    maxPlayers: 12,
    name: 'Fort'
  }
};

const wstList = {
  values: [],
  options: {
    maxPlayers: 6,
    name: 'WST'
  }
};

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {

  // skip message if it meets the following conditions

  if (msg.channel.name !== 'pickup') {
    return;
  }

  if (msg.author.id === client.author.id) {
    return;
  }

  // !add functionality

  if (msg.content.toLowerCase() === '!add tst') {
    addPlayer(tstList, msg);
    return;
  }
  if (msg.content.toLowerCase() === '!add fort') {
    addPlayer(fortList, msg);
    return;
  }
  if (msg.content.toLowerCase() === '!add wst') {
    addPlayer(wstList, msg);
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
      addPlayer(fortList, msg);
    }
    return;
  }
  if (msg.content.toLowerCase() === '!add') {
    if (addPlayer(wstList, msg)) {
      if (addPlayer(tstList, msg)) {
        addPlayer(fortList, msg);
      }
    }
    return;
  }

  // Utility functionality
  
  // #TODO: pull out into separate function, passing list argument in 
  if (msg.content.toLowerCase() === '!who') {
    if (tstList.values.length === 0 && fortList.values.length === 0 && wstList.values.length === 0) {
      msg.channel.send('Nobody is added yet');
      return;
    }
    if (tstList.values.length > 0)
      msg.channel.send(
        `TST players added (${tstList.values.length}/${tstList.options.maxPlayers}): ${tstList.values.map(player => player.name)}`
      );
    if (fortList.values.length > 0)
      msg.channel.send(
        `Fort players added (${fortList.values.length}/${fortList.options.maxPlayers}): ${fortList.values.map(player => player.name)}`
      );
    if (wstList.values.length > 0)
      msg.channel.send(
        `WST players added (${wstList.values.length}/${wstList.options.maxPlayers}): ${wstList.values.map(player => player.name)}`
      );
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
    removePlayer(fortList, msg);
    return;
  }
  if (msg.content.toLowerCase() === '!remove wst') {
    removePlayer(wstList, msg);
    return;
  }
  if (msg.content.toLowerCase() === '!remove') {
    let onTSTList = false;
    let onFortList = false;
    let onWSTList = false;
    if (removePlayerId(tstList, msg.author.id)) {
      printList(tstList, msg.channel);
      onTSTList = true;
    }
    if (removePlayerId(fortList, msg.author.id)) {
      printList(fortList, msg.channel);
      onFortList = true;
    }
    if (removePlayerId(wstList, msg.author.id)) {
      printList(wstList, msg.channel);
      onWSTList = true;
    }
    if (!onTSTList && !onFortList && !onWSTList) {
      msg.reply(`You are not on any list`);
    }
    return;
  }

  // Development / Testing functionality

  if (msg.channel.name === process.env.TESTING_CHANNEL) {
    if (msg.content.toLowerCase() === '!start tst') {
      startList(tstList, msg);
    }
    if (msg.content.toLowerCase() === '!start fort') {
      startList(fortList, msg);
    }
    if (msg.content.toLowerCase() === '!start wst') {
      startList(wstList, msg);
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

// Remove helper functions

function clearOtherLists(list, msg) {
  if (list.options.name === 'TST') {
    clearDuplicates(list, wstList, msg);
    clearDuplicates(list, fortList, msg);
  }
  if (list.options.name === 'Fort') {
    clearDuplicates(list, wstList, msg);
    clearDuplicates(list, tstList, msg);
  }
  if (list.options.name === 'WST') {
    clearDuplicates(list, fortList, msg);
    clearDuplicates(list, tstList, msg);
  }
}

function clearDuplicates(startedList, targetList, msg) {
  startedList.values.forEach(player => removePlayerId(targetList, player.id));
  printList(targetList, msg.channel);
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
  if (list.options.name === 'Fort') {
    shuffle(list.values);
    const nonCaptains = list.values
      .slice(2, list.values.length)
      .map(player => `<@${player.id}>`);
    return (
      `Team 1 captain: <@${list.values[0].id}>\n` +
      `Team 2 captain: <@${list.values[1].id}>\n` +
      `Everyone else: ${nonCaptains}`
    );
  }
  if (list.options.name === 'WST') {
    shuffle(list.values);
    const nonCaptains = list.values
      .slice(2, list.values.length)
      .map(player => `<@${player.id}>`);
    return (
      `Team 1 captain: <@${list.values[0].id}>\n` +
      `Team 2 captain: <@${list.values[1].id}>\n` +
      `Everyone else: ${nonCaptains}`
    );
  }
  return '';
}

function shuffle(list) {
  for (let i = 0; i < list.length; i++) {
    let j = Math.floor(Math.random() * list.length);
    [list[i], list[j]] = [list[j], list[i]];
  }
}

client.login(process.env.DISCORD_TOKEN);
