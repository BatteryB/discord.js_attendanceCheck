import { REST, Routes, SlashCommandBuilder } from 'discord.js';
const TOKEN = 'TOKEN';
const CLIENT_ID = 'CLIENT_ID';

const commands = [
    {
        name: '출석',
        description: '매일 출석하고 도박 머니 10000원을 지급받습니다.'
    },
];

const rest = new REST({ version: '10' }).setToken(TOKEN);

try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });

    console.log('Successfully reloaded application (/) commands.');
} catch (error) {
    console.error(error);
}
