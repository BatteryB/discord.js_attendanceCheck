import { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import sqlite3 from 'sqlite3';

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const TOKEN = 'TOKEN';

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

const db = new sqlite3.Database('DB/toto.db');

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === '출석') {
        try {
            let currentDate = new Date();
            let year = currentDate.getFullYear(), month = currentDate.getMonth() + 1, day = currentDate.getDate(), id = interaction.user.id;
            let attendNum;
            let join = await joinCheck(interaction.user.id);
            
    
            if (join) {
                await new Promise((resolve, reject) => {
                    db.run('DELETE FROM attendance WHERE id = ? AND ((year = ? AND month = ? AND day < ?) OR (year = ? AND month < ?) OR (year < ?))', [id, year, month, day, year, month, year], (err) => {
                        if (err) reject(err);
                        else resolve();
                    });
                });  
                
                let attendance = await attendanceCheck(interaction.user.id);
    
                if (!attendance) {
                    await new Promise((resolve, reject) => {
                        db.run('insert into attendance (year, month, day, id) values (?, ?, ?, ?)', [year, month, day, id], (err) => {
                            if (err) reject(err);
                            else resolve();
                        });
                    });
    
                    await new Promise((resolve, reject) => {
                        db.run('update user set attend = attend + 1, money = money + 10000 where id = ?', [id], (err) => {
                            if (err) reject(err);
                            else resolve();
                        });
                    });
    
                    attendNum = await attendanceUser(id);
    
                    await interaction.reply(attendNum.nickName + '님이 출석했습니다. 출석보너스 돈 +10000원\n누적 출석 횟수 : ' + attendNum.attend);
                } else {
                    await interaction.reply({ content: '이미 출석 하셨습니다.', ephemeral: true });
                }
            } else {
                await interaction.reply({ content: '먼저 가입을 해주세요.', ephemeral: true });
            }
        } catch (error) {
            console.error('Error occurred:', error);
            await interaction.reply({ content: '오류가 발생했습니다. 나중에 다시 시도해주세요.', ephemeral: true });
        }
    }

});

function attendanceUser(id) {
    return new Promise((resolve, reject) => {
        db.get(`SELECT user.nickName, user.attend FROM attendance INNER JOIN user ON attendance.id = user.id WHERE attendance.id = ?`, [id], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
}

function joinCheck(id) {
    return new Promise((resolve, reject) => {
        db.get('select * from user where id = ?', [id], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(!!row);
            }
        });
    });
}

function attendanceCheck(id) {
    return new Promise((resolve, reject) => {
        db.get('select * from attendance where id = ?', [id], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(!!row);
            }
        });
    });
}

client.login(TOKEN);