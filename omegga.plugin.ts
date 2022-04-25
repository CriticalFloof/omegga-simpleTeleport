import OmeggaPlugin, { OL, PS, PC } from 'omegga';

type Config = { foo: string };
type Storage = { bar: string };

export default class Plugin implements OmeggaPlugin<Config, Storage> {
  omegga: OL;
  config: PC<Config>;
  store: PS<Storage>;

  constructor(omegga: OL, config: PC<Config>, store: PS<Storage>) {
    this.omegga = omegga;
    this.config = config;
    this.store = store;
  }

  async init() {
    // Write your plugin!
    Omegga
    .on('cmd:helpsimpleteleport', (name) => {
      Omegga.whisper(name,`<b><color="88ff99"><size="26">Simple Teleport</></></>
      A plugin that allows users to set up teleportation via interact component using Print To Console.
      To use the plugin, type "<color="88ff88"></>teleport:<color="88ff88">[X]</>,<color="88ff88">[Y]</>,<color="88ff88">[Z]</> in the Print To Console textbox
      To use relative teleportation on any given axis, add an ~ before the number`)
    })


    .on('cmd:getposition', async name => {
      const playerPosition =  await Omegga.getPlayer(name).getPosition()
      const playerX = playerPosition[0].toFixed(0)
      const playerY = playerPosition[1].toFixed(0)
      const playerZ = playerPosition[2].toFixed(0)
      Omegga.whisper(name,`<size="16">Your current position is:</>
       <size="26">${playerX}, ${playerY}, ${playerZ}</>`)
    })
    .on('interact', ({ player, position, message }) => {
      // Thanks to cake for the help!
      // regex for matching teleport:~0,1,~2 for relative teleporting
      const match = message.match(
        /^teleport:(?<relx>~)?(?<x>-?\d+)?\s*,(?<rely>~)?(?<y>-?\d+)?\s*,(?<relz>~)?(?<z>-?\d+)?\s*$/i
      );
      if (match) {
        const x =
          Number(match.groups.x ?? '0') + (match.groups.relx ? position[0] : 0);
        const y =
          Number(match.groups.y ?? '0') + (match.groups.rely ? position[1] : 0);
        const z =
          Number(match.groups.z ?? '0') + (match.groups.relz ? position[2] : 0);
        Omegga.writeln(`Chat.Command /TP "${player.name}" ${x} ${y} ${z} 0`);
      }
    });
    

    return { registeredCommands: ['getposition','helpsimpleteleport'] };
  }

  async stop() {
    Omegga
    .removeAllListeners('cmd:getposition')
    .removeAllListeners('cmd:helpsimpleteleport')
    .removeAllListeners('interact')
    .removeAllListeners('event:tp');
    // Anything that needs to be cleaned up...
  }
}
