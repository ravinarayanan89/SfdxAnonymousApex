//Get the list of Records 
let fse= require('fs-extra');
let shell = require('shelljs');
const csv=require('csvtojson');
const chalk = require('chalk');
const log = console.log;
var jsonexport = require('jsonexport');
let userName = process.argv[2];

let recordIds = [];
let runApex = function(username){
    
    var cmd = 'sfdx force:apex:execute -f anonymousCodeOutput.cls -u '+username+'  --json';
    return new Promise(async (resolve, reject) => {
                let result = shell.exec(cmd,{silent:true}).stdout;
                result = JSON.parse(result);
                resolve(result);
    });

};

async function parseRecords(){
    
    return await csv()
     .fromFile('./src/source.csv')
     .then((jsonObj1)=>{        
            for(var item of jsonObj1){
                recordIds.push(item.Id);
            }
        });
}


(async() => {

    log(chalk.bgBlack.green.bold('Script Starting !! '));
  
        await parseRecords();

        let resultLogs = [];
        let count = 0;

        for (var item of recordIds) {

            log(chalk.red.bold('PROCESSING RECORD ... '+resultLogs.length));

            var code = fse.readFileSync('./anonymous.cls','utf-8');
            code = code.replace('{$recordId$}', item);
            fse.writeFileSync('./anonymousCodeOutput.cls',code);

            
                        log(chalk.greenBright.bold('Processing '+item));
                        try{

                            let result = await runApex(userName);
                            if(!result.result){
                                    console.log(result); //Compilation issue.
                                    process.exit();
                            }

                            if(result.result.success){
                                log(chalk.greenBright.bold('Completed Sucessfully '+item));
                                resultLogs.push({"Id":item,"ErrorMessage":"","isSuccess":true});
                            }
                            else{
                                let error = '';
                                if(result.result.compileProblem){
                                    error = result.result.compileProblem;
                                }else{
                                    error = result.result.exceptionMessage;
                                }
                                resultLogs.push({"Id":item,"ErrorMessage":error,"isSuccess":false});
                                log(chalk.red.bold('Error '+item+' '+error));
                            }

                            log(chalk.greenBright.bold('TOTAL RECORDS COMPLETED '+resultLogs.length));
                        }
                        catch(error){
                            log(chalk.red.bold('Error '+item+' '+error));
                        }   
            }

                count += 1;

            jsonexport(resultLogs, function(err, csv){ 
                if (err) return console.error(err);
                fse.outputFileSync('output.csv',csv);
                process.exit();
            });

})();


