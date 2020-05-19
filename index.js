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

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
  if (msg.channel.name !== 'pickup') {
    return;
  }

  if (msg.content === '!add tst') {
    addPlayer(tstList, msg);
    return;
  }
  if (msg.content === '!add fort') {
    addPlayer(fortList, msg);
    return;
  }
  if (msg.content === '!add') {
    if (addPlayer(tstList, msg)) {
      addPlayer(fortList, msg)
    }
    return;
  }
  if (msg.content === '!who') {
    if (tstList.values.length === 0 && fortList.values.length === 0) {
      msg.channel.send('Nobody is added yet');
      return;
    }
    if (tstList.values.length > 0)
      msg.channel.send(
        `TST players added: ${tstList.values.map(player => player.name)}`
      );
    if (fortList.values.length > 0)
      msg.channel.send(
        `Fort players added: ${fortList.values.map(player => player.name)}`
      );
    return;
  }
  if (msg.content === '!remove tst') {
    removePlayer(tstList, msg);
    return;
  }
  if (msg.content === '!remove fort') {
    removePlayer(fortList, msg);
    return;
  }
  if (msg.content === '!remove') {
    /* TODO refactor */
    let onTSTList = false;
    let onFortList = false;
    if (removePlayerId(tstList, msg.author.id)) {
      printList(tstList, msg.channel);
      onTSTList = true;
    }
    if (removePlayerId(fortList, msg.author.id)) {
      printList(fortList, msg.channel);
      onFortList = true;
    }
    if (!onTSTList && !onFortList) {
      msg.reply(`You are not on any list`);
    }
    return;
  }
});

function otherList(list) {
  if (list.options.name === 'TST')
    return fortList;
  return tstList;
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

function printList(list, channel) {
  if (list.values.length === 0) {
    channel.send(`${list.options.name} list is empty!`);
  } else {
    const newList = list.values.map(player => `<@${player.id}>`);
    channel.send(`${list.options.name} list updated: ${newList}`);
  }
}

function removePlayer(list, msg) {
  if (removePlayerId(list, msg.author.id)) {
    printList(list, msg.channel);
    return;
  }
  msg.reply(`You are not on the ${list.options.name} list`);
}

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
    /* TODO write this in a nicer way */
    const oList = otherList(list);
    list.values.forEach(player => removePlayerId(oList, player.id));
    printList(oList, msg.channel);
    list.values = [];
    return false;
  }
  const newList = list.values.map(player => `<@${player.id}>`);
  msg.channel.send(`${list.options.name} list updated: ${newList}`);
  return true;
}

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
  return '';
}

function shuffle(list) {
  for (let i = 0; i < list.length; i++) {
    let j = Math.floor(Math.random() * list.length);
    [list[i], list[j]] = [list[j], list[i]];
  }
}

client.login(process.env.DISCORD_TOKEN);
