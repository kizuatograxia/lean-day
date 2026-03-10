export interface User {
    id: string | number;
    name: string;
    email: string;
    picture?: string;
    [key: string]: any;
}
