import * as path from 'path';
import * as fs from 'fs';
import mongoose = require('mongoose');
import * as mkdirp from 'mkdirp';
import AppContainer from '../../Core/ContainerLoader'; //Container to get current configuration.
import MongoConnection from '../../ODM/MongoDB/MongoConnection';
import TerminalMessages from '../TerminalMessages';
import bluebirdPromise = require("bluebird");

export default class MigrationEngine {

  private args;
  private connections;
  private connectionsConfig: Array<Object>;

  constructor(args) {
    this.connections = [];
    this.connectionsConfig = [];
    this.args = args;
    let all_connections = new AppContainer('dev', process.cwd(), false).getConfig('application')['connections'];
    for (let connection in all_connections) {
      if (all_connections[connection]['type'] == 'mongo') { //Push only mongo type connections into possible target array.
        this.connections.push(connection);
        this.connectionsConfig[connection] = all_connections[connection];
      }
    }
    this.performAction();
  }
  private logUsageHelp() {
    TerminalMessages.showFail('\nValid migration subsystem command missing, did you mean one of these ?');
    TerminalMessages.showFail('migrations generate <connection_name> [migration-name (optional)]');
    TerminalMessages.showFail('migrations migrate <connection_name> <direction> <migration-name>\n');
  }

  private performAction() {
    if (this.args.length == 0) {
      this.logUsageHelp();
    }
    else {
      switch (this.args[0]) {
        case 'generate': this.generate();
          break;
        case 'migrate': this.migrate();
          break;
        default: this.logUsageHelp();
      }
    }
  }

  private generate() {
    let connection_name = this.args[1];
    if ((typeof connection_name) == 'undefined') {
      TerminalMessages.showFail('No connection specified for migration generator.');
      this.logUsageHelp();
      return;
    }
    if (this.connections.indexOf(connection_name) == -1) {
      TerminalMessages.showFail("Couldn't find " + connection_name + " in connections configuration. (Typo? / Unregistered connection?)");
      this.logUsageHelp();
      return;
    }

    //Create directory and configuration file if not exists
    let configPath = path.join(process.cwd(), 'migrations', connection_name, 'kyrin.migrate.json');
    var CONFIG;
    let config_exists = false;
    if (fs.existsSync(configPath)) {
      CONFIG = require(configPath);
      config_exists = true;
    }
    else {
      CONFIG = {
        basepath: 'patches',
        connection: MongoConnection.getConnectionString(this.connectionsConfig[connection_name]),
        current_timestamp: 0,
        models: {}
      };
    }
    mkdirp(path.join(process.cwd(), 'migrations', connection_name, 'patches'), function (err) {
      if (err) TerminalMessages.showFail('Unable to create migration directories. Please, make sure you have permissions.');
      //Create configuration file if not exists.
      let configData = JSON.stringify(CONFIG, null, 2);
      fs.writeFileSync(configPath, configData);
      //Generate migration 
      let timestamp = Date.now();
      let migrationName = (typeof this.args[2] == 'undefined') ? timestamp + '.js' : timestamp + '-' + this.args[2] + '.js';
      let template = path.join(__dirname, 'template', 'migration.template');
      let filename = path.join(process.cwd(), 'migrations', connection_name, 'patches', migrationName);
      let data = fs.readFileSync(template);
      fs.writeFileSync(filename, data, { flag: 'w' });
      TerminalMessages.showSuccess('Generated new migration ' + migrationName + ' for ' + connection_name + ".");
    }.bind(this));

  }
  private migrate() {
    let connection_name = this.args[1];
    let direction = this.args[2];
    let migration_name = this.args[3];
    if ((typeof connection_name) == 'undefined') {
      TerminalMessages.showFail('No connection specified for migration.');
      this.logUsageHelp();
      return;
    }
    if (this.connections.indexOf(connection_name) == -1) {
      TerminalMessages.showFail("Couldn't find " + connection_name + " in connections configuration. (Typo? / Unregistered connection?)");
      this.logUsageHelp();
      return;
    }
    if ((typeof migration_name) == 'undefined' && direction == 'down') {
      TerminalMessages.showFail('You must provide name of migration to rollback.');
      return;
    }
    if (direction !== 'down') {
      direction = 'up';
    }
    //Load configuration file.
    let configPath = path.join(process.cwd(), 'migrations', connection_name);
    let configFilePath = path.join(configPath, 'kyrin.migrate.json');
    var CONFIG;
    try {
      CONFIG = require(path.relative(__dirname, configFilePath));
      new MigrationRunner(CONFIG, migration_name, direction, configPath, connection_name);
    } catch (ex) {
      TerminalMessages.showFail("No migration registry exists for " + connection_name + " yet. You can create it using 'migrations create " + connection_name + "'");
      return;
    }
  }
}

class MigrationRunner {
  private direction;
  private targetName;
  private static config;
  private configPath;
  private migrations;
  private connectionName;
  constructor(config, targetName, direction, configPath, connectionName) {
    MigrationRunner.config = config;
    this.targetName = targetName;
    this.direction = direction;
    this.configPath = configPath;
    this.connectionName = connectionName;
    this.execute();
  }
  private execute() {
    let CONFIG = MigrationRunner.config;
    var name_of_migration_file = null;
    var number_of_migrations = null;
    if (this.targetName !== null && this.targetName !== '' && (typeof (this.targetName)) !== 'undefined') {
      name_of_migration_file = this.targetName;
      number_of_migrations = 1;
    } else if (this.direction == 'down' && (typeof (this.targetName)) === 'undefined') {
      TerminalMessages.showFail('Migration name is mandatory while rolling back.'); //Stop down migration in case of no name specified.
      return;
    }else if (this.direction=='up' && (typeof (this.targetName)) === 'undefined'){
      TerminalMessages.showWarn('No name specified for up migration. Executing all new migrations...');
    }
    this.migrations = fs.readdirSync(path.join(this.configPath, CONFIG.basepath));

    //Get the exact migration if the name is specified.
    if (name_of_migration_file !== null) {
      this.migrations = this.migrations.filter(function (filename) {
        return name_of_migration_file === filename.split('.js')[0];
      });
    }
    if (typeof name_of_migration_file !== 'undefined' && this.migrations.length == 0) {
      TerminalMessages.showFail('\nCannot find that migration (' + name_of_migration_file + ').\n');
      return;
    }

    //Get migration files based on direction
    this.migrations = this.migrations.filter(function (migration_name) {
      let timestamp = this.getTimeStampFromFileName(migration_name);
      if (this.direction == 'up') {
        return timestamp > CONFIG.current_timestamp;
      } else if (this.direction == 'down') {
        return timestamp <= CONFIG.current_timestamp;
      }
      else return false;
    }.bind(this));
    if (this.migrations.length == 0) {
      number_of_migrations = 0;
      console.log('\nNo migrations to execute.\n');
      return;
    }
    this.chainMigrations(this.migrations.length);
  }

  private updateTimestamp(timestamp, callback) {
    MigrationRunner.config.current_timestamp = timestamp;
    let data = JSON.stringify(MigrationRunner.config, null, 2);
    fs.writeFile(path.join(this.configPath, 'kyrin.migrate.json'), data, callback);
  }
  private getTimeStampFromFileName(name: string) {
    return parseInt((name.split('-'))[0]);
  }

  private loadModel(modelName) {
    try {
      return require(path.relative(__dirname, path.join(process.cwd(), 'src', 'model', 'schema', MigrationRunner.config.models[modelName]))); //Models are defined under models/schema
    } catch (ex) {
      TerminalMessages.showFail('Unable to load model ' + modelName + '. Please, make sure it exists under schema directory and is valid.');
      console.log(ex.stack);
      process.exit;
    }
  }

  private chainMigrations(number_of_migrations) {
    if (number_of_migrations > 0) {
      this.migrateAtomic(this.migrations.shift(), function () {
        number_of_migrations--;
        if (number_of_migrations !== 0) {
          this.chainMigrations(number_of_migrations);
        }
        else {
          mongoose.disconnect();
        }
      }.bind(this));
    }
  }

  private migrateAtomic(migration, callback) {
    var migration_instance;
    try {
      migration_instance = require(path.join(process.cwd(), 'migrations', this.connectionName, MigrationRunner.config.basepath, migration));
    } catch (ex) {
      TerminalMessages.showFail('Error while loading migration file ' + migration);
      process.exit();
    }
    mongoose.Promise = bluebirdPromise;
    mongoose.connect(MigrationRunner.config.connection, { server: { reconnectTries: 60 } }).catch(function (err) {
      if (err){
        TerminalMessages.showFail('Unable to establish connection to database');
        return;
      }else{
      let timestamp = this.getTimeStampFromFileName(migration);
      TerminalMessages.showSuccess('\nApplying migratsion ' + migration + ' - ' + this.direction);
      migration_instance[this.direction].call({
        model: this.loadModel
      }, function () {
        mongoose.disconnect();
        if (this.direction == 'down')
          timestamp--;  //Reduce timestamp to down migrate.
        this.updateTimestamp(timestamp, callback);
      }.bind(this));
     }
    }.bind(this));

  }


}
