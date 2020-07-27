var readline = require('readline');
var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
/*
rl.stdoutMuted = true;

rl.question('Password: ', function(password) {
  console.log('\nPassword is ' + password);
  rl.close();
});

rl._writeToOutput = function _writeToOutput(stringToWrite) {
  if (rl.stdoutMuted)
    rl.output.write("*");
  else
    rl.output.write(stringToWrite);
};
*/

const datas = {
  email : '',
  password : '',
  job: '',
  company: '',
  emailModel : ''
}

let getInput = (question, variable) =>{

  return new Promise(function(resolve, reject) {

          var ask = function() {

            if(variable==='password'){
              console.log('Entrez le mot de passe')
              rl.stdoutMuted = true;
            } else {
              rl.stdoutMuted = false;
            }

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

(async()=>{
  await getInput("Entrer l'adresse email LinkedIn : ", 'email');
  await getInput("Entrer le mdp LinkedIn : ", 'password');
  await getInput("Entrer l'intitulé du poste recherché: ", 'job');
  await getInput("Entrer la société recherchée: ", 'company');
  await getInput("Entrer l'adresse email de référence au format p1n*@dipostel.com : ", 'emailModel');
})();