import { LogLevel } from './LogLevel';

export class LogEntry {
  // Public Properties
  message = '';
  level: LogLevel = LogLevel.Debug;
  _extraInfo: any[] = [];
  date = new Date();
  private reservedWords = ['password', 'token', 'secret'];

  buildLogString(): string {
    let ret: string = this.date + ' - ';

    ret += 'Type: ' + this.level;
    ret += ' - Message: ' + this.message;
    if (this.extraInfo.length) {
      ret += ' - Extra Info: ' + this.formatParams(this.extraInfo);
    }

    return ret;
  }

  set extraInfo(value: any[]) {
    const clonedValue = JSON.parse(JSON.stringify(value));
    clonedValue?.forEach((v) => this.ofuscateReservedWords(v));
    this._extraInfo = clonedValue;
  }

  get extraInfo(): any[] {
    return this._extraInfo;
  }

  private ofuscateReservedWords(value: any): any {
    if (value !== null && typeof value === 'object') {
      Object.entries(value).forEach(([key, val]) => {
        if (this.reservedWords.some((word) => key.toLowerCase().includes(word))) {
          value[key] = '***';
        } else if (typeof val === 'object') {
          this.ofuscateReservedWords(val);
        }
      });
    }
  }

  private formatParams(params: any[]): string {
    let ret: string = params.join(',');

    // Is there at least one object in the array?
    if (params.some((p) => typeof p === 'object')) {
      let ret1 = '';

      try {
        // Build comma-delimited string
        for (const item of params) {
          ret1 += JSON.stringify(item, this.getCircularReplacer()) + ',';
        }
        ret = ret1;
      } catch (e) {}
    }

    return ret;
  }

  private getCircularReplacer() {
    const seen = new WeakSet();
    return (key: string, value: any) => {
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) {
          return;
        }
        seen.add(value);
      }
      return value;
    };
  }
}
