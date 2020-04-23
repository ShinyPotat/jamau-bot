const cheerio = require('cheerio');
const request = require('request');

var cloudinary = require('cloudinary');
CLOUDINARY_URL = 'cloudinary://265713471968882:mJ1ZaPjMVB58RAES1MoysccFJTo@djyfxiile';
cloudinary.config({ 
    cloud_name: 'djyfxiile', 
    api_key: '265713471968882', 
    api_secret: 'mJ1ZaPjMVB58RAES1MoysccFJTo' 
});

const Discord = require('discord.js');
const client = new Discord.Client();

const token = 'NzAyMDgxNzMxMzA5NzMxODYw.XqFG_Q.6X6YvLPEK8b6q-9aErLlrs1iJNg';

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
  if (msg.content === '?help') {

    const embed = new Discord.MessageEmbed()
        .setColor('BLUE')
        .setTitle('Comandos:')
        .addField('?javi', 'Foto random de ShinyPotat')
        .addField('?emilio', 'Foto random de Sully')
        .addField('?jj', 'Foto random de NeNu')
        .addField('?bea', 'Foto random de rapature')
        .addField('?pablo', 'Foto random de pablo baiteado')
        .addField('?random "búsqueda"', 'Muestra una foto random de búsqueda');
    
    msg.channel.send(embed);

  }else if(msg.content.startsWith('?random')){

    if(msg.content === '?random'){
        msg.reply('necesitas poner un término de búsqueda.');
    }else{
        image(msg);
    } 

  }else if(msg.content === '?javi'){

    const url = cloudinary.v2.search
        .expression('folder:javi')
        .sort_by('public_id','desc')
        .execute().then(result => memeFotosRandom(msg,result));

  }else if(msg.content === '?emilio'){

    const url = cloudinary.v2.search
        .expression('folder:emilio')
        .sort_by('public_id','desc')
        .execute().then(result => memeFotosRandom(msg,result));

  }else if(msg.content === '?jj'){

    const url = cloudinary.v2.search
        .expression('folder:jj')
        .sort_by('public_id','desc')
        .execute().then(result => memeFotosRandom(msg,result));

  }else if(msg.content === '?bea'){

    const url = cloudinary.v2.search
        .expression('folder:bea')
        .sort_by('public_id','desc')
        .execute().then(result => memeFotosRandom(msg,result));

  }else if(msg.content === '?pablo'){

    const url = cloudinary.v2.search
        .expression('folder:pablo')
        .sort_by('public_id','desc')
        .execute().then(result => memeFotosRandom(msg,result));

  }

});

client.login(token);

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