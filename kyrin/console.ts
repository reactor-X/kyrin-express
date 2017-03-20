import * as program from 'commander';
import MigrationEngine from './Console/MongoMigrator/MigrationEngine';
import RoutesEngine from './Console/Routes/RoutesEngine';
var isValid=false;
program
  .command('migrations')
  .description('Access migration subsystem. (migrations <command>)')
  .action(migrations);
  
  program.command('routes')
  .description('Access routes subsystem. (routes <command>)')
  .action(routes);
program.version("Kyrin-Express Alpha v0.1");
program.parse(process.argv);


if (program.rawArgs.length < 3) {
  console.log('\nNo subsystem specified.');
  program.outputHelp();
  process.exit(0);
}

//Depth of arguments 2 (node :1 , kyrin/console :2 , subsystem :3)
function migrations() {
  isValid=true;
  new MigrationEngine(program.rawArgs.splice(3));
}

function routes(){
  isValid=true;
  new RoutesEngine(program.rawArgs.splice(3));
}
if (isValid==false){
  program.outputHelp();
}

