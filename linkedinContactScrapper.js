let lkdn = require('./linkedin');
let xls = require('./xlsFilling');
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

        // Initialize Browser and Login
        await lkdn.initialize(datas);
        await lkdn.login(datas.email, datas.password);

        // Search and Scrape Contacts
        await lkdn.searchContacts(datas.jobAndCompany);
        
        

})();