
class Demo {
    public container;
    public sayHello() {
        console.log(this.container);
        return "Hello from the simple Demo service. You can find it as 'say-hello' in services.yml!";
    }
}
export = new Demo();