import { Event } from "../stores/event";

export class EventHelper {
    constructor( public src: string ) { }

    getEvent(action: any, description: string) : Event {
        return {
            src: this.src + ' | ' + action.type,
            description: description,
            previous: action.event
        }
    }
}