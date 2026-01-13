import { Events } from 'discord.js';
import { deployCommands } from '../deploy.js';

export default {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    console.log(`🤖 Bot do Discord logado como ${client.user.tag}`);
    
    // Define status
    client.user.setActivity('Monitorando Eletrostart ⚡');

    // Deploy de comandos em todos os servidores detectados (para funcionar instantaneamente)
    console.log(`📡 Detectado em ${client.guilds.cache.size} servidores.`);
    
    const guilds = client.guilds.cache.map(guild => guild.id);
    for (const guildId of guilds) {
        console.log(`🔄 Registrando comandos no servidor: ${guildId}`);
        await deployCommands(guildId);
    }

    if (guilds.length === 0) {
        console.log('⚠️ O bot não está em nenhum servidor ainda. Use o link de convite para adicioná-lo.');
        // Fallback para deploy global se não houver guilds (útil para quando for adicionado depois)
        await deployCommands();
    }
  },
};
