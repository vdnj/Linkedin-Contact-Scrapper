const lkdn = require('./linkedin');
const readline = require("readline");
const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
const fs = require('fs');

const datas = {
        email : '',
        password : '',
        job: '',
        company: '',
        filters: '',
        emailModel : ''
}

let getInput = (question, variable) =>{

        return new Promise(function(resolve, reject) {
 
          // Block to hide pass
          if(variable==='password'){
            console.log('\nEntrez le mot de passe :')
            rl.stdoutMuted = true;
          } else {
            rl.stdoutMuted = false;
          }

                var ask = function() {

                  // Block to hide pass
                  rl.question(question, function(answer) {
                    rl._writeToOutput = function _writeToOutput(stringToWrite) {
                      if (rl.stdoutMuted){
                        rl.output.write("*");
                      }else{
                        rl.output.write(stringToWrite);
                      }
                    };

                    if (answer) {
                      resolve(answer, reject);
                      datas[variable] = answer;
                    } else {
                      ask();
                    }
                  });
                };
                ask();
              });

}

(async ()=>{

        // Get Required Inputs
        await getInput("\nEntrer l'adresse email LinkedIn : ", 'email');
        await getInput("\nEntrer le mdp LinkedIn : ", 'password');
        await getInput("\nEntrer l'intitulé du poste recherché: ", 'job');
        await getInput("\nEntrer la société recherchée: ", 'company');
        await getInput("\nEntrer le numéro des cases à cocher dans le filtre 'Entreprise actuelle', séparé par des espaces.\n S'il n'y a pas de filtre, tapez NA: ", 'filters');
        await getInput("\nEntrer l'adresse email de référence au format p1n*@dipostel.com : ", 'emailModel');

        // Initialize Browser and Login
        await lkdn.initialize(datas);
        await lkdn.login(datas);

        // Search and Scrape Contacts
        let contacts;
        try{
          await lkdn.searchContacts(datas);
          if(datas.filters!=='NA'){
            await lkdn.applyFilters(datas);
          }
          contacts = await lkdn.scrapeResults(datas);
          await lkdn.disconnect();
        } catch(e) {
          console.log(e);
          await lkdn.disconnect();
        }

        // Create JSON file
        fs.writeFile('contacts.json', JSON.stringify(contacts), (err) => {
          if (err) throw err;
        });

        // Fermeture du process
        let closeProcess = () =>{
          return process.exit(0);
        }
        setTimeout(closeProcess,3000);

})();