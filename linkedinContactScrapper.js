let lkdn = require('./linkedin');
const readline = require("readline");
const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

let datas = {
        email : '',
        password : '',
        jobAndCompany : '',
        emailModel : ''
}

let contacts;

let getInput = (question, variable) =>{

        return new Promise(function(resolve, reject) {
                var ask = function() {
                  rl.question(question, function(answer) {
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
        await getInput("Entrer l'intitulé du poste recherché suivi de la société : ", 'jobAndCompany');
        await getInput("Entrer l'adresse email de référence : ", 'emailModel');

        // Initialize Browser and Loginvalentin_dnj@outlook.es

        await lkdn.initialize(datas);
        await lkdn.login(datas.email, datas.password);

        // Search and Scrape Contacts
        
        await lkdn.searchContacts(datas.jobAndCompany);
        await lkdn.scrapeResults();

})();