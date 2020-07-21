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
                    variable = answer;
                    if (variable) {
                      resolve(variable, reject);
                      datas[variable] = variable;
                    } else {
                      ask();
                    }
                  });
                };
                ask();
              });

}

(async ()=>{

        await getInput("Entrer l'adresse email LinkedIn : ", 'email');
        await getInput("Entrer le mdp LinkedIn : ", 'password');
        await getInput("Entrer l'intitulé du poste recherché suivi de la société : ", 'jobAndCompany');
        await getInput("Entrer l'adresse email de référence : ", 'emailModel');

        await lkdn.initialize();
        await lkdn.login(datas.email, datas.password);

})();