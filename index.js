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
        .addField('\`?audio\`', 'Audio al azar para reirte un rato');

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

        if (msg.member.voice.channel) { 

            const connection = await msg.member.voice.channel.join();

            request('https://www.googleapis.com/youtube/v3/search?part=id&channelId=UCSJ-0mjl0PaNKq6vuvrXOPA&key='+config.youtube.key+'&type=video',
                { json: true }, (err, res, body) => {
                
                if (err) { return console.log(err); }

                console.log(body);

                const url = "https://www.youtube.com/watch?v=" + body.items[Math.floor(Math.random() * body.pageInfo.resultsPerPage)].id.videoId;

                console.log('La url del video es: ' + url);    
             
                connection.play(ytdl(url, { filter: 'audioonly' }));

                msg.channel.send('Reproduciendo: ' + url);

            });
            
        } else {
            msg.reply('necesitas estar en un canal de voz primero.');
        }
        
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

        if (msg.member.voice.channel) { 

            const connection = await msg.member.voice.channel.join();

            const urls = cloudinary.v2.search
                .expression('folder:audios')
                .sort_by('public_id','desc')
                .execute().then(result => {

                    console.log(result);
                    
                    const url = result.resources[Math.floor(Math.random() * result.total_count)].url;

                    console.log(url);

                    connection.play(url);

                    msg.delete();

            });
            
        } else {
            msg.reply('necesitas estar en un canal de voz primero.');
        }

    }else {
        msg.channel.send(`\`${msg.content}\` no existe.`);
    }

});

client.login(config.discord.token);

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