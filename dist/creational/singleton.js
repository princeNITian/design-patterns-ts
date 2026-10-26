"use strict";
/* Without Singleton

class AppConfig {
    constructor(private readonly apiBaseUrl: string) {}
}

const config1 = new AppConfig("https://api.example.com");
const config2 = new AppConfig("https://api.example.com");


console.log(config1 === config2); // false
*/
Object.defineProperty(exports, "__esModule", { value: true });
/* With Singleton */
class AppConfig {
    apiBaseUrl;
    static instance;
    constructor(apiBaseUrl) {
        this.apiBaseUrl = apiBaseUrl;
    }
    static getInstance() {
        if (!AppConfig.instance) {
            AppConfig.instance = new AppConfig("https://api.example.com");
        }
        return AppConfig.instance;
    }
}
const config1 = AppConfig.getInstance();
const config2 = AppConfig.getInstance();
console.log(config1 === config2); // true
