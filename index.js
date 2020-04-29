const cheerio = require('cheerio');
const request = require('request');
const ytdl = require('ytdl-core');
const marvel = require ('marvel-random-hero');
const config = require('config-yml');

var cloudinary = require('cloudinary');
CLOUDINARY_URL = config.cloudinary.url;
cloudinary.config({ 
    cloud_name: config.cloudinary.cloud_name, 
    api_key: config.cloudinary.api_key, 
    api_secret: config.cloudinary.api_secret 
});

var servers = {};

const Discord = require('discord.js');
const client = new Discord.Client();

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', async msg => {

    const help = new Discord.MessageEmbed()
        .setColor('BLUE')
        .setTitle('Comandos:')
        .addField('\`?javi\`', 'Foto random de ShinyPotat')
        .addField('\`?emilio\`', 'Foto random de Sully')
        .addField('\`?jj\`', 'Foto random de NeNu')
        .addField('\`?bea\`', 'Foto random de rapature')
        .addField('\`?pablo\`', 'Foto random de pablo baiteado')
        .addField('\`?beabkeys\`', '🎵 Reproduce una cover al azar')
        .addField('\`?random "búsqueda"\`', 'Muestra una foto random de búsqueda')
        .addField('\`?marvel\`', 'Devuelve un personaje de marvel al azar')
        .addField('\`?audio\`', 'Audio al azar para reirte un rato')
        .addField('\`?play \"link\"\`', 'Reproduce un video de YouTube')
        .addField('\`?stop\`', 'Desconecta el bot del canal de audio');

    if(!msg.content.startsWith('?')) return;  

    if (msg.content.toLowerCase() === '?help') {   
        
        msg.channel.send(help);

    }else if(msg.content.toLowerCase().startsWith('?random')){

        if(msg.content.toLowerCase() === '?random'){
            msg.reply('necesitas poner un término de búsqueda.');
        }else{
            image(msg);
        } 

    }else if(msg.content.toLowerCase() === '?javi'){

        const url = cloudinary.v2.search
            .expression('folder:javi')
            .sort_by('public_id','desc')
            .execute().then(result => memeFotosRandom(msg,result));

    }else if(msg.content.toLowerCase() === '?emilio'){

        const url = cloudinary.v2.search
            .expression('folder:emilio')
            .sort_by('public_id','desc')
            .execute().then(result => memeFotosRandom(msg,result));

    }else if(msg.content.toLowerCase() === '?jj'){

        const url = cloudinary.v2.search
            .expression('folder:jj')
            .sort_by('public_id','desc')
            .execute().then(result => memeFotosRandom(msg,result));

    }else if(msg.content.toLowerCase() === '?bea'){

        const url = cloudinary.v2.search
            .expression('folder:bea')
            .sort_by('public_id','desc')
            .execute().then(result => memeFotosRandom(msg,result));

    }else if(msg.content.toLowerCase() === '?pablo'){

        const url = cloudinary.v2.search
            .expression('folder:pablo')
            .sort_by('public_id','desc')
            .execute().then(result => memeFotosRandom(msg,result));

    
    } else if(msg.content.toLowerCase() === '?beabkeys'){

        if(!msg.member.voice.channel){
            msg.reply('necesitas estar en un canal de voz.');
            return;
        }

        if(!servers[msg.guild.id]) servers[msg.guild.id] = {
            queue: []
        }

        var server = servers[msg.guild.id];

        request('https://www.googleapis.com/youtube/v3/search?part=id&channelId=UCSJ-0mjl0PaNKq6vuvrXOPA&key='+config.youtube.key+'&type=video',
                { json: true }, (err, res, body) => {
                
                if (err) { return console.log(err); }

                const url = "https://www.youtube.com/watch?v=" + body.items[Math.floor(Math.random() * body.pageInfo.resultsPerPage)].id.videoId;

                server.queue.push(url);

                console.log(server.queue);
                msg.channel.send('Cover ' + url + ' añadida a la cola.');

                if(client.voice.connections.size==0) msg.member.voice.channel.join().then(function(connection){
                    play(connection, msg, server);
                });
        });
        
    } else if(msg.content.toLowerCase() === '?marvel'){

        const { randomCharacter } = marvel(config.marvel.public_key, config.marvel.private_key);

        randomCharacter()
            .then(character => {

                console.log(character);

                var img_url = character.thumbnail.substring(0, character.thumbnail.length - 18) + "portrait_incredible.jpg";

                msg.channel.send(new Discord.MessageEmbed()
                    .setTitle(character.name)
                    .setDescription(character.description)
                    .setImage(img_url)
                    .setColor('RED'));
                
            })
            .catch(error => console.log(error));

    }else if(msg.content.toLowerCase() === '?audio'){ 

        if(!msg.member.voice.channel){
            msg.reply('necesitas estar en un canal de voz.');
            return;
        }

        if(!servers[msg.guild.id]) servers[msg.guild.id] = {
            queue: []
        }

        var server = servers[msg.guild.id];

        cloudinary.v2.search
            .expression('folder:audios')
            .sort_by('public_id','desc')
            .execute().then(result => {
                    
                const url = result.resources[Math.floor(Math.random() * result.total_count)].url;

                server.queue.push(url);

                console.log(server.queue);
                msg.channel.send('Audio añadido a la cola.');

                if(client.voice.connections.size==0) msg.member.voice.channel.join().then(function(connection){
                    play(connection, msg, server);
                });

            });

    }else if(msg.content.toLowerCase() === '?stop'){

        var server = servers[msg.guild.id];
        
        if(msg.guild.voice.connection){
            for(var i= server.queue.length -1; i >= 0; i--){
                server.queue.splice(i, 1);
            }

            server.dispatcher.end();
            msg.channel.send('Cola parada, desconectando del canal de voz...');
            console.log('Cola parada');
        }

        if(msg.guild.voice.connection) msg.guild.voice.connection.disconnect();

    }else if(msg.content.toLowerCase().startsWith('?play')){

        if(msg.content.toLowerCase() === '?play' || msg.content.toLowerCase() === '?play '){
            msg.reply('necesitas poner un link.');
            return;
        }

        if(!msg.member.voice.channel){
            msg.reply('necesitas estar en un canal de voz.');
            return;
        }

        if(!servers[msg.guild.id]) servers[msg.guild.id] = {
            queue: []
        }

        var server = servers[msg.guild.id];

        server.queue.push(msg.content.split(" ")[1]);

        console.log(server.queue);
        msg.channel.send('Video añadido con éxito.');

        if(client.voice.connections.size==0) msg.member.voice.channel.join().then(function(connection){
            play(connection, msg, server);
        });

    }else if(msg.content.toLowerCase() === '?skip'){

        var server = servers[msg.guild.id];

        if(server.dispatcher) server.dispatcher.end();

        msg.channel.send('Saltando canción...');

    }else {
        msg.channel.send(`\`${msg.content}\` no existe.`);
    }

});

client.login(config.discord.token);

async function play(connection, msg, server){
    var server = servers[msg.guild.id];
    
    if(ytdl.validateURL(server.queue[0]))
        server.dispatcher = connection.play(ytdl(server.queue[0], {filter: "audioonly"}));
    else
        server.dispatcher = connection.play(server.queue[0]);

    server.queue.shift();

    server.dispatcher.on('finish', function(){
        if(server.queue[0]){
            setTimeout(() => {
                play(connection,msg);
            }, 1500);
        }else{
            connection.disconnect();
        }
    });
}

function memeFotosRandom(msg,result){

    const url = result.resources[Math.floor(Math.random() * result.total_count)].url;
    console.log(url);

    const image = new Discord.MessageAttachment(url);
    msg.channel.send(image);
}

function image(message){

    const query = message.content.substring(8);
 
    var options = {
        url: "http://results.dogpile.com/serp?qc=images&q=" + query,
        method: "GET",
        headers: {
            "Accept": "text/html",
            "User-Agent": "Chrome"
        }
    };
    
    request(options, function(error, response, responseBody) {
        if (error) {
            return;
        }
 
 
        $ = cheerio.load(responseBody);
 
 
        var links = $(".image a.link");
 
        var urls = new Array(links.length).fill(0).map((v, i) => links.eq(i).attr("href"));
       
        console.log(urls);
 
        if (!urls.length) {
            const embed = new Discord.MessageEmbed()
                .setTitle('Error:')
                .setColor('RED')
                .setDescription('No hay ninguna foto para => ' + query);
            message.channel.send(embed);
            return;
        }
 
        // Send result
        const embed = new Discord.MessageEmbed()
            .setTitle(query)
            .setImage(urls[Math.floor(Math.random() * urls.length)])
            .setColor('RANDOM')
            .setFooter(message.author.username, message.author.avatarURL());

        message.channel.send(embed);
    });
 
}