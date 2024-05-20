import { Printers, PrintersList, AutoprintState } from '../printers';
import { PrintersAction, PrintersActionType } from './printers.actions';
import { combineReducers } from "@ngrx/store";

export interface PrintersState {
  printers: Printers;
}

export const printersInitialState: Printers = {
  list: {
    data: [],
    paging: { page: 0, size: 10 },
    totalPages: 0
  },
  autoprintState: {
    subscriptions: {},
    autoprintQueue: []
  }
}

export function autoprintState(autoprintState: AutoprintState = printersInitialState['autoprintState'], action: PrintersAction): AutoprintState {
  switch (action.type) {
    case PrintersActionType.UpdateAutoprintSubscriptions:
      return { ...autoprintState, subscriptions: action.subscriptions };
    case PrintersActionType.UpdateAutoprintQueue:
      return { ...autoprintState, autoprintQueue: action.autoprintQueue };
    default:
      return autoprintState;
  }
}

export function list(state: PrintersList = printersInitialState['list'], action: PrintersAction): PrintersList {

  switch (action.type) {
    case PrintersActionType.AddPrinter:
      var index = state.data.findIndex(printer => printer.url == action.newPrinter.url);
      if (index == -1) {
        state.data.push(action.newPrinter);
      }
      return state;
    case PrintersActionType.RemovePrinter:
      var index = state.data.findIndex(printer => printer.url == action.url);
      if (index == -1) {
        // console.log('No printer with the url exist: ', state.data, ' removing cancelled.');
      } else {
        state.data.splice(index, 1);
      }
      return state;
    case PrintersActionType.TogglePrinterAutoStatus:
      var index = state.data.findIndex(printer => printer.url === action.url);
      state.data[index].enabled = action.newStatus;
      return state;
    default:
      return state;
  }
}


const reducer: (state: Printers, action: PrintersAction) => Printers = combineReducers({
  list,
  autoprintState,
});

export function printersReducer(state: Printers = printersInitialState, action: PrintersAction): Printers {
  return reducer(state, action);
}
