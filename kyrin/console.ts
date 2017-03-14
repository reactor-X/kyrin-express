#! /usr/bin/env node

'use strict';
import * as prompt from 'prompt';
import * as program from 'commander';
import MigrationEngine from './Console/MongoMigrator/MigrationEngine';
var colors = require('colors/safe');
var slug = require('slug');
var path = require('path');

program
  .command('migrations')
  .description('Access migration subsystem. (migrations:<command>)')
  .action(migrations);
program.version("Kyrin-Express Alpha v0.0");
program.parse(process.argv);


if (program.rawArgs.length < 3) {
  console.log('\nNo subsystem specified.');
  program.outputHelp();
  process.exit(0);
}

//Depth of arguments 2 (node :1 , kyrin/console :2 , subsystem :3)

function error(msg) {
  console.error(colors.red(msg));
  process.exit(1);
}

function success(msg) {
  console.log(colors.green(msg));
}
function puts(error, stdout, stderr) { console.log(stdout); console.error(stderr);}

function migrations() {
    new MigrationEngine(program.rawArgs.splice(3));
}

