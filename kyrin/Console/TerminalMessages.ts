import * as colors from 'colors/safe';
export default class TerminalMessages {

  public static showSuccess(msg: string) {
    console.log(colors.green(msg));
  }
  public static showFail(msg: string) {
    console.log(colors.red(msg));
  }
  public static showWarn(msg: string) {
    console.log(colors.yellow(msg));
  }
  public static showSimple(msg: string) {
    console.log(msg);
  }
}