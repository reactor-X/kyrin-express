import * as yamlEngine from "js-yaml";
import * as fs from "fs";
import * as path from "path";
import KLogger from "../Logging/KLogger";
/*
* This class is responsible for parsing services.yml file to generate service objects for the container.
* Environment mode is passed to the constructor and can be used to perform mode specific actions on demand.
*
*/

export class ServiceLoader {
    private services;
    private servicePrimitives;
    private static logger: KLogger;
    constructor(logger: KLogger) {
        ServiceLoader.logger = logger;
        this.services = [];
        this.servicePrimitives = [];
    }
    public getServices(serverDirectory: string) {
        this.parsePrimitives(serverDirectory);
        this.loadServices(serverDirectory);
        return this.services;
    }

    private parsePrimitives(serverDirectory: string) {
        try {
            this.servicePrimitives = yamlEngine.safeLoad(fs.readFileSync(path.join(serverDirectory, "config/services.yml"), 'utf8'));
        } catch (e) {
            ServiceLoader.logger.kErr("Error parsing service definitions from " + path.join(serverDirectory, "config/services.yml") + ". Please make sure file exists and is syntactically correct.", e);
            throw Error("Error parsing service definitions from " + path.join(serverDirectory, "config/services.yml") + ". Please make sure file exists and is syntactically correct.");
        }
    }

    private loadServices(serverDirectory: string) {
        try {
            for (let serviceKey in this.servicePrimitives) {
                this.services[serviceKey] = require(path.join(serverDirectory, "src/services/" + this.servicePrimitives[serviceKey].class));
            }
        }
        catch (ex) {
            ServiceLoader.logger.kErr("Service was declared in " + path.join(serverDirectory, "config/services.yml") + " but not found. Please make sure the definition for service exists.", ex);
            ServiceLoader.logger.kInfo("Terminating app due to error");
            throw Error("Service was declared in " + path.join(serverDirectory, "config/services.yml") + " but not found. Please make sure the definition for service exists. : " + ex);
        }
    }
}