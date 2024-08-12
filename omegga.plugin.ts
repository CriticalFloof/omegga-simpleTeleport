import OmeggaPlugin, { OL, PS, PC } from 'omegga';

// These are types which dictate how your config and stores are structured.
// It's recommended to set these to reflect what and where you store data as it can allow your intellisense to notify you when you're attempting to misuse data.
// Though you can set these 'any' if you're unsure of how you want to structure your data at the start.
type Config = { foo: string };
type Storage = { bar: string };

export default class Plugin implements OmeggaPlugin<Config, Storage> {
  omegga: OL;
  config: PC<Config>;
  store: PS<Storage>;

  constructor(omegga: OL, config: PC<Config>, store: PS<Storage>) {
    // omegga is the main way to interact with the Omegga wrapper and Brickadia server.
    // You also have access to the 'Omegga' global variable for ease of access from any TS file.
    this.omegga = omegga;
    // config is a reference where data set by the Web UI is stored, you can define configs for plugin managers to tweak in the doc.json file (refer to Omegga documentation for usage)
    // For this plugin, we dont use this.
    this.config = config;
    // store is a reference to a plugin's database, this is where you'll be storing variables that you want to save and read across plugin sessions.
    // I HIGHLY encourage that you do not write to this frequently, using the store database writes data to a file on your harddrive,
    // which is how data is saved across plugin sessions, however this means it is VERY slow and you should stick to variables stored in RAM directly whenever possible.
    // If you desire to write to the store database frequently however, A better option is to use variables and save them to the store with the help of an 'autosave' timer instead.
    // For this plugin, we dont use this.
    this.store = store;
  }

  async init() {
    Omegga
    .on('cmd:helpsimpleteleport', (name) => {
      // This event demonstrates how to implement a command which tells the user a message, in this case, it is used to inform the user about plugin usage.
      
      // Note: Omegga's whisper, middletext, and broadcast commands supports brickadia's version of richtext.
      Omegga.whisper(name,`<b><color="88ff99"><size="26">Simple Teleport</></></>
      A plugin that allows users to set up teleportation via interact component using Print To Console.
      To use the plugin, type "<color="88ff88"></>teleport:<color="88ff88">[X]</>,<color="88ff88">[Y]</>,<color="88ff88">[Z]</> in the Print To Console textbox
      To use relative teleportation on any given axis, add an ~ before the number`)
    })
    .on('cmd:getposition', async name => {
      // This event demonstrates how you could get the player's position in responce to a player sending a command.
      // A good reason to do this is because currently, brickadia's vanilla command '/gettransform' is inaccessible to non-admin players.
      // Helper commands like these can improve a user's experience with using your plugin.
      
      const playerPosition =  await Omegga.getPlayer(name).getPosition()
      const playerX = playerPosition[0].toFixed(0)
      const playerY = playerPosition[1].toFixed(0)
      const playerZ = playerPosition[2].toFixed(0)
      
      Omegga.whisper(name,`<size="16">Your current position is:</>
       <size="26">${playerX}, ${playerY}, ${playerZ}</>`)
    })
    .on('interact', ({ player, position, message }) => {
      // This event demonstrates how you can hook into the player interacting with a brick and handle that information to get any work done.
      // In this case, we're using a regex expression to gather information from a brick's 'Print To Console' field, which in this function, is the 'message' parameter.
      const match = message.match(
        /^teleport:(?<relx>~)?(?<x>-?\d+)?\s*,(?<rely>~)?(?<y>-?\d+)?\s*,(?<relz>~)?(?<z>-?\d+)?\s*$/i // Thanks to cake for the help with the regex!
      );
      // We then take the information from the message using the regex pattern and transform the strings we matched into more usuable information, like a positional vector in this case.
      // As a bonus of this regex pattern, we also look for a "~" in the message whenever the user wishes to indicate that they want to be teleported relative to their current location on that axis.
      if (match) {
        const x =
          Number(match.groups.x ?? '0') + (match.groups.relx ? position[0] : 0);
        const y =
          Number(match.groups.y ?? '0') + (match.groups.rely ? position[1] : 0);
        const z =
          Number(match.groups.z ?? '0') + (match.groups.relz ? position[2] : 0);

        // There's moments when omegga doesn't provide a method to call when you want to perform a command to the server, 
        // thankfully omegga does allow us to write console commands directly to brickadia's console if nessesary.
        
        Omegga.writeln(`Chat.Command /TP "${player.name}" ${x} ${y} ${z} 0`);
      }
    });
    
    // Finally, we have to let omegga know what commands we've created so that it knows when to not send the "command not found" message.
    return { registeredCommands: ['getposition','helpsimpleteleport'] };
  }

  async stop() {
    // This plugin doesn't make use of any state which needs shutting down.
    // However, as an example, if you were wanting to make a minigame which saves upon shutting down, you can call your save functions here.
    // Make sure your shutting down logic is fast to reduce the chance of an incomplete save. 
    // From experience, Omegga does NOT wait for your stop function to return before shutting down when using safe plugins.
  }
}
