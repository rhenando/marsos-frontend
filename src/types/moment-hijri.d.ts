// src/types/moment-hijri.d.ts
declare module "moment-hijri" {
  import * as moment from "moment";
  export = moment;
}

declare module "moment" {
  interface Moment {
    endOf(unitOfTime: "iMonth" | "iYear" | moment.unitOfTime.StartOf): Moment;
    iDate(): number;
    iMonth(): number;
    iYear(): number;
    format(format: string): string;
  }

  // Re-declare callable signature for imported default
  function moment(
    input?: moment.MomentInput,
    format?: string,
    strict?: boolean
  ): moment.Moment;
  namespace moment {}
  export = moment;
}
