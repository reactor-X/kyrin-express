import TerminalMessages from '../TerminalMessages';
import * as readline from 'readline';
import * as mkdirp from 'mkdirp';
import * as path from 'path';
import * as fs from 'fs';
import * as yamlEngine from 'js-yaml';
export default class RoutesEngine {
    private static commandInterface;
    private registryName;
    private filePath;
    private URL;
    constructor(args) {
        this.performAction(args);
    }

    private performAction(args) {
        if (args.length < 1) {
            this.logUsageHelp();
            return;
        }
        switch (args[0]) {
            case 'generate': this.generate(args);
                break;
            case 'show': this.showRoutes();
        }
    }

    private generate(args) {
        if (args.length<2){
            this.logUsageHelp();
            return;
        }
        this.registryName = args[1];
        TerminalMessages.showWarn("Controller will be created inside src:controllers. e.g Home:index");
        RoutesEngine.commandInterface = readline.createInterface(process.stdin, process.stdout)
        RoutesEngine.commandInterface.setPrompt('Controller > ');
        RoutesEngine.commandInterface.prompt();
        RoutesEngine.commandInterface.on('line', function (line) {
            this.parseNext(line);
        }.bind(this));
    }
    private showRoutes() {
        let routes = this.parseRoutes();
        TerminalMessages.showSuccess('\n------------- ACTIVATED ROUTES WITHIN THE APPLICATION --------------\n\n')
        for (let route in routes) {
            TerminalMessages.showSuccess(route + '\t' + routes[route]['entry-point'] + '\t (Module :' + routes[route]['controller'] + ')');
        }
        TerminalMessages.showSuccess('\n\n--------------------------------------------------------------------');
    }
    private logUsageHelp() {
        TerminalMessages.showFail('\nValid routes subsystem command missing, did you mean one of these ?');
        TerminalMessages.showFail('routes generate <route_name> :(Generate new route)');
        TerminalMessages.showFail('routes show :(Show active routes)\n');
    }

    private generateDirectory(name, registryName, callback) {
        let tokens = name.split(':');
        let fileName = tokens[tokens.length - 1];
        tokens.pop();
        let dirPath = tokens.join(path.sep);
        this.filePath = path.join(process.cwd(), 'src', 'controllers', dirPath, fileName + 'Controller.ts');
        mkdirp(path.join(process.cwd(), 'src', 'controllers', dirPath), function (err) {
            if (err) TerminalMessages.showFail('\nUnable to create that directory. Make sure the path is valid.\n');
            else {
                let text = fs.readFileSync(path.join(__dirname, 'template', 'controller.template'), 'utf8');
                //Create relative path for container import within controller.
                text = text.replace('PATH', path.relative(path.dirname(this.filePath), path.join(process.cwd(), 'kyrin')));
                fs.readFile(this.filePath, (err, data) => {
                    if (err) { //File doesn't yet exist
                        try {
                            fs.writeFileSync(this.filePath, text, { flag: 'w' });
                            callback();
                        } catch (e) {
                            TerminalMessages.showFail('Unable to write to controllers directory. Make sure you have necessary permissions.');
                        }

                    } else {
                        TerminalMessages.showFail('That controller already exists.');
                    }
                });
            }
        }.bind(this));
    }

    private static getRoute(filePath, registryName) {
        TerminalMessages.showWarn("Enter relative web URL for controller , e.g /login (without trailing slash)");
        RoutesEngine.commandInterface.setPrompt('URL > ');
        RoutesEngine.commandInterface.prompt();
    }

    private registerRoute() {
        let routes = this.parseRoutes();
        let entryPoint = this.URL;
        let controllerPath = path.relative(path.join(process.cwd(), 'src', 'controllers'), this.filePath);
        if (routes[this.registryName] == null || typeof (routes[this.registryName]) == 'undefined') {
            routes[this.registryName] = {
                'entry-point': this.URL,
                'controller': controllerPath.replace('.ts', '')
            }
            fs.writeFile(path.join(process.cwd(), 'config', 'routing.yml'), yamlEngine.safeDump(routes), { flag: 'w' }, function (err) {
                if (!err) {
                    TerminalMessages.showSuccess('Controller has been created successfully.');
                    process.exit();
                } else {
                    TerminalMessages.showFail('Unable to write config/routing.yml. You may have to manually update the controller there.');
                }
            });
        } else {
            TerminalMessages.showFail("A controller is already registered as " + this.registryName);
            TerminalMessages.showFail(this.registryName + '\t' + routes[this.registryName]['entry-point'] + '\t (Module :' + routes[this.registryName]['controller'] + ')');

        }
    }

    private parseNext(line) {
        if (this.filePath == null) {
            this.generateDirectory(line, this.registryName, RoutesEngine.getRoute);
        }
        else if (this.URL == null) {
            this.URL = line;
            RoutesEngine.commandInterface.close();
            this.registerRoute();
        }
    }

    private parseRoutes() {
        try {
            return yamlEngine.safeLoad(fs.readFileSync(path.join(process.cwd(), "config", "routing.yml"), 'utf8'));
        } catch (e) {
            throw Error('Unable to open configuration file. You may need to manually register the controller in routing.yml.');
        }
    }

}