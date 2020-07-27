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
        emailModel : ''
}

let getInput = (question, variable) =>{

        return new Promise(function(resolve, reject) {
 
          // Block to hide pass
          if(variable==='password'){
            console.log('Entrez le mot de passe :')
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
        await getInput("Entrer l'adresse email LinkedIn : ", 'email');
        await getInput("Entrer le mdp LinkedIn : ", 'password');
        await getInput("Entrer l'intitulé du poste recherché: ", 'job');
        await getInput("Entrer la société recherchée: ", 'company');
        await getInput("Entrer l'adresse email de référence au format p1n*@dipostel.com : ", 'emailModel');

        // Initialize Browser and Login
        await lkdn.initialize(datas);
        await lkdn.login(datas);

        // Search and Scrape Contacts
        await lkdn.searchContacts(datas);
        let contacts = await lkdn.scrapeResults(datas);

        // Create JSON file
        fs.writeFile('contacts.json', JSON.stringify(contacts), (err) => {
          if (err) throw err;
        });
})();
