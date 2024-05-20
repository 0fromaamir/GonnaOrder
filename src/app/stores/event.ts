export interface Event {
    src: string;
    description: string;
    previous?: Event;
}