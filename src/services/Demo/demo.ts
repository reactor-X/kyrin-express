class Demo {
    public container = null;
    public sayHello() {
        return "Hello from the simple Demo service. You can find it as 'say-hello' in services.yml!";
    }
}
export = new Demo();